"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
  const { data: countries = [], isLoading: countriesLoading } =
    useGetCountriesQuery();
  const [createCity, createState] = useCreateCityMutation();
  const [updateCity, updateState] = useUpdateCityMutation();

  const activeCountries = useMemo(
    () => countries.filter((country) => Number(country.status) === 1),
    [countries],
  );

  const defaultCountryId =
    initial?.country_id ??
    activeCountries.find((country) =>
      country.name.toLowerCase().includes("turkey"),
    )?.id ??
    activeCountries[0]?.id ??
    countries[0]?.id ??
    0;

  const [name, setName] = useState(initial?.name ?? "");
  const [countryId, setCountryId] = useState<number>(defaultCountryId);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!countryId) {
      setError(new Error("Please select a country first."));
      return;
    }

    const payload = {
      name,
      country_id: countryId,
      status,
    };

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

  if (countriesLoading && !initial) return <FormLoading />;

  return (
    <LookupFormLayout
      title={id ? "Edit city" : "Add city"}
      description="Cities used for property locations and website filters."
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
          value={countryId || ""}
          required
          onChange={(event) => setCountryId(Number(event.target.value))}
          className="h-11 w-full rounded-xl border border-[#d7dee8] bg-white px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)]"
        >
          <option value="" disabled>
            Select country
          </option>
          {(activeCountries.length > 0 ? activeCountries : countries).map(
            (country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ),
          )}
        </select>
      </label>

      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
