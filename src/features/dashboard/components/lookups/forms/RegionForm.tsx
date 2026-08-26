"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FieldErrorText, fieldControlClass } from "@/features/dashboard/components/DashboardFormAlert";
import {
  useCreateRegionMutation,
  useGetCitiesQuery,
  useGetCountriesQuery,
  useGetRegionsQuery,
  useUpdateRegionMutation,
  type Region,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("regions");

export function RegionForm({ id }: { id?: number }) {
  const { data = [], isLoading } = useGetRegionsQuery();
  const existing = id ? data.find((region) => region.id === id) : undefined;

  if (id && isLoading) return <FormLoading />;

  return <RegionFormFields id={id} initial={existing} />;
}

function RegionFormFields({ id, initial }: { id?: number; initial?: Region }) {
  const router = useRouter();
  const { data: countries = [] } = useGetCountriesQuery();
  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery();
  const [createRegion, createState] = useCreateRegionMutation();
  const [updateRegion, updateState] = useUpdateRegionMutation();
  const formErrors = useDashboardFormErrors();

  const activeCountries = useMemo(
    () => countries.filter((country) => Number(country.status) === 1),
    [countries],
  );

  const [name, setName] = useState(initial?.name ?? "");
  const [countryId, setCountryId] = useState(0);
  const [cityId, setCityId] = useState<number>(initial?.city_id ?? 0);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);

  const activeCities = useMemo(
    () =>
      cities.filter(
        (city) =>
          city.country_id === countryId &&
          (Number(city.status) === 1 || city.id === cityId),
      ),
    [cities, countryId, cityId],
  );

  useEffect(() => {
    if (!cityId || countryId) return;
    const city = cities.find((item) => item.id === cityId);
    if (city?.country_id) setCountryId(city.country_id);
  }, [cities, cityId, countryId]);

  useEffect(() => {
    if (!countryId || !cityId) return;
    if (!activeCities.some((item) => item.id === cityId)) {
      setCityId(0);
    }
  }, [activeCities, cityId, countryId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    const nextFieldErrors: Record<string, string> = {};
    if (!countryId) nextFieldErrors.country_id = "Country is required";
    if (!cityId) nextFieldErrors.city_id = "City is required";
    if (Object.keys(nextFieldErrors).length > 0) {
      formErrors.setLocal("Please fix the highlighted fields below.", nextFieldErrors);
      return;
    }

    const payload = {
      name,
      city_id: cityId,
      status,
    };

    try {
      if (id) {
        await updateRegion({ id, data: payload }).unwrap();
      } else {
        await createRegion(payload).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      formErrors.apply(err);
    }
  }

  if (citiesLoading && !initial) return <FormLoading />;

  return (
    <LookupFormLayout
      title={id ? "Edit region" : "Add region"}
      description="Regions belong to a city and appear in website filters after a city is selected."
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
        placeholder="region name"
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
        options={activeCountries}
        error={formErrors.field("country_id")}
        onChange={(value) => {
          setCountryId(value);
          setCityId(0);
          formErrors.clearField("country_id");
          formErrors.clearField("city_id");
        }}
      />

      <label className="block min-w-0">
        <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
          City <span className="text-[var(--brand-red)]">*</span>
        </span>
        <select
          value={cityId || ""}
          disabled={!countryId}
          required
          aria-invalid={Boolean(formErrors.field("city_id"))}
          onChange={(event) => {
            setCityId(Number(event.target.value) || 0);
            formErrors.clearField("city_id");
          }}
          className={`${fieldControlClass(formErrors.field("city_id"))} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <option value="">
            {countryId ? "Select city" : "Select a country first"}
          </option>
          {activeCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <FieldErrorText message={formErrors.field("city_id")} />
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
