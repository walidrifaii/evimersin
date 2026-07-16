import type { SVGProps } from "react";

export function BedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 7V17M3 14.5H21M21 17V10.5C21 9.1 21 8.4 20.75 7.85C20.53 7.38 20.12 6.97 19.65 6.75C19.1 6.5 18.4 6.5 17 6.5H11V14.5H21ZM8 11C9.1 11 10 10.1 10 9C10 7.9 9.1 7 8 7C6.9 7 6 7.9 6 9C6 10.1 6.9 11 8 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
