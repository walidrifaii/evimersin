import { compose, withHandler } from "@/server/middleware";
import { settingsService } from "@/server/services/settings.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 30;

export const GET = compose(withHandler)(async () => {
  const data = await settingsService.get();
  return NextResponse.json(
    { success: true, data },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    },
  );
});
