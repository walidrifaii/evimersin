"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  FormLoading,
  StatusBadge,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { toDisplayImageSrc } from "@/lib/image-url";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useCreateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useGetHeroSlidesQuery,
  useUpdateHeroSlideMutation,
  type HeroSlide,
} from "@/store/slices/admin/heroSlidesApi";
import { usePermissions } from "@/hooks/usePermissions";

type SlideFormState = {
  alt_text: string;
  sort_order: number;
  status: 0 | 1;
  imageFile: File | null;
};

const emptyForm: SlideFormState = {
  alt_text: "",
  sort_order: 0,
  status: 1,
  imageFile: null,
};

function SlideModal({
  open,
  mode,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: HeroSlide;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SlideFormState>(emptyForm);
  const [previewUrl, setPreviewUrl] = useState("");
  const [localError, setLocalError] = useState<unknown>(null);
  const [createSlide, createState] = useCreateHeroSlideMutation();
  const [updateSlide, updateState] = useUpdateHeroSlideMutation();

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        alt_text: initial.alt_text,
        sort_order: initial.sort_order,
        status: initial.status === 1 ? 1 : 0,
        imageFile: null,
      });
      setPreviewUrl(toDisplayImageSrc(initial.image));
    } else {
      setForm(emptyForm);
      setPreviewUrl("");
    }

    setLocalError(null);
  }, [open, mode, initial]);

  useEffect(() => {
    if (!form.imageFile) return;
    const objectUrl = URL.createObjectURL(form.imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.imageFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (mode === "create" && !form.imageFile) {
      setLocalError(new Error("Choose an image for this slide."));
      return;
    }

    try {
      const payload = {
        alt_text: form.alt_text.trim(),
        sort_order: Number(form.sort_order) || 0,
        status: form.status,
        image: form.imageFile,
      };

      if (mode === "create") {
        await createSlide(payload).unwrap();
      } else if (initial) {
        await updateSlide({ id: initial.id, data: payload }).unwrap();
      }

      onSaved();
      onClose();
    } catch (error) {
      setLocalError(error);
    }
  }

  if (!open) return null;

  const saving = createState.isLoading || updateState.isLoading;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:rounded-[28px]">
        <div className="border-b border-[#e8eef6] px-5 py-5 sm:px-6">
          <h2 className="text-[1.25rem] font-bold text-[var(--brand-navy)]">
            {mode === "create" ? "Add hero slide" : "Edit hero slide"}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Upload a wide image for the home page hero slider.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            {localError ? (
              <div className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
                {getApiErrorMessage(localError)}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--brand-navy)]">
                Image {mode === "create" ? "*" : "(optional)"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    imageFile: event.target.files?.[0] ?? null,
                  }))
                }
                className="block w-full text-[13px] text-[var(--brand-navy)] file:mr-3 file:rounded-full file:border-0 file:bg-[#eff6ff] file:px-4 file:py-2 file:text-[12px] file:font-semibold file:text-[var(--brand-blue)]"
              />
            </label>

            {previewUrl ? (
              <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-2xl border border-[#e5eaf2] bg-[#f8fafc]">
                <SafeImage
                  src={previewUrl}
                  alt="Slide preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <TextInput
                label="Alt text"
                value={form.alt_text}
                placeholder="Luxury villa at sunset"
                onChange={(value) => setForm((prev) => ({ ...prev, alt_text: value }))}
              />
              <TextInput
                label="Sort order"
                value={String(form.sort_order)}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    sort_order: Number(value.replace(/\D/g, "")) || 0,
                  }))
                }
              />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--brand-navy)]">
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: Number(event.target.value) as 0 | 1,
                    }))
                  }
                  className="w-full rounded-xl border border-[#dbe4f0] bg-white px-3.5 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)]"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e8eef6] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e] disabled:opacity-70"
            >
              {saving ? "Saving..." : mode === "create" ? "Add slide" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function HeroSlidesPanel() {
  const { can } = usePermissions();
  const canUpdate = can("settings:update") || can("settings:write");
  const { data: slides = [], isLoading, error } = useGetHeroSlidesQuery();
  const [deleteSlide, deleteState] = useDeleteHeroSlideMutation();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleDelete(slide: HeroSlide) {
    if (!canUpdate) return;
    if (!window.confirm("Delete this hero slide?")) return;

    setActionError(null);
    try {
      await deleteSlide(slide.id).unwrap();
      setSavedMessage("Slide deleted.");
    } catch (err) {
      setActionError(err);
    }
  }

  if (isLoading && slides.length === 0) return <FormLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
            Hero slides
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
            Manage the images shown in the home page hero banner slider. Lower
            sort order appears first.
          </p>
        </div>
        {canUpdate ? (
          <button
            type="button"
            onClick={() => {
              setSelectedSlide(null);
              setModalMode("create");
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e]"
          >
            Add slide
          </button>
        ) : null}
      </div>

      {error || actionError ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
          {getApiErrorMessage(actionError ?? error)}
        </div>
      ) : null}

      {savedMessage ? (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
          {savedMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        {slides.length === 0 ? (
          <div className="px-5 py-16 text-center text-[14px] text-[var(--muted)]">
            No hero slides yet. Add images to enable the home page slider.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead className="border-b border-[#e8eef6] bg-[#f8fafc] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Preview</th>
                  <th className="px-4 py-3 font-semibold">Alt text</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  {canUpdate ? (
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr key={slide.id} className="border-b border-[#eef2f7] last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-[#e5eaf2] bg-[#f8fafc]">
                        <SafeImage
                          src={toDisplayImageSrc(slide.image)}
                          alt={slide.alt_text || "Hero slide"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--brand-navy)]">
                      {slide.alt_text || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{slide.sort_order}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={slide.status} />
                    </td>
                    {canUpdate ? (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlide(slide);
                              setModalMode("edit");
                            }}
                            className="rounded-full border border-[#dbe4f0] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deleteState.isLoading}
                            onClick={() => void handleDelete(slide)}
                            className="rounded-full border border-[#fecaca] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SlideModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        initial={selectedSlide ?? undefined}
        onClose={() => {
          setModalMode(null);
          setSelectedSlide(null);
        }}
        onSaved={() => setSavedMessage("Slide saved.")}
      />
    </div>
  );
}
