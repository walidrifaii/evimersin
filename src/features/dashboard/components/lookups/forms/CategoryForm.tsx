"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { routes } from "@/constants/routes";
import {
  FormLoading,
  LookupFormLayout,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
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

  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState<number>(initial?.position ?? 0);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);
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
    setError(null);

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
      setError(err);
    }
  }

  return (
    <LookupFormLayout
      title={id ? "Edit category" : "Add category"}
      description="Categories group properties across listings and filters."
      backHref={backHref}
      onSubmit={onSubmit}
      submitting={createState.isLoading || updateState.isLoading}
      submitLabel={id ? "Update" : "Create"}
      error={error}
    >
      <TextInput
        label="Name"
        value={name}
        required
        placeholder="Villa"
        onChange={setName}
      />
      <TextInput
        label="Position"
        type="number"
        value={position}
        onChange={(value) => setPosition(Number(value) || 0)}
      />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
          Icon Image
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(event) => setIconFile(event.target.files?.[0] ?? null)}
          className="block w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white"
        />
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          Upload JPG, PNG, WEBP, or SVG up to 5MB.
        </p>
        {previewUrl ? (
          <div className="mt-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white">
              <Image
                src={previewUrl}
                alt={`${name || "Category"} icon`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={previewUrl.endsWith(".svg")}
              />
            </div>
          </div>
        ) : null}
      </label>
      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
