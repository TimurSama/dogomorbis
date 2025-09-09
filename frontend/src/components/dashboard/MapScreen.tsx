'use client';

export function MapScreen() {
  return (
    <div className="h-full bg-[var(--surface)] overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Карта</h2>
          <p className="text-[var(--text-secondary)]">Карта временно отключена для отладки</p>
        </div>
      </div>
    </div>
  );
}