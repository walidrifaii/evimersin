import type { SVGProps } from "react";

export function BadgeCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 3L14.2 4.1L16.7 3.8L17.8 6L20 7.1L19.7 9.6L21 11.8L19 13.5L18.7 16L16.5 16.8L15.4 19L12 18.2L8.6 19L7.5 16.8L5.3 16L5 13.5L3 11.8L4.3 9.6L4 7.1L6.2 6L7.3 3.8L9.8 4.1L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
