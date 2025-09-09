import { cn } from "@/lib/utils";
import * as React from "react";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full surface text-[color:var(--text)] border border-[color:var(--line)] round-md px-3 py-2 outline-none",
        "placeholder:text-[color:var(--dim)] focus:border-[var(--honey)] focus:[box-shadow:0_0_0_2px_rgba(232,220,168,.18)]",
        className
      )}
      {...props}
    />
  );
}


