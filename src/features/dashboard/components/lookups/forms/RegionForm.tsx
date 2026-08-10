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
  useCreateRegionMutation,
  useGetCitiesQuery,
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
  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery();
  const [createRegion, createState] = useCreateRegionMutation();
  const [updateRegion, updateState] = useUpdateRegionMutation();
  const formErrors = useDashboardFormErrors();

  const activeCities = useMemo(
    () => cities.filter((city) => Number(city.status) === 1),
    [cities],
  );

  const defaultCityId =
    initial?.city_id ?? activeCities[0]?.id ?? cities[0]?.id ?? 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [cityId, setCityId] = useState<number>(defaultCityId);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    if (!cityId) {
      formErrors.setLocal("Please select a city first.", {
        city_id: "City is required",
      });
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
        placeholder="Yenişehir"
        error={formErrors.field("name")}
        onChange={(value) => {
          setName(value);
          formErrors.clearField("name");
        }}
      />

      <SelectField
        label="City"
        value={cityId}
        required
        placeholder="Select city"
        options={activeCities.length > 0 ? activeCities : cities}
        error={formErrors.field("city_id")}
        onChange={(value) => {
          setCityId(value);
          formErrors.clearField("city_id");
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
