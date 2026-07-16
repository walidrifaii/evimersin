import type { SVGProps } from "react";

export function DollarCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5V16.5M10 9.5C10 8.7 10.7 8 12 8C13.3 8 14 8.7 14 9.5C14 10.3 13.3 11 12 11C10.7 11 10 11.7 10 12.5C10 13.3 10.7 14 12 14C13.3 14 14 14.7 14 15.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
