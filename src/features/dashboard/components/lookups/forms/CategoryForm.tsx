"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { MAX_UPLOAD_IMAGE_LABEL } from "@/constants/config";
import { routes } from "@/constants/routes";
import { useDashboardFormErrors } from "@/features/dashboard/hooks/useDashboardFormErrors";
import {
  FormLoading,
  LookupFormLayout,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { FieldErrorText } from "@/features/dashboard/components/DashboardFormAlert";
import { prepareImageForUpload } from "@/lib/compress-image";
import { toDisplayImageSrc } from "@/lib/image-url";
import {
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
  type Category,
  type CategoryFormInput,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("categories");

export function CategoryForm({ id }: { id?: number }) {
  const { data, isLoading } = useGetCategoryQuery(id ?? 0, { skip: !id });

  if (id && isLoading) return <FormLoading />;

  return <CategoryFormFields id={id} initial={data} />;
}

function CategoryFormFields({ id, initial }: { id?: number; initial?: Category }) {
  const router = useRouter();
  const [createCategory, createState] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();
  const formErrors = useDashboardFormErrors();

  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState<number>(initial?.position ?? 0);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [previewUrl, setPreviewUrl] = useState(
    toDisplayImageSrc(initial?.icon),
  );

  useEffect(() => {
    if (!iconFile) {
      setPreviewUrl(toDisplayImageSrc(initial?.icon));
      return;
    }

    const objectUrl = URL.createObjectURL(iconFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [iconFile, initial?.icon]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    const payload: CategoryFormInput = {
      name,
      status,
      position: Number(position) || 0,
      icon: iconFile,
    };

    try {
      if (id) {
        await updateCategory({ id, data: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      formErrors.apply(err);
    }
  }

  const iconError = formErrors.field("icon");

  return (
    <LookupFormLayout
      title={id ? "Edit category" : "Add category"}
      description="Categories group properties across listings and filters."
      backHref={backHref}
      onSubmit={onSubmit}
      submitting={createState.isLoading || updateState.isLoading || compressing}
      submitLabel={id ? "Update" : "Create"}
      error={formErrors.banner}
      fieldErrors={formErrors.fields}
    >
      <TextInput
        label="Name"
        value={name}
        required
        placeholder="Villa"
        error={formErrors.field("name")}
        onChange={(value) => {
          setName(value);
          formErrors.clearField("name");
        }}
      />
      <TextInput
        label="Position"
        type="number"
        value={position}
        error={formErrors.field("position")}
        onChange={(value) => {
          setPosition(Number(value) || 0);
          formErrors.clearField("position");
        }}
      />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
          Icon Image
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-invalid={Boolean(iconError)}
          onChange={async (event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = "";
            if (!file) {
              setIconFile(null);
              return;
            }

            setCompressing(true);
            try {
              const result = await prepareImageForUpload(file);

              if (!result.ok) {
                setIconFile(null);
                formErrors.setLocal("The icon image was not accepted.", {
                  icon: result.reason,
                });
                return;
              }

              setIconFile(result.file);
              formErrors.clearField("icon");
            } finally {
              setCompressing(false);
            }
          }}
          className={`block w-full rounded-xl border bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white ${
            iconError ? "border-[#fca5a5] bg-[#fef2f2]" : "border-[#dbe3ef]"
          }`}
        />
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          Upload JPG, PNG, or WEBP. Photos are compressed to JPEG and must
          be {MAX_UPLOAD_IMAGE_LABEL} or smaller.
        </p>
        <FieldErrorText message={iconError} />
        {previewUrl ? (
          <div className="mt-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white">
              <SafeImage
                src={previewUrl}
                alt={`${name || "Category"} icon`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </div>
        ) : null}
      </label>
      <StatusSelect
        value={status}
        error={formErrors.field("status")}
        onChange={(value) => {
          setStatus(value);
          formErrors.clearField("status");
        }}
      />
    </LookupFormLayout>
  );
}
