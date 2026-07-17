import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { verifyAccessToken } from "@/server/auth/jwt";
import { AppError, isAppError } from "@/server/utils/errors";
import { fail } from "@/server/utils/response";
import type { AuthTokenPayload } from "@/server/types/admin.types";

export type ApiContext = {
  params: Promise<Record<string, string>>;
  admin?: AuthTokenPayload;
};

export type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
) => Promise<NextResponse>;

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body", 400);
  }
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("Validation failed", 422, parsed.error.flatten());
  }
  return parsed.data;
}

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    const token = getBearerToken(request);
    if (!token) return fail("Unauthorized", 401);

    try {
      const admin = await verifyAccessToken(token);
      return handler(request, { ...context, admin });
    } catch {
      return fail("Invalid or expired token", 401);
    }
  };
}

export function withHandler(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (isAppError(error)) {
        return fail(error.message, error.status, error.details);
      }

      console.error("[API ERROR]", error);
      return fail("Internal server error", 500);
    }
  };
}

export function compose(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
  return (handler: ApiHandler) => middlewares.reduceRight((acc, fn) => fn(acc), handler);
}
