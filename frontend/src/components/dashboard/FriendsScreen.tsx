'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

export function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const mockFriends = [
    {
      id: '1',
      name: 'Анна Петрова',
      username: '@anna_petrov',
      avatar: '/api/placeholder/60/60',
      location: 'Москва, Сокольники',
      isOnline: true,
      lastActive: '2 минуты назад',
      mutualFriends: 5,
      dogs: ['Бобик (Лабрадор)', 'Мурка (Йоркширский терьер)'],
      interests: ['Прогулки', 'Дрессировка', 'Фото'],
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Максим Сидоров',
      username: '@maxim_sidorov',
      avatar: '/api/placeholder/60/60',
      location: 'Москва, Арбат',
      isOnline: false,
      lastActive: '1 час назад',
      mutualFriends: 3,
      dogs: ['Рекс (Немецкая овчарка)'],
      interests: ['Дрессировка', 'Спорт', 'Ветеринария'],
      rating: 4.9,
    },
  ];

  const filters = [
    { id: 'all', label: 'Все', icon: Users },
    { id: 'online', label: 'Онлайн', icon: Clock },
    { id: 'nearby', label: 'Рядом', icon: MapPin },
    { id: 'popular', label: 'Популярные', icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">Друзья</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Filter className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск друзей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--surface)] text-[var(--text)]"
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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {mockFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text)]">{friend.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{friend.username}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">{friend.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{friend.location}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{friend.lastActive}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">Собаки:</p>
                    <div className="flex flex-wrap gap-2">
                      {friend.dogs.map((dog, dogIndex) => (
                        <span
                          key={dogIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {dog}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">Интересы:</p>
                    <div className="flex flex-wrap gap-2">
                      {friend.interests.map((interest, interestIndex) => (
                        <span
                          key={interestIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{friend.mutualFriends} общих друзей</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <MessageCircle className="h-4 w-4 mr-1 inline" />
                        Написать
                      </button>
                      <button className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <UserMinus className="h-4 w-4 mr-1 inline" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}