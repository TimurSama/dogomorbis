import * as React from "react";
export function Medallion(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2}/>
      <path d="M8 12h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      <path d="M12 8v8" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  );
}
