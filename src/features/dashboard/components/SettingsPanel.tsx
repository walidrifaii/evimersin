"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { deriveSocialHandleFromUrl } from "@/lib/social-settings";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  type UpdateSiteSettingsInput,
} from "@/store/slices/admin";
import { usePermissions } from "@/hooks/usePermissions";

type FormState = Omit<
  UpdateSiteSettingsInput,
  "instagram_handle" | "facebook_handle"
>;

const emptyForm: FormState = {
  email: "",
  phone: "",
  whatsapp_phone: "",
  whatsapp_message: "",
  instagram_url: "",
  instagram_visible: true,
  facebook_url: "",
  facebook_visible: true,
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
      instagram_url: data.instagram_url,
      instagram_visible: data.instagram_visible,
      facebook_url: data.facebook_url,
      facebook_visible: data.facebook_visible,
    });
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
      await updateSettings({
        ...form,
        instagram_handle: deriveSocialHandleFromUrl(
          form.instagram_url,
          "instagram",
        ),
        facebook_handle: deriveSocialHandleFromUrl(form.facebook_url, "facebook"),
      }).unwrap();
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
          Update the email, phone number, WhatsApp, and social media links shown
          across the website.
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
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-4 sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8eef6] bg-[#f8fafc] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.instagram_visible}
                    onChange={(event) =>
                      updateField("instagram_visible", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                  />
                  <span className="text-[13px] font-medium text-[var(--brand-navy)]">
                    Show Instagram icon in footer
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8eef6] bg-[#f8fafc] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.facebook_visible}
                    onChange={(event) =>
                      updateField("facebook_visible", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                  />
                  <span className="text-[13px] font-medium text-[var(--brand-navy)]">
                    Show Facebook icon in footer
                  </span>
                </label>
              </div>
              <TextInput
                label="Instagram URL"
                value={form.instagram_url}
                required
                placeholder="https://instagram.com/evimersin"
                onChange={(value) => updateField("instagram_url", value)}
              />
              <TextInput
                label="Facebook URL"
                value={form.facebook_url}
                required
                placeholder="https://facebook.com/evimersin"
                onChange={(value) => updateField("facebook_url", value)}
              />
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              Social links open in a new tab. Uncheck a platform to hide its icon
              from the footer and contact page.
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
