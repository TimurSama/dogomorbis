'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { motion } from 'framer-motion';
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
import { Button } from '@/components/ui/button';

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

        const loader = new Loader({
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
                <h3 class="font-semibold text-purple-700 mb-1">${markerData.title}</h3>
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
      fillColor: type === 'user' ? '#ec4899' : type === 'collectible' ? '#f59e0b' : '#8b5cf6',
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
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600">Загружаем карту...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ошибка загрузки карты</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-3xl overflow-hidden" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-white/90 backdrop-blur-sm border-pink-200/30 hover:bg-pink-50"
        >
          <Plus className="h-4 w-4 text-purple-600" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white/90 backdrop-blur-sm border-pink-200/30 hover:bg-pink-50"
        >
          <Minus className="h-4 w-4 text-purple-600" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleLocate}
          className="bg-white/90 backdrop-blur-sm border-pink-200/30 hover:bg-pink-50"
        >
          <Locate className="h-4 w-4 text-purple-600" />
        </Button>
      </div>

      {/* Filter Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white/90 backdrop-blur-sm border-pink-200/30 hover:bg-pink-50"
        >
          <Filter className="h-4 w-4 mr-2 text-purple-600" />
          Фильтры
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-16 left-4 bg-white/95 backdrop-blur-sm border border-pink-200/30 rounded-2xl p-4 soft-shadow pencil-border"
        >
          <h3 className="text-sm font-semibold text-purple-700 mb-3">Показать на карте:</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.users}
                onChange={() => handleFilterChange('users')}
                className="rounded border-pink-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Пользователи</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.collectibles}
                onChange={() => handleFilterChange('collectibles')}
                className="rounded border-pink-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Предметы</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.partners}
                onChange={() => handleFilterChange('partners')}
                className="rounded border-pink-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Партнеры</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-pink-200/30 rounded-2xl p-3 soft-shadow pencil-border">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-gray-700">Пользователи</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-700">Предметы</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-700">Партнеры</span>
          </div>
        </div>
      </div>
    </div>
  );
}
