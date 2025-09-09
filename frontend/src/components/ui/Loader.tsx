"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Kind = "ball" | "pawtrail" | "medallion";

const choices: Kind[] = ["ball", "pawtrail", "medallion"];

export default function Loader({ label = "Загружаем…" }: { label?: string }) {
  const kind = useMemo<Kind>(() => choices[Math.floor(Math.random() * choices.length)], []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 grid place-items-center [background:color-mix(in_srgb,_var(--bg)_92%,_transparent)] backdrop-blur-sm z-[9999]"
      role="status" aria-live="polite"
    >
      <div className="grid place-items-center gap-3">
        {ready && (
          <object
            data={
              kind === "ball"
                ? "/assets/loaders/loader-ball.svg"
                : kind === "pawtrail"
                ? "/assets/loaders/loader-pawtrail.svg"
                : "/assets/loaders/loader-medallion.svg"
            }
            type="image/svg+xml"
            width={72}
            height={72}
          />
        )}
        <div className="text-sm text-[color:var(--dim)]">{label}</div>
      </div>
    </motion.div>
  );
}


