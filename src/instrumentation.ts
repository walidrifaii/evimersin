export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getUploadRoot } = await import("@/server/utils/upload");

  console.log(
    "[evimersin] Uploads are stored in the database (media_files) and cached at " +
      `${getUploadRoot()}. Images survive redeploys without a mounted volume.`,
  );
}
