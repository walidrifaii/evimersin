import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  getUploadContentType,
  resolveUploadFile,
} from "@/server/utils/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/** Serves `/uploads/...` from durable storage (and seeded public/uploads). */
export async function GET(_request: Request, context: RouteContext) {
  const { path: parts } = await context.params;
  if (!parts?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const relativeUrl = `/uploads/${parts.map(decodeURIComponent).join("/")}`;
  const absolutePath = await resolveUploadFile(relativeUrl);

  if (!absolutePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readFile(absolutePath);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": getUploadContentType(absolutePath),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buffer.byteLength),
    },
  });
}
