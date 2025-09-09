"use client";
import { useTheme } from "@/lib/theme";
import Button from "./Button";
import { DogHouse } from "../icons/DogHouse";

export default function AppBar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="surface border-b border-outline px-4 py-3 flex items-center gap-3 rounded-b-lg">
      <DogHouse />
      <strong className="text-base">Dogymorbis</strong>
      <span className="ml-auto text-[color:var(--dim)] text-sm">Гостевой режим</span>
      <Button variant="ghost" onClick={toggle}>Тема: {theme}</Button>
    </header>
  );
}


