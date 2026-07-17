import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/server/docs/openapi";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getOpenApiDocument());
}
