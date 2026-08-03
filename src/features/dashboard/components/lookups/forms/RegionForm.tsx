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

  const activeCities = useMemo(
    () => cities.filter((city) => Number(city.status) === 1),
    [cities],
  );

  const defaultCityId =
    initial?.city_id ?? activeCities[0]?.id ?? cities[0]?.id ?? 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [cityId, setCityId] = useState<number>(defaultCityId);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!cityId) {
      setError(new Error("Please select a city first."));
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
      setError(err);
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
      error={error}
    >
      <TextInput
        label="Name"
        value={name}
        required
        placeholder="Yenişehir"
        onChange={setName}
      />

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
          City
        </span>
        <select
          value={cityId || ""}
          required
          onChange={(event) => setCityId(Number(event.target.value))}
          className="h-11 w-full rounded-xl border border-[#d7dee8] bg-white px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)]"
        >
          <option value="" disabled>
            Select city
          </option>
          {(activeCities.length > 0 ? activeCities : cities).map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
