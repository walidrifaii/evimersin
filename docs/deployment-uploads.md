# Upload storage on production

Hero slider images, product photos, and category icons are saved on **server disk**, not in the database.

## Why images disappear after deploy

1. You upload in the dashboard → file is saved to `storage/uploads/…`
2. The site shows the image immediately
3. You **redeploy** or the container **restarts** → container disk is wiped
4. The database still has the row/path, but the **file is gone** → "No image" or hero fallback

This is normal Docker behavior unless you attach **persistent storage**.

---

## Fix on Easypanel (evimersin.co)

### 1. Use the Dockerfile deploy

Build from the repo `Dockerfile` (not a plain `npm start` / Nixpacks start that runs `next start`).

Start command must be:

```text
node server.js
```

(the Dockerfile already sets this)

### 2. Add a persistent volume

In your Easypanel app → **Volumes** (or Storage):

| Setting | Value |
|---------|--------|
| **Mount path (in container)** | `/app/storage/uploads` |
| **Volume** | Create a new persistent volume |

### 3. Environment variables

| Variable | Example | Required |
|----------|---------|----------|
| `UPLOAD_DIR` | `/app/storage/uploads` | Recommended (set in Dockerfile too) |
| `NEXT_PUBLIC_APP_URL` | `https://evimersin.co` | Yes — at **build** time |

### 4. Redeploy, then re-upload once

Files uploaded **before** the volume existed are already lost. After the volume is mounted:

1. Redeploy
2. Re-upload hero slides and any missing product/category images
3. Redeploy again — images should **stay**

### 5. Verify

While logged in to the dashboard, open:

```text
https://evimersin.co/api/admin/storage
```

Check the response:

| Field | Expected |
|-------|----------|
| `uploadRoot` | `/app/storage/uploads` |
| `writable` | `true` |
| `storageCounts` | grows after each upload |

If `writable` is `false`, the mounted volume is root-owned but the app runs as uid `1001`.
Fix it from the container shell:

```bash
chown -R 1001:1001 /app/storage/uploads
```

You can also check a single file directly:

```text
https://evimersin.co/uploads/hero-slides/your-file.png
https://evimersin.co/api/media/hero-slides/your-file.png
```

- **200 + image** → storage works
- **404** → file missing; re-upload or check volume mount

> Seed images in `public/uploads/` always return 200 because they ship inside the image.
> Only files under `storage/uploads/` depend on the volume, so test with a file you uploaded.

---

## Docker Compose (local / VPS)

See `docker-compose.yml` in the repo root — the named volume `evimersin_uploads` keeps uploads across restarts.

---

## Technical details

| Path in container | Purpose |
|-------------------|---------|
| `/app/storage/uploads` | All runtime uploads (hero-slides, products, categories) |
| `public/uploads` | Built-in seed/demo assets only (inside the image) |

Upload code: `src/server/utils/upload.ts` → `getUploadRoot()` uses `UPLOAD_DIR` or `./storage/uploads`.
