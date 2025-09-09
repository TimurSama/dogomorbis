import { cn } from "@/lib/utils";

export default function Chip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface-2 border border-outline round-sm text-sm px-2.5 py-1 inline-flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
}


