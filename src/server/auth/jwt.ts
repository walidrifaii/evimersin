import { SignJWT, jwtVerify } from "jose";
import type { AuthTokenPayload } from "@/server/types/admin.types";
import { AppError } from "@/server/utils/errors";

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_REFRESH_SECRET is not configured", 500);
  }
  return new TextEncoder().encode(secret);
}

export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES ?? "15m";
export const REFRESH_TOKEN_TTL_DAYS = Number(process.env.JWT_REFRESH_DAYS ?? 7);

export async function signAccessToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    name: payload.name,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());

  if (payload.type && payload.type !== "access") {
    throw new Error("Invalid access token type");
  }

  const sub = payload.sub;
  if (!sub) throw new Error("Invalid token payload");

  return {
    sub: Number(sub),
    username: String(payload.username ?? ""),
    name: String(payload.name ?? ""),
  };
}

export async function signRefreshJwt(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    name: payload.name,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_DAYS}d`)
    .sign(getRefreshSecret());
}

export async function verifyRefreshJwt(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret());

  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }

  const sub = payload.sub;
  if (!sub) throw new Error("Invalid token payload");

  return {
    sub: Number(sub),
    username: String(payload.username ?? ""),
    name: String(payload.name ?? ""),
  };
}

export function getRefreshExpiryDate(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return expires;
}
