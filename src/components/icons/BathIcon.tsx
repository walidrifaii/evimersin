import type { SVGProps } from "react";

export function BathIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 16H20M4 16C4 14.9 4.9 14 6 14H7M4 16V20M20 16V20M15 7C15 8.1 14.1 9 13 9C11.9 9 11 8.1 11 7V5L13 4V7C13 7 14 7.5 15 7ZM7 14V12C7 10 9 9 11 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
