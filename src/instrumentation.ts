import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getUploadRoot } = await import("@/server/utils/upload");

  console.log(
    "[evimersin] Uploads are stored in the database (media_files) and cached at " +
      `${getUploadRoot()}. Images survive redeploys without a mounted volume.`,
  );
}

function describeCause(value: unknown): string {
  if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
  return String(value);
}

/**
 * Production hides server errors behind a digest, and a failed database
 * connection arrives as an AggregateError with an empty message. Unwrap both so
 * the container log shows what actually broke.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const lines = [
    `[evimersin] ${context.routeType} error on ${request.method} ${request.path}`,
    `route: ${context.routePath}`,
  ];

  if (error instanceof Error) {
    lines.push(`message: ${error.message || "(empty)"}`);

    if ("digest" in error) lines.push(`digest: ${String(error.digest)}`);
    if (error.cause) lines.push(`cause: ${describeCause(error.cause)}`);

    if (error instanceof AggregateError) {
      for (const inner of error.errors) {
        lines.push(`inner: ${describeCause(inner)}`);
      }
    }

    lines.push(error.stack ?? "(no stack)");
  } else {
    lines.push(`thrown value: ${String(error)}`);
  }

  console.error(lines.join("\n  "));
};
