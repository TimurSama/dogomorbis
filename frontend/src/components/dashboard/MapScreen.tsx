'use client';

import { GoogleMap } from '@/components/map/GoogleMap';

export function MapScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 fur-texture overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-pink-200/30 bg-white/90 backdrop-blur-sm soft-shadow pencil-border">
          <h1 className="text-2xl font-bold text-purple-700 font-display">Карта</h1>
          <p className="text-purple-600 mt-1">Найдите собак и предметы поблизости</p>
        </div>

        {/* Карта */}
        <div className="flex-1 relative p-4">
          <GoogleMap className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}