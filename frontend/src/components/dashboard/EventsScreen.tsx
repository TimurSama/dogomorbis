'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  isJoined: boolean;
  category: 'walk' | 'training' | 'competition' | 'social' | 'charity';
  image?: string;
}

export function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Групповая прогулка в парке',
      description: 'Присоединяйтесь к нам для веселой прогулки с собаками в парке Сокольники!',
      date: '2024-01-20',
      time: '10:00',
      location: 'Парк Сокольники',
      organizer: 'Анна_Собаковод',
      participants: 12,
      maxParticipants: 20,
      isJoined: false,
      category: 'walk',
    },
    {
      id: '2',
      title: 'Дрессировка для начинающих',
      description: 'Базовые команды и социализация для щенков и молодых собак.',
      date: '2024-01-22',
      time: '15:00',
      location: 'Кинологический центр "Друг"',
      organizer: 'Максим_Кинолог',
      participants: 8,
      maxParticipants: 15,
      isJoined: true,
      category: 'training',
    },
    {
      id: '3',
      title: 'Благотворительная акция',
      description: 'Сбор средств для приюта бездомных животных.',
      date: '2024-01-25',
      time: '12:00',
      location: 'ТЦ "Мега"',
      organizer: 'Приют_Надежда',
      participants: 25,
      maxParticipants: 50,
      isJoined: false,
      category: 'charity',
    },
  ];

  const categories = [
    { id: 'all', label: 'Все', icon: Calendar },
    { id: 'walk', label: 'Прогулки', icon: MapPin },
    { id: 'training', label: 'Дрессировка', icon: Users },
    { id: 'competition', label: 'Соревнования', icon: Heart },
    { id: 'social', label: 'Социальные', icon: Users },
    { id: 'charity', label: 'Благотворительность', icon: Heart },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'walk': return 'bg-green-100 text-green-700';
      case 'training': return 'bg-blue-100 text-blue-700';
      case 'competition': return 'bg-red-100 text-red-700';
      case 'social': return 'bg-purple-100 text-purple-700';
      case 'charity': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">События</h1>
            <p className="text-sm text-purple-600">Ближайшие мероприятия для собачников</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" />
              Создать событие
            </Button>
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white/80 text-gray-700 hover:bg-pink-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {categories.find(c => c.id === event.category)?.label}
                    </span>
                    {event.isJoined && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Участвую
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-700 mb-3">{event.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{event.participants}/{event.maxParticipants}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Организатор: <span className="font-medium text-purple-600">{event.organizer}</span>
                </div>
                <Button
                  variant={event.isJoined ? "outline" : "default"}
                  size="sm"
                  className={event.isJoined 
                    ? "text-red-600 border-red-300 hover:bg-red-50" 
                    : "bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
                  }
                >
                  {event.isJoined ? 'Отменить участие' : 'Присоединиться'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">События не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или создать новое событие</p>
          </div>
        )}
      </div>
    </div>
  );
}
