'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader';
import { motion } from 'framer-motion';
import Loader from '@/components/ui/Loader';
import { 
  MapPin, 
  Users, 
  Gift, 
  Target, 
  Filter,
  Search,
  Plus,
  Minus,
  Locate,
  Settings
} from 'lucide-react';

interface GoogleMapProps {
  className?: string;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type: 'user' | 'collectible' | 'partner';
  title: string;
  description?: string;
  icon?: string;
}

export function GoogleMap({ className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    users: true,
    collectibles: true,
    partners: true,
  });

  // Mock data for markers
  const mockMarkers: MapMarker[] = [
    {
      id: '1',
      position: { lat: 55.7558, lng: 37.6176 }, // Moscow
      type: 'user',
      title: 'Макс и Бобик',
      description: 'Золотистый ретривер, 3 года',
    },
    {
      id: '2',
      position: { lat: 55.7658, lng: 37.6276 },
      type: 'collectible',
      title: 'Косточка',
      description: 'Редкая косточка +10 очков',
    },
    {
      id: '3',
      position: { lat: 55.7458, lng: 37.6076 },
      type: 'partner',
      title: 'Ветклиника "Друг"',
      description: 'Скидка 15% для участников',
    },
    {
      id: '4',
      position: { lat: 55.7558, lng: 37.6376 },
      type: 'user',
      title: 'Анна и Рекс',
      description: 'Немецкая овчарка, 5 лет',
    },
    {
      id: '5',
      position: { lat: 55.7358, lng: 37.6176 },
      type: 'collectible',
      title: 'Пряжа',
      description: 'Мягкая пряжа +5 очков',
    },
  ];

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new GoogleMapsLoader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo-key',
          version: 'weekly',
          libraries: ['places'],
        });

        const { Map } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');

        if (!mapRef.current) return;

        // Create map
        const mapInstance = new Map(mapRef.current, {
          center: { lat: 55.7558, lng: 37.6176 }, // Moscow
          zoom: 13,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#c9d2c0' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f0f0f0' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#757575' }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);

        // Add markers
        const newMarkers: google.maps.Marker[] = [];
        
        mockMarkers.forEach((markerData) => {
          if (!activeFilters[markerData.type === 'user' ? 'users' : markerData.type === 'collectible' ? 'collectibles' : 'partners']) {
            return;
          }

          const marker = new Marker({
            position: markerData.position,
            map: mapInstance,
            title: markerData.title,
            icon: getMarkerIcon(markerData.type),
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-semibold text-gray-900 mb-1">${markerData.title}</h3>
                <p class="text-sm text-gray-600">${markerData.description || ''}</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Ошибка загрузки карты');
        setIsLoading(false);
      }
    };

    initMap();
  }, [activeFilters]);

  const getMarkerIcon = (type: string) => {
    const baseIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: type === 'user' ? '#AFCBFF' : type === 'collectible' ? '#E8DCA8' : '#A95056',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
    return baseIcon;
  };

  const handleFilterChange = (filter: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom ? currentZoom + 1 : 15);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom ? currentZoom - 1 : 10);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map) {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (isLoading) {
    return <Loader label="Загружаем карту..." />;
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[var(--surface)] ${className}`}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 bg-[var(--danger)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-[var(--danger)]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--text)]">Ошибка загрузки карты</h3>
          <p className="text-[color:var(--dim)] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[var(--honey)] text-[#1C1A19] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--outline)]"
          >
            Попробовать снова
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative bg-surface theme-transition ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-l overflow-hidden" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <motion.button
          onClick={handleZoomIn}
          className="btn btn-ghost p-2 touch-target"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
        </motion.button>
        
        <motion.button
          onClick={handleZoomOut}
          className="btn btn-ghost p-2 touch-target"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Minus className="h-4 w-4" />
        </motion.button>
        
        <motion.button
          onClick={handleLocate}
          className="btn btn-ghost p-2 touch-target"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Locate className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Filter Button */}
      <div className="absolute top-4 left-4">
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
        </motion.button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-4 modal-content p-4 z-10"
          >
            <h3 className="body font-medium mb-3">Показать на карте:</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.users}
                  onChange={() => handleFilterChange('users')}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="caption">Пользователи</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.collectibles}
                  onChange={() => handleFilterChange('collectibles')}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="caption">Предметы</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.partners}
                  onChange={() => handleFilterChange('partners')}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="caption">Партнеры</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 modal-content p-3">
        <div className="flex items-center space-x-4 caption">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-sky-blue"></div>
            <span>Пользователи</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-honey"></div>
            <span>Предметы</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-burgundy"></div>
            <span>Партнеры</span>
          </div>
        </div>
      </div>
    </div>
  );
}