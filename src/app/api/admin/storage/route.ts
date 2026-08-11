import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { compose, withAuth, withHandler } from "@/server/middleware";
import { mediaRepository } from "@/server/database/repositories/media.repository";
import { ok } from "@/server/utils/response";
import { getPublicUploadRoot, getUploadRoot } from "@/server/utils/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_FOLDERS = [
  "hero-slides",
  "products",
  "products/gallery",
  "categories",
];

async function countFiles(root: string, folder: string) {
  try {
    const entries = await readdir(path.join(root, folder), {
      withFileTypes: true,
    });
    return entries.filter((entry) => entry.isFile()).length;
  } catch {
    return 0;
  }
}

/** Writes and deletes a temp file so a mounted volume with bad permissions is caught. */
async function probeWritable(root: string) {
  const probe = path.join(root, `.write-probe-${Date.now()}`);
  try {
    await mkdir(root, { recursive: true });
    await writeFile(probe, "ok");
    await unlink(probe);
    return { writable: true, error: null as string | null };
  } catch (error) {
    return {
      writable: false,
      error: error instanceof Error ? error.message : "Unknown write error",
    };
  }
}

export const GET = compose(withAuth, withHandler)(async () => {
  const uploadRoot = getUploadRoot();
  const publicRoot = getPublicUploadRoot();

  const [{ writable, error }, rootStat] = await Promise.all([
    probeWritable(uploadRoot),
    stat(uploadRoot).catch(() => null),
  ]);

  const storageCounts = Object.fromEntries(
    await Promise.all(
      UPLOAD_FOLDERS.map(
        async (folder) => [folder, await countFiles(uploadRoot, folder)] as const,
      ),
    ),
  );

  const seedCounts = Object.fromEntries(
    await Promise.all(
      UPLOAD_FOLDERS.map(
        async (folder) => [folder, await countFiles(publicRoot, folder)] as const,
      ),
    ),
  );

  const totalStored = Object.values(storageCounts).reduce((sum, n) => sum + n, 0);

  let databaseCount: number | null = null;
  let databaseError: string | null = null;
  try {
    databaseCount = (await mediaRepository.listPaths()).length;
  } catch (dbError) {
    databaseError =
      dbError instanceof Error ? dbError.message : "Unknown database error";
  }

  return ok({
    // Uploads live in MySQL, so a missing volume no longer loses images.
    durableStore: "database",
    databaseCount,
    databaseError,
    uploadRoot,
    uploadDirEnv: process.env.UPLOAD_DIR ?? null,
    cwd: process.cwd(),
    diskCacheExists: rootStat !== null,
    diskCacheWritable: writable,
    diskCacheError: error,
    storageCounts,
    seedCounts,
    totalStored,
  });
});
