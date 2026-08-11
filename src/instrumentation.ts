export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getUploadRoot } = await import("@/server/utils/upload");
  const uploadRoot = getUploadRoot();

  console.log(`[evimersin] Upload storage: ${uploadRoot}`);
  console.log(
    "[evimersin] Mount a persistent volume on this path (Easypanel → Volumes). " +
      "Without it, redeploys delete uploaded hero slides and product images.",
  );
}
