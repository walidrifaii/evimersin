import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { closePool } from "@/server/database/connection";
import { mediaRepository } from "@/server/database/repositories/media.repository";
import { loadEnv } from "./load-env";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "storage", "uploads");
}

async function collectFiles(root: string, prefix = ""): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(path.join(root, prefix), { withFileTypes: true });
  } catch {
    return [];
  }

  const found: string[] = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      found.push(...(await collectFiles(root, relative)));
    } else if (CONTENT_TYPES[path.extname(entry.name).toLowerCase()]) {
      found.push(relative);
    }
  }
  return found;
}

async function main() {
  loadEnv();

  const roots = [
    getUploadRoot(),
    path.join(process.cwd(), "public", "uploads"),
  ];

  const existing = new Set(await mediaRepository.listPaths());
  let imported = 0;
  let skipped = 0;

  for (const root of roots) {
    const files = await collectFiles(root);
    if (files.length === 0) continue;

    console.log(`\nScanning ${root} (${files.length} files)`);

    for (const relative of files) {
      const urlPath = `/uploads/${relative}`;
      if (existing.has(urlPath)) {
        skipped += 1;
        continue;
      }

      const data = await readFile(path.join(root, relative));
      await mediaRepository.save({
        path: urlPath,
        contentType:
          CONTENT_TYPES[path.extname(relative).toLowerCase()] ??
          "application/octet-stream",
        data,
      });
      existing.add(urlPath);
      imported += 1;
      console.log(`  imported ${urlPath} (${data.byteLength} bytes)`);
    }
  }

  console.log(`\nDone. Imported ${imported}, already present ${skipped}.`);
  await closePool();
}

main().catch((error) => {
  console.error("Failed to backfill media:", error);
  process.exit(1);
});
