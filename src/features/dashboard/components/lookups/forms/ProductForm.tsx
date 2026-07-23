"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { routes } from "@/constants/routes";
import {
  FormLoading,
  FeaturedSelect,
  LookupFormLayout,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
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
  useUpdateProductMutation,
  type ProductDetail,
  type ProductFormInput,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("products");

export function ProductForm({ id }: { id?: number }) {
  const { data, isLoading } = useGetProductQuery(id ?? 0, { skip: !id });

  if (id && isLoading) return <FormLoading />;

  return <ProductFormFields id={id} initial={data} />;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: Array<{ id: number; name: string }>;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
        {label}
      </span>
      <select
        required={required}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProductFormFields({ id, initial }: { id?: number; initial?: ProductDetail }) {
  const router = useRouter();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: purposes = [] } = useGetPurposesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
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
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [isFeatured, setIsFeatured] = useState<Status>(initial?.is_featured ?? 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [galleryError, setGalleryError] = useState<unknown>(null);
  const [previewUrl, setPreviewUrl] = useState(
    toDisplayImageSrc(initial?.image),
  );
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
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

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(toDisplayImageSrc(initial?.image));
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!categoryId || !purposeId || !cityId) {
      setError({ data: { message: "Please select category, purpose, and city" } });
      return;
    }

    if (discountType && discountValue <= 0) {
      setError({ data: { message: "Discount value must be greater than 0" } });
      return;
    }

    if (discountType === "fixed" && discountValue > price) {
      setError({
        data: { message: "Fixed discount cannot exceed residential unit price" },
      });
      return;
    }

    if (discountType === "percentage" && discountValue > 100) {
      setError({ data: { message: "Percentage discount cannot exceed 100%" } });
      return;
    }

    const payload: ProductFormInput = {
      name,
      description: description.trim() || null,
      price: Number(price) || 0,
      discount_type: discountType,
      discount_value: discountType ? Number(discountValue) || 0 : 0,
      position: Number(position) || 0,
      category_id: categoryId,
      purpose_id: purposeId,
      city_id: cityId,
      status,
      is_featured: isFeatured,
      image: imageFile,
      images: galleryFiles,
    };

    try {
      if (id) {
        await updateProduct({ id, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      setError(err);
    }
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
        error={error}
      >
        <TextInput label="Name" value={name} required onChange={setName} />
        <TextInput
          label="Price"
          type="number"
          value={price}
          required
          onChange={(value) => setPrice(Number(value) || 0)}
        />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Discount type
          </span>
          <select
            value={discountType ?? ""}
            onChange={(event) => {
              const nextType = event.target.value;
              setDiscountType(
                nextType === "fixed" || nextType === "percentage"
                  ? nextType
                  : null,
              );
              if (nextType !== "fixed" && nextType !== "percentage") {
                setDiscountValue(0);
              }
            }}
            className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
          >
            <option value="">No discount</option>
            <option value="fixed">Fixed amount</option>
            <option value="percentage">Percentage</option>
          </select>
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
          onChange={(value) => setDiscountValue(Number(value) || 0)}
        />
        <div className="rounded-xl border border-[#e5eaf2] bg-[#f8fafc] px-4 py-3 sm:col-span-2">
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
          onChange={(value) => setPosition(Number(value) || 0)}
        />
        <SelectField
          label="Category"
          value={categoryId}
          onChange={setCategoryId}
          options={activeCategories}
          required
        />
        <SelectField
          label="Purpose"
          value={purposeId}
          onChange={setPurposeId}
          options={activePurposes}
          required
        />
        <SelectField
          label="City"
          value={cityId}
          onChange={setCityId}
          options={activeCities}
          required
        />
        <StatusSelect value={status} onChange={setStatus} />
        <FeaturedSelect value={isFeatured} onChange={setIsFeatured} />
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Cover image
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white"
          />
          {previewUrl ? (
            <div className="relative mt-3 h-28 w-40 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white">
              <SafeImage
                src={previewUrl}
                alt={name || "Residential unit"}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          ) : null}
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
            Other residential unit images
          </span>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) =>
              setGalleryFiles(Array.from(event.target.files ?? []))
            }
            className="block w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white"
          />
          {galleryPreviewUrls.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                </div>
              ))}
            </div>
          ) : null}
        </label>
      </LookupFormLayout>

      {id && initial ? (
        <div className="max-w-2xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
            Saved residential unit images
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Delete images already attached to this residential unit. Add new ones from the form above, then click Update.
          </p>

          {galleryError ? (
            <div className="mt-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
              {getApiErrorMessage(galleryError)}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
