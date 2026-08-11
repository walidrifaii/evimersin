"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  ALL_PROPERTY_SPEC_KEYS,
  emptySpecValues,
  getSpecFieldsForCategory,
  type PropertySpecFieldKey,
} from "@/constants/property-specs";
import { MAX_PRODUCT_GALLERY_IMAGES } from "@/constants/config";
import { routes } from "@/constants/routes";
import {
  FormLoading,
  FeaturedSelect,
  LookupFormLayout,
  SelectField,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import {
  DashboardFormAlert,
  FieldErrorText,
  fieldControlClass,
} from "@/features/dashboard/components/DashboardFormAlert";
import { useDashboardFormErrors } from "@/features/dashboard/hooks/useDashboardFormErrors";
import { toDisplayImageSrc } from "@/lib/image-url";
import {
  calculateFinalPrice,
  formatProductPrice,
  hasActiveDiscount,
  type DiscountType,
} from "@/lib/product-pricing";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useCreateProductMutation,
  useDeleteProductImageMutation,
  useGetCategoriesQuery,
  useGetCitiesQuery,
  useGetProductQuery,
  useGetPurposesQuery,
  useGetRegionsQuery,
  useUpdateProductMutation,
  type ProductDetail,
  type ProductFormInput,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("products");

function boolToSelect(value: number | boolean | null | undefined) {
  if (value === null || value === undefined) return "";
  return Number(value) === 1 ? "1" : "0";
}

function ProductFormFields({ id, initial }: { id?: number; initial?: ProductDetail }) {
  const router = useRouter();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: purposes = [] } = useGetPurposesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const { data: regions = [] } = useGetRegionsQuery();
  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [deleteProductImage, deleteImageState] = useDeleteProductImageMutation();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [discountType, setDiscountType] = useState<DiscountType>(
    initial?.discount_type ?? null,
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initial?.discount_value ?? 0,
  );
  const [position, setPosition] = useState<number>(initial?.position ?? 0);
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? 0);
  const [purposeId, setPurposeId] = useState(initial?.purpose_id ?? 0);
  const [cityId, setCityId] = useState(initial?.city_id ?? 0);
  const [regionId, setRegionId] = useState(initial?.region_id ?? 0);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [isFeatured, setIsFeatured] = useState<Status>(initial?.is_featured ?? 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const formErrors = useDashboardFormErrors();
  const [galleryError, setGalleryError] = useState<unknown>(null);
  const [galleryNotice, setGalleryNotice] = useState<string | null>(null);
  const [coverFileMissing, setCoverFileMissing] = useState(false);
  const storedCoverSrc = initial?.image ?? "";
  const [previewUrl, setPreviewUrl] = useState(toDisplayImageSrc(storedCoverSrc));
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [specValues, setSpecValues] = useState(() => {
    const next = emptySpecValues();
    if (!initial) return next;
    for (const key of ALL_PROPERTY_SPEC_KEYS) {
      next[key] = initial[key] ?? null;
    }
    return next;
  });

  const finalPrice = calculateFinalPrice(price, discountType, discountValue);
  const activeCategories = categories.filter(
    (item) => Number(item.status) === 1 || item.id === categoryId,
  );
  const activePurposes = purposes.filter(
    (item) => Number(item.status) === 1 || item.id === purposeId,
  );
  const activeCities = cities.filter(
    (item) => Number(item.status) === 1 || item.id === cityId,
  );
  const activeRegions = regions.filter(
    (item) =>
      item.city_id === cityId &&
      (Number(item.status) === 1 || item.id === regionId),
  );
  const selectedCategoryName =
    activeCategories.find((item) => item.id === categoryId)?.name ?? "";
  const specFields = useMemo(
    () => getSpecFieldsForCategory(selectedCategoryName),
    [selectedCategoryName],
  );

  function updateSpec(
    key: PropertySpecFieldKey,
    value: string | number | boolean | null,
  ) {
    setSpecValues((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (regionId && !activeRegions.some((item) => item.id === regionId)) {
      setRegionId(0);
    }
  }, [activeRegions, regionId]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(toDisplayImageSrc(initial?.image));
      setCoverFileMissing(false);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, initial?.image]);

  useEffect(() => {
    const objectUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls(objectUrls);
    return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }, [galleryFiles]);

  const savedGalleryCount = initial?.images.length ?? 0;
  const remainingGallerySlots = Math.max(
    0,
    MAX_PRODUCT_GALLERY_IMAGES - savedGalleryCount - galleryFiles.length,
  );

  function handleGallerySelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    // Clearing the input lets the same file be picked again after removing it.
    event.target.value = "";
    if (selected.length === 0) return;

    const accepted = selected.slice(0, remainingGallerySlots);
    const skipped = selected.length - accepted.length;

    setGalleryNotice(
      skipped > 0
        ? `Only ${MAX_PRODUCT_GALLERY_IMAGES} images are allowed, so ${skipped} ${
            skipped === 1 ? "file was" : "files were"
          } skipped.`
        : null,
    );

    if (accepted.length > 0) {
      setGalleryFiles((previous) => [...previous, ...accepted]);
    }
  }

  function removeGalleryFile(index: number) {
    setGalleryFiles((previous) => previous.filter((_, position) => position !== index));
    setGalleryNotice(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    const nextFieldErrors: Record<string, string> = {};

    if (!categoryId) nextFieldErrors.category_id = "Category is required";
    if (!purposeId) nextFieldErrors.purpose_id = "Purpose is required";
    if (!cityId) nextFieldErrors.city_id = "City is required";

    const trimmedName = name.trim();
    if (!trimmedName) nextFieldErrors.name = "Name is required";

    if (Object.keys(nextFieldErrors).length > 0) {
      formErrors.setLocal("Please fix the highlighted fields below.", nextFieldErrors);
      return;
    }

    if (discountType && discountValue <= 0) {
      formErrors.setLocal("Discount value must be greater than 0.", {
        discount_value: "Discount value must be greater than 0",
      });
      return;
    }
    if (discountType === "fixed" && discountValue > price) {
      formErrors.setLocal("Fixed discount cannot exceed residential unit price.", {
        discount_value: "Fixed discount cannot exceed price",
      });
      return;
    }
    if (discountType === "percentage" && discountValue > 100) {
      formErrors.setLocal("Percentage discount cannot exceed 100%.", {
        discount_value: "Percentage discount cannot exceed 100%",
      });
      return;
    }

    const payload: ProductFormInput = {
      name: trimmedName,
      description: description.trim() || null,
      price: Number(price) || 0,
      discount_type: discountType,
      discount_value: discountType ? Number(discountValue) || 0 : 0,
      position: Number(position) || 0,
      category_id: categoryId,
      purpose_id: purposeId,
      city_id: cityId,
      region_id: regionId > 0 ? regionId : null,
      status,
      is_featured: isFeatured,
      image: imageFile,
      images: galleryFiles,
      ...specValues,
    };

    try {
      if (id) await updateProduct({ id, data: payload }).unwrap();
      else await createProduct(payload).unwrap();
      router.push(backHref);
    } catch (err) {
      formErrors.apply(err);
    }
  }

  function clearField(name: string) {
    formErrors.clearField(name);
  }

  return (
    <div className="space-y-6">
      <LookupFormLayout
        title={id ? "Edit residential unit" : "Add residential unit"}
        description="Create residential units linked to category, purpose, and city."
        backHref={backHref}
        onSubmit={onSubmit}
        submitting={createState.isLoading || updateState.isLoading}
        submitLabel={id ? "Update" : "Create"}
        error={formErrors.banner}
        fieldErrors={formErrors.fields}
        columns={4}
        wide
      >
        <TextInput
          label="Name"
          value={name}
          required
          error={formErrors.field("name")}
          onChange={(value) => {
            setName(value);
            clearField("name");
          }}
        />
        <TextInput
          label="Price"
          type="number"
          value={price}
          required
          error={formErrors.field("price")}
          onChange={(value) => {
            setPrice(Number(value) || 0);
            clearField("price");
          }}
        />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Discount type
          </span>
          <select
            value={discountType ?? ""}
            aria-invalid={Boolean(formErrors.field("discount_type"))}
            onChange={(event) => {
              const nextType = event.target.value;
              setDiscountType(
                nextType === "fixed" || nextType === "percentage" ? nextType : null,
              );
              if (nextType !== "fixed" && nextType !== "percentage") setDiscountValue(0);
              clearField("discount_type");
            }}
            className={fieldControlClass(formErrors.field("discount_type"))}
          >
            <option value="">No discount</option>
            <option value="fixed">Fixed amount</option>
            <option value="percentage">Percentage</option>
          </select>
          <FieldErrorText message={formErrors.field("discount_type")} />
        </label>
        <TextInput
          label={
            discountType === "percentage"
              ? "Discount (%)"
              : discountType === "fixed"
                ? "Discount amount"
                : "Discount value"
          }
          type="number"
          value={discountValue}
          error={formErrors.field("discount_value")}
          onChange={(value) => {
            setDiscountValue(Number(value) || 0);
            clearField("discount_value");
          }}
        />
        <div className="rounded-xl border border-[#e5eaf2] bg-[#f8fafc] px-4 py-3 col-span-full sm:col-span-2 lg:col-span-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
            Final price
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[18px] font-bold text-[var(--brand-navy)]">
              {formatProductPrice(finalPrice)}
            </span>
            {hasActiveDiscount(discountType, discountValue) ? (
              <span className="text-[14px] text-[var(--muted)] line-through">
                {formatProductPrice(price)}
              </span>
            ) : null}
          </div>
        </div>
        <TextInput
          label="Position"
          type="number"
          value={position}
          error={formErrors.field("position")}
          onChange={(value) => {
            setPosition(Number(value) || 0);
            clearField("position");
          }}
        />
        <SelectField
          label="Category"
          value={categoryId}
          error={formErrors.field("category_id")}
          onChange={(value) => {
            setCategoryId(value);
            clearField("category_id");
          }}
          options={activeCategories}
          required
        />
        <SelectField
          label="Purpose"
          value={purposeId}
          error={formErrors.field("purpose_id")}
          onChange={(value) => {
            setPurposeId(value);
            clearField("purpose_id");
          }}
          options={activePurposes}
          required
        />
        <SelectField
          label="City"
          value={cityId}
          error={formErrors.field("city_id")}
          onChange={(nextCityId) => {
            setCityId(nextCityId);
            setRegionId(0);
            clearField("city_id");
          }}
          options={activeCities}
          required
        />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Region
          </span>
          <select
            value={regionId || ""}
            disabled={!cityId}
            aria-invalid={Boolean(formErrors.field("region_id"))}
            onChange={(event) => {
              setRegionId(Number(event.target.value) || 0);
              clearField("region_id");
            }}
            className={`${fieldControlClass(formErrors.field("region_id"))} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="">All regions / none</option>
            {activeRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <FieldErrorText message={formErrors.field("region_id")} />
        </label>
        <StatusSelect
          value={status}
          error={formErrors.field("status")}
          onChange={(value) => {
            setStatus(value);
            clearField("status");
          }}
        />
        <FeaturedSelect
          value={isFeatured}
          error={formErrors.field("is_featured")}
          onChange={(value) => {
            setIsFeatured(value);
            clearField("is_featured");
          }}
        />

        {specFields.length > 0 ? (
          <div className="col-span-full">
            <p className="mb-3 text-[13px] font-bold text-[var(--brand-navy)]">
              {selectedCategoryName} details
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {specFields.map((field) => {
                if (field.type === "boolean") {
                  return (
                    <label key={field.key} className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
                        {field.label}
                      </span>
                      <select
                        value={boolToSelect(
                          specValues[field.key] as number | boolean | null,
                        )}
                        onChange={(event) => {
                          const next = event.target.value;
                          updateSpec(
                            field.key,
                            next === "" ? null : next === "1" ? 1 : 0,
                          );
                        }}
                        className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
                      >
                        <option value="">Not set</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </label>
                  );
                }

                if (field.type === "text") {
                  return (
                    <TextInput
                      key={field.key}
                      label={field.label}
                      value={String(specValues[field.key] ?? "")}
                      error={formErrors.field(field.key)}
                      onChange={(value) => {
                        updateSpec(field.key, value.trim() || null);
                        clearField(field.key);
                      }}
                    />
                  );
                }

                return (
                  <TextInput
                    key={field.key}
                    label={field.unit ? `${field.label} (${field.unit})` : field.label}
                    type="number"
                    error={formErrors.field(field.key)}
                    value={
                      specValues[field.key] === null ||
                      specValues[field.key] === undefined
                        ? ""
                        : String(specValues[field.key])
                    }
                    onChange={(value) => {
                      if (value.trim() === "") {
                        updateSpec(field.key, null);
                      } else {
                        updateSpec(field.key, Number(value));
                      }
                      clearField(field.key);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : categoryId ? (
          <p className="col-span-full text-[13px] text-[var(--muted)]">
            No extra fields configured for this category.
          </p>
        ) : null}

        <label className="block col-span-full">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Description
          </span>
          <textarea
            value={description}
            aria-invalid={Boolean(formErrors.field("description"))}
            onChange={(e) => {
              setDescription(e.target.value);
              clearField("description");
            }}
            rows={4}
            className={`w-full rounded-xl border bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:bg-white ${
              formErrors.field("description")
                ? "border-[#fca5a5] bg-[#fef2f2] focus:border-[#b91c1c]"
                : "border-[#dbe3ef] focus:border-[var(--brand-blue)]"
            }`}
          />
          <FieldErrorText message={formErrors.field("description")} />
        </label>
        <label className="block col-span-full sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Cover image
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            aria-invalid={Boolean(formErrors.field("image"))}
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null);
              clearField("image");
            }}
            className={`block w-full rounded-xl border bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white ${
              formErrors.field("image") ? "border-[#fca5a5] bg-[#fef2f2]" : "border-[#dbe3ef]"
            }`}
          />
          <FieldErrorText message={formErrors.field("image")} />
          {previewUrl || storedCoverSrc ? (
            <div className="mt-3">
              <div className="relative h-28 w-40 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white">
                <SafeImage
                  src={previewUrl || storedCoverSrc}
                  alt={name || "Residential unit"}
                  fill
                  className="object-cover"
                  sizes="160px"
                  onError={() => setCoverFileMissing(true)}
                />
              </div>
              {coverFileMissing && storedCoverSrc && !imageFile ? (
                <p className="mt-2 max-w-md text-[12px] leading-relaxed text-[#b45309]">
                  The saved file is missing on the server (common after redeploy). Choose a
                  new cover image and click Update. Mount persistent storage at{" "}
                  <code className="rounded bg-[#fff7ed] px-1 py-0.5 text-[11px]">
                    /app/storage/uploads
                  </code>{" "}
                  so uploads are kept.
                </p>
              ) : null}
            </div>
          ) : null}
        </label>
        <div className="col-span-full sm:col-span-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
              Other residential unit images
            </span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              disabled={remainingGallerySlots === 0}
              onChange={handleGallerySelect}
              className="block w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <p className="mt-2 text-[12px] text-[var(--muted)]">
            {remainingGallerySlots > 0
              ? `Up to ${MAX_PRODUCT_GALLERY_IMAGES} images${
                  savedGalleryCount > 0 ? ` (${savedGalleryCount} already saved)` : ""
                } — you can still add ${remainingGallerySlots}.`
              : `Maximum of ${MAX_PRODUCT_GALLERY_IMAGES} images reached. Remove one to add another.`}
          </p>
          {galleryNotice ? (
            <p className="mt-1 text-[12px] font-medium text-[#b45309]">{galleryNotice}</p>
          ) : null}
          {galleryPreviewUrls.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryPreviewUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative h-24 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white"
                >
                  <SafeImage
                    src={url}
                    alt={`Selected residential unit image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryFile(index)}
                    aria-label={`Remove selected image ${index + 1}`}
                    title="Remove"
                    className="absolute end-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[16px] leading-none font-bold text-[var(--brand-red)] shadow-[0_2px_8px_rgba(15,23,42,0.18)] hover:bg-white"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </LookupFormLayout>

      {id && initial ? (
        <div className="max-w-6xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
            Saved residential unit images
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Delete images already attached to this residential unit. Add new ones from the form above, then click Update.
          </p>
          {galleryError ? (
            <div className="mt-3">
              <DashboardFormAlert message={getApiErrorMessage(galleryError)} />
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {initial.images.length === 0 ? (
              <p className="col-span-full text-[13px] text-[var(--muted)]">
                No saved gallery images yet.
              </p>
            ) : null}
            {initial.images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white"
              >
                <div className="relative h-28 w-full">
                  <SafeImage
                    src={image.image}
                    alt={`Gallery ${image.id}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <button
                  type="button"
                  disabled={deleteImageState.isLoading}
                  onClick={async () => {
                    setGalleryError(null);
                    try {
                      await deleteProductImage({
                        productId: id,
                        imageId: image.id,
                      }).unwrap();
                    } catch (err) {
                      setGalleryError(err);
                    }
                  }}
                  className="w-full cursor-pointer px-3 py-2 text-[12px] font-semibold text-[var(--brand-red)] hover:bg-[#fef2f2]"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductForm({ id }: { id?: number }) {
  const { data, isLoading } = useGetProductQuery(id ?? 0, { skip: !id });
  if (id && isLoading) return <FormLoading />;
  return <ProductFormFields id={id} initial={data} />;
}
