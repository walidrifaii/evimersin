# Upload storage on production

Hero slider images, product photos, and category icons are stored in **MySQL**
(the `media_files` table), not on the container disk.

## Why this design

Container disks are wiped on every redeploy. Previously an upload was written to
`storage/uploads/…`, the database kept only the path, and after a redeploy the
row still pointed at a file that no longer existed — producing "No image"
placeholders and a hero slider that fell back to the default banner.

Since the database already persists, storing the bytes there removes the problem
entirely. **No volume mount is required.**

---

## How it works

| Step | What happens |
|------|--------------|
| Upload | Bytes are written to `media_files`, keyed by `/uploads/products/<uuid>.jpg` |
| Disk copy | The same bytes are also written to `storage/uploads/…` as a cache. Failure here is logged, not fatal |
| Serving | `/uploads/...` and `/api/media/...` read the database first, then the disk cache, then the seed assets in `public/uploads` |
| Delete | Removing a product or replacing an image deletes both the row and the cached file |

The `media_files` table is created automatically on first use, so there is no
migration step.

Code: `src/server/utils/upload.ts`, `src/server/database/repositories/media.repository.ts`

---

## Deploying

Nothing special is needed beyond the usual database environment variables.

| Variable | Example | Required |
|----------|---------|----------|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | — | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://evimersin.co` | Yes — at **build** time |
| `UPLOAD_DIR` | `/app/storage/uploads` | Optional — only sets the cache location |

A mounted volume is now optional. It only makes repeat reads skip the database.

---

## Importing files that already exist on disk

To copy files from `storage/uploads/` and `public/uploads/` into the database:

```bash
npm run media:backfill
```

The script is idempotent — it skips anything already stored. Run it against the
production database to make the seeded images durable.

> Files deleted by an earlier redeploy are gone for good and must be re-uploaded.

---

## Verify

While logged in to the dashboard, open:

```text
https://evimersin.co/api/admin/storage
```

| Field | Meaning |
|-------|---------|
| `databaseCount` | Number of images stored durably. Should grow with each upload |
| `databaseError` | Should be `null`. Anything else means the table is unreachable |
| `diskCacheWritable` | `false` is acceptable — serving still works from the database |

You can also request a file directly:

```text
https://evimersin.co/uploads/products/<uuid>.jpg
https://evimersin.co/api/media/products/<uuid>.jpg
```

- **200 + image** → stored and served correctly
- **404** → the file was never imported; re-upload it

---

## Notes

- Max upload size is 5 MB (`MAX_IMAGE_SIZE` in `src/server/utils/upload.ts`).
  MySQL's `max_allowed_packet` must exceed this; the MySQL 8 default of 64 MB is
  plenty.
- Responses are sent with `Cache-Control: immutable`, and filenames are UUIDs,
  so the database is hit rarely in practice.
