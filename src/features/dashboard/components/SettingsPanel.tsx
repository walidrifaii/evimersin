"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
} from "@/constants/social-platforms";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { socialSettingsFromData } from "@/features/contact/data";
import { normalizeSocialSettings } from "@/lib/social-settings";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  type UpdateSiteSettingsInput,
} from "@/store/slices/admin";
import { usePermissions } from "@/hooks/usePermissions";

type FormState = Omit<UpdateSiteSettingsInput, `${(typeof SOCIAL_PLATFORMS)[number]}_handle`>;

const emptySocial = SOCIAL_PLATFORMS.reduce(
  (fields, platform) => {
    fields[`${platform}_url`] = "";
    fields[`${platform}_visible`] = platform === "instagram" || platform === "facebook";
    return fields;
  },
  {} as Pick<FormState, `${(typeof SOCIAL_PLATFORMS)[number]}_url` | `${(typeof SOCIAL_PLATFORMS)[number]}_visible`>,
);

const emptyForm: FormState = {
  email: "",
  phone: "",
  whatsapp_phone: "",
  whatsapp_message: "",
  address_name: "",
  address: "",
  ...emptySocial,
};

export function SettingsPanel() {
  const { can } = usePermissions();
  const canUpdate = can("settings:update");
  const { data, isLoading, error } = useGetSiteSettingsQuery();
  const [updateSettings, updateState] = useUpdateSiteSettingsMutation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [actionError, setActionError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      email: data.email,
      phone: data.phone,
      whatsapp_phone: data.whatsapp_phone,
      whatsapp_message: data.whatsapp_message,
      address_name: data.address_name,
      address: data.address,
      ...socialSettingsFromData(data),
    } as FormState);
  }, [data]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setActionError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate) return;
    setActionError(null);
    setSaved(false);

    try {
      await updateSettings(normalizeSocialSettings(form)).unwrap();
      setSaved(true);
    } catch (err) {
      setActionError(err);
    }
  }

  if (isLoading && !data) return <FormLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          Website Settings
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
          Update the email, phone number, office address, WhatsApp, and social
          media links shown across the website.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="space-y-6">
          <section>
            <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
              Contact
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Email"
                value={form.email}
                required
                placeholder="info@evimersin.com"
                onChange={(value) => updateField("email", value)}
              />
              <TextInput
                label="Phone"
                value={form.phone}
                required
                placeholder="+961 71 959 921"
                onChange={(value) => updateField("phone", value)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
              Office address
            </h2>
            <p className="mt-1 text-[12px] text-[var(--muted)]">
              Shown in the footer and on the contact page.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4">
              <TextInput
                label="Office name"
                value={form.address_name}
                required
                placeholder="EviMersin"
                onChange={(value) => updateField("address_name", value)}
              />
              <TextInput
                label="Street address"
                value={form.address}
                required
                placeholder="Palmiye, 2.Cadde, 33110 Yenişehir/Mersin"
                onChange={(value) => updateField("address", value)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
              WhatsApp
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="WhatsApp number"
                value={form.whatsapp_phone}
                required
                placeholder="96171959921"
                onChange={(value) => updateField("whatsapp_phone", value)}
              />
              <div className="sm:col-span-2">
                <TextInput
                  label="Default WhatsApp message"
                  value={form.whatsapp_message}
                  required
                  placeholder="Hello EviMersin..."
                  onChange={(value) => updateField("whatsapp_message", value)}
                />
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              Use digits only for WhatsApp (country code + number), e.g.
              96171959921.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
              Social media
            </h2>
            <div className="mt-3 space-y-4">
              {SOCIAL_PLATFORM_CONFIG.map((platform) => {
                const urlKey = `${platform.id}_url` as const;
                const visibleKey = `${platform.id}_visible` as const;

                return (
                  <div
                    key={platform.id}
                    className="rounded-xl border border-[#e8eef6] bg-[#f8fafc] p-4"
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(form[visibleKey])}
                        onChange={(event) =>
                          updateField(visibleKey, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                      />
                      <span className="text-[13px] font-semibold text-[var(--brand-navy)]">
                        Show {platform.label} icon
                      </span>
                    </label>
                    <div className="mt-3">
                      <TextInput
                        label={`${platform.label} URL`}
                        value={String(form[urlKey] ?? "")}
                        required={
                          platform.id === "instagram" || platform.id === "facebook"
                        }
                        placeholder={platform.placeholder}
                        onChange={(value) => updateField(urlKey, value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              Social links open in a new tab. A platform only appears when it is
              enabled and has a URL.
            </p>
          </section>
        </div>

        {error || actionError ? (
          <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {getApiErrorMessage(actionError ?? error)}
          </div>
        ) : null}

        {saved ? (
          <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
            Settings saved. Public pages will show the new values.
          </div>
        ) : null}

        <div className="mt-5">
          {canUpdate ? (
            <button
              type="submit"
              disabled={updateState.isLoading}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updateState.isLoading ? "Saving..." : "Save settings"}
            </button>
          ) : (
            <p className="text-[13px] text-[var(--muted)]">
              You have view-only access to settings.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
