"use client";

import { useState } from "react";
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
  useUpdateCityMutation,
  type City,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("cities");
/** Lebanon is fixed as country id 1 in the database. */
const LEBANON_COUNTRY_ID = 1;

export function CityForm({ id }: { id?: number }) {
  const { data = [], isLoading } = useGetCitiesQuery();
  const existing = id ? data.find((city) => city.id === id) : undefined;

  if (id && isLoading) return <FormLoading />;

  return <CityFormFields id={id} initial={existing} />;
}

function CityFormFields({ id, initial }: { id?: number; initial?: City }) {
  const router = useRouter();
  const [createCity, createState] = useCreateCityMutation();
  const [updateCity, updateState] = useUpdateCityMutation();

  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      name,
      country_id: LEBANON_COUNTRY_ID,
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
