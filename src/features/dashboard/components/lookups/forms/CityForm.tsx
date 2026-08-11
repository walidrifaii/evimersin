"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { routes } from "@/constants/routes";
import { useDashboardFormErrors } from "@/features/dashboard/hooks/useDashboardFormErrors";
import {
  FormLoading,
  LookupFormLayout,
  SelectField,
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
  const formErrors = useDashboardFormErrors();

  const activeCountries = useMemo(
    () => countries.filter((country) => Number(country.status) === 1),
    [countries],
  );

  const defaultCountryId =
    initial?.country_id ??
    activeCountries.find((country) =>
      country.name.toLowerCase().includes("Lebanon"),
    )?.id ??
    activeCountries[0]?.id ??
    countries[0]?.id ??
    0;

  const [name, setName] = useState(initial?.name ?? "");
  const [countryId, setCountryId] = useState<number>(defaultCountryId);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    if (!countryId) {
      formErrors.setLocal("Please select a country first.", {
        country_id: "Country is required",
      });
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
      formErrors.apply(err);
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
      error={formErrors.banner}
      fieldErrors={formErrors.fields}
    >
      <TextInput
        label="Name"
        value={name}
        required
        placeholder="city name"
        error={formErrors.field("name")}
        onChange={(value) => {
          setName(value);
          formErrors.clearField("name");
        }}
      />

      <SelectField
        label="Country"
        value={countryId}
        required
        placeholder="Select country"
        options={activeCountries.length > 0 ? activeCountries : countries}
        error={formErrors.field("country_id")}
        onChange={(value) => {
          setCountryId(value);
          formErrors.clearField("country_id");
        }}
      />

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
