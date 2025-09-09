import * as React from "react";
export function PawHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M19.14 12.94a4 4 0 0 0-1.06-1.76l-8-7.5a4 4 0 0 0-5.12 0l-8 7.5A4 4 0 0 0 2 15.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.5a4 4 0 0 0-2.86-3.56Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8l2 2 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
