import type { ZodSchema } from "zod";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  type ApiContext,
} from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";

type CollectionService<TCreate> = {
  list(): Promise<unknown>;
  create(input: TCreate): Promise<unknown>;
};

type ItemService<TUpdate> = {
  getById(id: number): Promise<unknown>;
  update(id: number, input: TUpdate): Promise<unknown>;
  remove(id: number): Promise<void>;
};

function parseId(params: Record<string, string>, resource: string) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${resource} id`, 400);
  }
  return id;
}

export function createCollectionHandlers<TCreate>(
  service: CollectionService<TCreate>,
  createSchema: ZodSchema<TCreate>,
) {
  const GET = compose(withAuth, withHandler)(async () =>
    ok(await service.list()),
  );

  const POST = compose(withAuth, withHandler)(async (request) => {
    const input = validateBody(createSchema, await parseJsonBody(request));
    return ok(await service.create(input), 201);
  });

  return { GET, POST };
}

export function createItemHandlers<TUpdate>(
  resource: string,
  service: ItemService<TUpdate>,
  updateSchema: ZodSchema<TUpdate>,
) {
  const GET = compose(withAuth, withHandler)(
    async (_request, context: ApiContext) => {
      const id = parseId(await context.params, resource);
      return ok(await service.getById(id));
    },
  );

  const PUT = compose(withAuth, withHandler)(
    async (request, context: ApiContext) => {
      const id = parseId(await context.params, resource);
      const input = validateBody(updateSchema, await parseJsonBody(request));
      return ok(await service.update(id, input));
    },
  );

  const DELETE = compose(withAuth, withHandler)(
    async (_request, context: ApiContext) => {
      const id = parseId(await context.params, resource);
      await service.remove(id);
      return ok({ message: `${resource} deleted successfully` });
    },
  );

  return { GET, PUT, DELETE };
}
