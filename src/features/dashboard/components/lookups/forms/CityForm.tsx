"use client";

import { useEffect, useState } from "react";
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
  useCreateCountryMutation,
  useGetCitiesQuery,
  useGetCountriesQuery,
  useUpdateCityMutation,
  type City,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("cities");
const DEFAULT_COUNTRY_NAME = "Lebanon";

export function CityForm({ id }: { id?: number }) {
  const { data = [], isLoading } = useGetCitiesQuery();
  const existing = id ? data.find((city) => city.id === id) : undefined;

  if (id && isLoading) return <FormLoading />;

  return <CityFormFields id={id} initial={existing} />;
}

function CityFormFields({ id, initial }: { id?: number; initial?: City }) {
  const router = useRouter();
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();
  const [createCountry] = useCreateCountryMutation();
  const [createCity, createState] = useCreateCityMutation();
  const [updateCity, updateState] = useUpdateCityMutation();

  const [name, setName] = useState(initial?.name ?? "");
  const [countryId, setCountryId] = useState<number>(initial?.country_id ?? 0);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);
  const [resolvingCountry, setResolvingCountry] = useState(!initial?.country_id);

  useEffect(() => {
    if (initial?.country_id) {
      setCountryId(initial.country_id);
      setResolvingCountry(false);
      return;
    }

    if (countriesLoading) return;

    let cancelled = false;

    async function ensureLebanon() {
      setResolvingCountry(true);
      try {
        const existing = countries.find(
          (country) => country.name.toLowerCase() === DEFAULT_COUNTRY_NAME.toLowerCase(),
        );

        if (existing) {
          if (!cancelled) setCountryId(existing.id);
          return;
        }

        const created = await createCountry({
          name: DEFAULT_COUNTRY_NAME,
          status: 1,
        }).unwrap();

        if (!cancelled) setCountryId(created.id);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setResolvingCountry(false);
      }
    }

    void ensureLebanon();

    return () => {
      cancelled = true;
    };
  }, [countries, countriesLoading, createCountry, initial?.country_id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!countryId) {
      setError({ data: { message: "Lebanon country is not ready yet. Please try again." } });
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

  if (resolvingCountry && !countryId) return <FormLoading />;

  return (
    <LookupFormLayout
      title={id ? "Edit city" : "Add city"}
      description="Cities in Lebanon used for property locations."
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
        placeholder="Beirut"
        onChange={setName}
      />
      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
