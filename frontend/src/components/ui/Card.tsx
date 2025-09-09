import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={cn("state-layer card", className)}
      {...props}
    />
  );
}
