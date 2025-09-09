'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share, 
  Filter,
  Search,
  Plus,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

export function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const mockEvents = [
    {
      id: '1',
      title: 'Выставка собак "Весна 2024"',
      description: 'Ежегодная выставка собак в парке Сокольники',
      date: '15 марта 2024',
      time: '10:00 - 18:00',
      location: 'Парк Сокольники, Москва',
      organizer: 'Кинологический клуб Москвы',
      participants: 156,
      maxParticipants: 200,
      price: 'Бесплатно',
      category: 'Выставка',
      isJoined: false,
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Групповая прогулка в Измайловском парке',
      description: 'Присоединяйтесь к нашей еженедельной прогулке с собаками',
      date: '17 марта 2024',
      time: '14:00 - 16:00',
      location: 'Измайловский парк, Москва',
      organizer: 'Сообщество собачников',
      participants: 23,
      maxParticipants: 30,
      price: 'Бесплатно',
      category: 'Прогулка',
      isJoined: true,
      isFavorite: false,
    },
  ];

  const filters = [
    { id: 'all', label: 'Все', icon: Calendar },
    { id: 'today', label: 'Сегодня', icon: Clock },
    { id: 'nearby', label: 'Рядом', icon: MapPin },
    { id: 'popular', label: 'Популярные', icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">События</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg">
              <Filter className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg">
              <Plus className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--dim)]" />
          <input
            type="text"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--outline)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--surface)] text-[var(--text)]"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {mockEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-1">{event.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">{event.description}</p>
                </div>
                <button className={`p-2 ${event.isFavorite ? 'text-red-500' : 'text-[var(--dim)] hover:text-red-500'}`}>
                  <Heart className={`h-5 w-5 ${event.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Users className="h-4 w-4" />
                  <span>{event.participants}/{event.maxParticipants} участников</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {event.category}
                  </span>
                  <span className="text-sm font-medium text-[var(--text)]">{event.price}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg">
                    <Share className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      event.isJoined
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {event.isJoined ? 'Участвую' : 'Присоединиться'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}