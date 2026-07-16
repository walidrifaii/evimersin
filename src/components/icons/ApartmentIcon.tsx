import type { SVGProps } from "react";

export function ApartmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="10"
        y="8"
        width="28"
        height="32"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M16 16h4v4h-4V16ZM28 16h4v4h-4V16ZM16 24h4v4h-4v-4ZM28 24h4v4h-4v-4ZM16 32h4v4h-4v-4ZM28 32h4v4h-4v-4Z"
        fill="currentColor"
      />
    </svg>
  );
}
