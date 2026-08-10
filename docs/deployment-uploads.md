# Upload storage on production

Hero slider images, product photos, and category images are saved on the **server disk**, not inside the database.

## Why slider images disappear after deploy

1. You upload a slide in the dashboard → file is saved to `storage/uploads/hero-slides/`
2. The site shows the image immediately
3. You **redeploy** or the server **restarts** → the container filesystem is wiped
4. The database still has the slide row, but the **file is gone** → the site shows gray **"No image"** or falls back to the default hero

This is expected if uploads are not stored on a **persistent volume**.

## Fix (required for production)

### Docker / Easypanel

Mount a persistent volume to the upload directory:

| Path in container | Purpose |
|-------------------|---------|
| `/app/storage/uploads` | All runtime uploads |

Or set environment variable:

```env
UPLOAD_DIR=/data/uploads
```

…and mount `/data/uploads` as a persistent volume.

### After mounting storage

1. **Re-upload** hero slides (and any other images uploaded before the volume existed)
2. Redeploy — images should survive restarts

## Verify

Open an uploaded image directly in the browser:

```text
https://your-domain.com/uploads/hero-slides/your-file.jpg
```

- **200 + image shows** → file exists, slider should work
- **404** → file missing; re-upload or fix volume mount

## Environment variables

| Variable | Example | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://evimersin.com` | Must match live domain at **build time** |
| `UPLOAD_DIR` | `/data/uploads` | Optional; default is `./storage/uploads` |
