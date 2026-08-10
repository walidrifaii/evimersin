"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { routes } from "@/constants/routes";
import { useDashboardFormErrors } from "@/features/dashboard/hooks/useDashboardFormErrors";
import {
  FormLoading,
  LookupFormLayout,
  StatusSelect,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import {
  useCreatePurposeMutation,
  useGetPurposeQuery,
  useUpdatePurposeMutation,
  type Purpose,
  type Status,
} from "@/store/slices/admin";

const backHref = routes.dashboardTab("purposes");

export function PurposeForm({ id }: { id?: number }) {
  const { data, isLoading } = useGetPurposeQuery(id ?? 0, { skip: !id });

  if (id && isLoading) return <FormLoading />;

  return <PurposeFormFields id={id} initial={data} />;
}

function PurposeFormFields({ id, initial }: { id?: number; initial?: Purpose }) {
  const router = useRouter();
  const [createPurpose, createState] = useCreatePurposeMutation();
  const [updatePurpose, updateState] = useUpdatePurposeMutation();
  const formErrors = useDashboardFormErrors();

  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState<number>(initial?.position ?? 0);
  const [status, setStatus] = useState<Status>(initial?.status ?? 1);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    const payload = { name, status, position: Number(position) || 0 };

    try {
      if (id) {
        await updatePurpose({ id, data: payload }).unwrap();
      } else {
        await createPurpose(payload).unwrap();
      }
      router.push(backHref);
    } catch (err) {
      formErrors.apply(err);
    }
  }

  return (
    <LookupFormLayout
      title={id ? "Edit purpose" : "Add purpose"}
      description="Purposes describe listing intent such as sale, rent, or investment."
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
        placeholder="For Sale"
        error={formErrors.field("name")}
        onChange={(value) => {
          setName(value);
          formErrors.clearField("name");
        }}
      />
      <TextInput
        label="Position"
        type="number"
        value={position}
        error={formErrors.field("position")}
        onChange={(value) => {
          setPosition(Number(value) || 0);
          formErrors.clearField("position");
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
