"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  elev?: 0 | 1 | 2;
  loading?: boolean;
};

export function Button({ variant="primary", elev=1, className, children, loading, disabled, ...rest }: Props) {
  const base = cn(
    "state-layer inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-[var(--radius-md)]",
    "transition-[box-shadow,transform,border-color] duration-150 ease-out"
  );
  const palette =
    variant==="primary"
      ? "bg-[var(--honey)] text-[#1C1A19] border border-[var(--outline)]"
      : variant==="secondary"
      ? "bg-[var(--sky)] text-[#1F1E1C] border border-[var(--outline)]"
      : "bg-transparent text-[color:var(--text)] border border-[color:var(--line)]";
  const elevClass = elev===0 ? "elev-0" : elev===2 ? "elev-2" : "elev-1";

  return (
    <motion.button
      whileHover={{ translateY: -1 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.9 }}
      className={cn(base, palette, elevClass, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </motion.button>
  );
}

export default Button;