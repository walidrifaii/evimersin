import { NextResponse } from "next/server";
import { readUploadContent } from "@/server/utils/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/** Serves `/uploads/...` from the database, the disk cache, or seeded assets. */
export async function GET(_request: Request, context: RouteContext) {
  const { path: parts } = await context.params;
  if (!parts?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const relativeUrl = `/uploads/${parts.map(decodeURIComponent).join("/")}`;
  const content = await readUploadContent(relativeUrl);

  if (!content) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(content.buffer), {
    status: 200,
    headers: {
      "Content-Type": content.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(content.buffer.byteLength),
    },
  });
}
