import type { SVGProps } from "react";

/** Brand mark: blue multi-point star with a red vertical accent. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M24 3.5 27.8 16.2 41 17.1 30.8 25.8 34 38.5 24 31.4 14 38.5 17.2 25.8 7 17.1 20.2 16.2 24 3.5Z"
        fill="#1E5AA8"
      />
      <path
        d="M24 3.5 27.8 16.2 41 17.1 30.8 25.8 34 38.5 24 31.4V3.5Z"
        fill="#E31C23"
      />
      <path
        d="M24 10.5 26.4 18.2 34.5 18.8 28.2 23.8 30.1 31.8 24 26.9 17.9 31.8 19.8 23.8 13.5 18.8 21.6 18.2 24 10.5Z"
        fill="#2F74C8"
      />
      <rect x="22.2" y="2.8" width="3.6" height="34" rx="1.2" fill="#E31C23" />
    </svg>
  );
}
