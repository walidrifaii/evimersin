"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { routes } from "@/constants/routes";
import {
  FormLoading,
  LookupFormLayout,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import {
  useCreateCityMutation,
  useGetCitiesQuery,
  useGetCountriesQuery,
  useUpdateCityMutation,
  type City,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("cities");

export function CityForm({ id }: { id?: number }) {
  const { data = [], isLoading } = useGetCitiesQuery();
  const existing = id ? data.find((city) => city.id === id) : undefined;

  if (id && isLoading) return <FormLoading />;

  return <CityFormFields id={id} initial={existing} />;
}

function CityFormFields({ id, initial }: { id?: number; initial?: City }) {
  const router = useRouter();
  const { data: countries = [] } = useGetCountriesQuery();
  const [createCity, createState] = useCreateCityMutation();
  const [updateCity, updateState] = useUpdateCityMutation();

  const [name, setName] = useState(initial?.name ?? "");
  const [countryId, setCountryId] = useState<number>(initial?.country_id ?? 0);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!countryId) {
      setError({ data: { message: "Please select a country" } });
      return;
    }

    const payload = { name, country_id: countryId, status };

    try {
      if (id) {
        await updateCity({ id, data: payload }).unwrap();
      } else {
        await createCity(payload).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <LookupFormLayout
      title={id ? "Edit city" : "Add city"}
      description="Cities are linked to a country and used for property locations."
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
        placeholder="Mersin"
        onChange={setName}
      />
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
          Country
        </span>
        <select
          required
          value={countryId || ""}
          onChange={(e) => setCountryId(Number(e.target.value))}
          className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </label>
      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
