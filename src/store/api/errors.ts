type ZodFlattenedErrors = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

export type ApiErrorBody = {
  success?: false;
  message?: string;
  errors?: ZodFlattenedErrors;
};

export type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
  formErrors: string[];
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  password: "Password",
  username: "Username",
  first_name: "First name",
  last_name: "Last name",
  country_id: "Country",
  city_id: "City",
  category_id: "Category",
  purpose_id: "Purpose",
  region_id: "Region",
  whatsapp_phone: "WhatsApp number",
  whatsapp_message: "WhatsApp message",
  address_name: "Office name",
  address: "Street address",
  discount_value: "Discount value",
  discount_type: "Discount type",
  price: "Price",
  position: "Position",
  alt_text: "Alt text",
  sort_order: "Sort order",
  title: "Title",
  message: "Message",
  emailOtp: "Verification code",
  permissions: "Permissions",
};

function isRtkQueryError(
  error: unknown,
): error is { data: ApiErrorBody } {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data: unknown }).data === "object" &&
    (error as { data: unknown }).data !== null
  );
}

function firstFieldError(fieldErrors: Record<string, string>): string | undefined {
  return Object.values(fieldErrors)[0];
}

export function humanizeFieldName(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];

  if (field.endsWith("_url")) {
    const platform = field.replace(/_url$/, "").replace(/_/g, " ");
    return `${platform.charAt(0).toUpperCase()}${platform.slice(1)} URL`;
  }

  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {}, formErrors: [] };
  }

  if (typeof error === "string") {
    return { message: error, fieldErrors: {}, formErrors: [] };
  }

  if (!isRtkQueryError(error)) {
    return { message: "Request failed", fieldErrors: {}, formErrors: [] };
  }

  const fieldErrors: Record<string, string> = {};
  const formErrors: string[] = [];
  const flat = error.data.errors;

  if (flat && typeof flat === "object") {
    if (Array.isArray(flat.formErrors)) {
      formErrors.push(...flat.formErrors.filter((item) => typeof item === "string"));
    }
    if (flat.fieldErrors && typeof flat.fieldErrors === "object") {
      for (const [key, messages] of Object.entries(flat.fieldErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === "string") {
          fieldErrors[key] = messages[0];
        }
      }
    }
  }

  let message =
    typeof error.data.message === "string" ? error.data.message : "Request failed";

  if (message === "Validation failed") {
    if (formErrors.length > 0) {
      message = formErrors[0];
    } else if (Object.keys(fieldErrors).length > 0) {
      message = "Please fix the highlighted fields below.";
    }
  }

  if (message === "Request failed" && Object.keys(fieldErrors).length > 0) {
    message = firstFieldError(fieldErrors) ?? message;
  }

  return { message, fieldErrors, formErrors };
}

export function getApiErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  return parseApiError(error).fieldErrors;
}
