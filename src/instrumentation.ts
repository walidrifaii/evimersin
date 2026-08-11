export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { mkdir, writeFile, unlink } = await import("node:fs/promises");
  const path = await import("node:path");
  const { getUploadRoot } = await import("@/server/utils/upload");
  const uploadRoot = getUploadRoot();

  console.log(`[evimersin] Upload storage: ${uploadRoot}`);

  // A freshly mounted volume is often root-owned, so the app user cannot write to it.
  const probe = path.join(uploadRoot, `.write-probe-${Date.now()}`);
  try {
    await mkdir(uploadRoot, { recursive: true });
    await writeFile(probe, "ok");
    await unlink(probe);
    console.log("[evimersin] Upload storage is writable.");
  } catch (error) {
    console.error(
      `[evimersin] Upload storage is NOT writable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    console.error(
      "[evimersin] New uploads will fail. Fix volume permissions, e.g. " +
        `chown -R 1001:1001 ${uploadRoot}`,
    );
  }

  if (!process.env.UPLOAD_DIR) {
    console.warn(
      "[evimersin] UPLOAD_DIR is not set — uploads use a path relative to the working " +
        "directory and are deleted on redeploy unless a volume is mounted there.",
    );
  }
}
