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
  useCreateCountryMutation,
  useGetCountryQuery,
  useUpdateCountryMutation,
  type Country,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("countries");

export function CountryForm({ id }: { id?: number }) {
  const { data, isLoading } = useGetCountryQuery(id ?? 0, { skip: !id });

  if (id && isLoading) return <FormLoading />;

  return <CountryFormFields id={id} initial={data} />;
}

function CountryFormFields({ id, initial }: { id?: number; initial?: Country }) {
  const router = useRouter();
  const [createCountry, createState] = useCreateCountryMutation();
  const [updateCountry, updateState] = useUpdateCountryMutation();

  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);
  const [error, setError] = useState<unknown>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      if (id) {
        await updateCountry({ id, data: { name, status } }).unwrap();
      } else {
        await createCountry({ name, status }).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <LookupFormLayout
      title={id ? "Edit country" : "Add country"}
      description="Countries are used by cities and property locations."
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
        placeholder="Turkey"
        onChange={setName}
      />
      <StatusSelect value={status} onChange={setStatus} />
    </LookupFormLayout>
  );
}
