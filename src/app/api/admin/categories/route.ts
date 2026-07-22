import { revalidatePath, revalidateTag } from "next/cache";
import { categoryService } from "@/server/services/lookup.service";
import { compose, validateBody, withAuth, withHandler } from "@/server/middleware";
import { ok } from "@/server/utils/response";
import { saveImageUpload } from "@/server/utils/upload";
import { createCategorySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function revalidatePublicFilters() {
  revalidateTag("property-listings", "max");
  revalidatePath("/");
  revalidatePath("/products");
}

export const GET = compose(withAuth, withHandler)(async () =>
  ok(await categoryService.list()),
);

export const POST = compose(withAuth, withHandler)(async (request) => {
  const formData = await request.formData();
  const iconFile = formData.get("icon");
  const icon =
    iconFile instanceof File && iconFile.size > 0
      ? await saveImageUpload(iconFile, "uploads/categories")
      : null;

  const input = validateBody(createCategorySchema, {
    name: formData.get("name"),
    status: Number(formData.get("status") ?? 1),
    position: Number(formData.get("position") ?? 0),
    icon,
  });

  const created = await categoryService.create(input);
  revalidatePublicFilters();
  return ok(created, 201);
});
