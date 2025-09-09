import { DogHouse } from "../icons/DogHouse";
import { Tree } from "../icons/Tree";
import { PawHeart } from "../icons/PawHeart";
import { Medallion } from "../icons/Medallion";
import { EarBubble } from "../icons/EarBubble";

export default function BottomNav() {
  const item = "state-layer flex flex-col items-center gap-1 px-2 py-2 rounded-[var(--radius-sm)] text-[color:var(--dim)] transition-transform";
  const active = "bg-[var(--surface-2)] text-[color:var(--text)] elev-1";
  return (
    <nav className="surface border-t border-outline px-2 py-2 grid grid-cols-5 gap-2 sticky bottom-0">
      <a className={`${item} ${active}`}><DogHouse /></a>
      <a className={item}><Tree /></a>
      <a className={item}><PawHeart /></a>
      <a className={item}><EarBubble /></a>
      <a className={item}><Medallion /></a>
    </nav>
  );
}
