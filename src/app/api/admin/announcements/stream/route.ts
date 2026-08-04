import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/server/auth/jwt";
import { announcementService } from "@/server/services/announcement.service";
import { guestPresenceHub } from "@/server/services/guest-presence-hub";
import { fail } from "@/server/utils/response";

export const runtime = "nodejs";

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return fail("Unauthorized", 401);

  try {
    await verifyAccessToken(token);
  } catch {
    return fail("Invalid or expired token", 401);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      const unsubscribe = guestPresenceHub.subscribe((counts) => {
        send({ type: "counts", ...counts });
      });

      void announcementService.getLiveCounts().then((counts) => {
        send({ type: "counts", ...counts });
      });

      const pingTimer = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 25000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(pingTimer);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
