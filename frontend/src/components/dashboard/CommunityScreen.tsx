'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Clock,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location: string;
  dogs: Array<{
    name: string;
    breed: string;
    age: number;
  }>;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
  interests: string[];
  rating: number;
  postsCount: number;
  followersCount: number;
}

export function CommunityScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const mockMembers: CommunityMember[] = [
    {
      id: '1',
      username: 'Анна_Собаковод',
      firstName: 'Анна',
      lastName: 'Петрова',
      avatar: '/api/placeholder/60/60',
      location: 'Москва, Сокольники',
      dogs: [
        { name: 'Бобик', breed: 'Лабрадор', age: 3 },
        { name: 'Мурка', breed: 'Йоркширский терьер', age: 1 }
      ],
      isOnline: true,
      lastActive: '2 минуты назад',
      mutualFriends: 5,
      interests: ['Прогулки', 'Дрессировка', 'Фото'],
      rating: 4.8,
      postsCount: 42,
      followersCount: 156,
    },
    {
      id: '2',
      username: 'Максим_Кинолог',
      firstName: 'Максим',
      lastName: 'Сидоров',
      avatar: '/api/placeholder/60/60',
      location: 'Москва, Арбат',
      dogs: [
        { name: 'Рекс', breed: 'Немецкая овчарка', age: 5 }
      ],
      isOnline: false,
      lastActive: '1 час назад',
      mutualFriends: 3,
      interests: ['Дрессировка', 'Спорт', 'Ветеринария'],
      rating: 4.9,
      postsCount: 78,
      followersCount: 234,
    },
    {
      id: '3',
      username: 'Елена_Ветеринар',
      firstName: 'Елена',
      lastName: 'Козлова',
      avatar: '/api/placeholder/60/60',
      location: 'Москва, Тверская',
      dogs: [
        { name: 'Люси', breed: 'Золотистый ретривер', age: 2 }
      ],
      isOnline: true,
      lastActive: '5 минут назад',
      mutualFriends: 7,
      interests: ['Ветеринария', 'Здоровье', 'Питание'],
      rating: 4.7,
      postsCount: 156,
      followersCount: 445,
    },
  ];

  const filters = [
    { id: 'all', label: 'Все', icon: Users },
    { id: 'online', label: 'Онлайн', icon: Clock },
    { id: 'nearby', label: 'Рядом', icon: MapPin },
    { id: 'popular', label: 'Популярные', icon: TrendingUp },
    { id: 'new', label: 'Новые', icon: UserPlus },
  ];

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'online':
        matchesFilter = member.isOnline;
        break;
      case 'nearby':
        matchesFilter = member.location.includes('Москва');
        break;
      case 'popular':
        matchesFilter = member.followersCount > 200;
        break;
      case 'new':
        matchesFilter = member.postsCount < 50;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Сообщество</h1>
            <p className="text-sm text-purple-600">Другие собачники в вашем районе</p>
          </div>
          <div className="flex items-center space-x-2">
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
            placeholder="Поиск участников..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedFilter === filter.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white/80 text-gray-700 hover:bg-pink-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="space-y-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={member.avatar || '/api/placeholder/60/60'}
                    alt={member.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {member.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{member.firstName} {member.lastName}</h3>
                      <p className="text-sm text-purple-600">@{member.username}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">{member.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">{member.location}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{member.lastActive}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">Собаки:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.dogs.map((dog, dogIndex) => (
                        <span
                          key={dogIndex}
                          className="px-2 py-1 bg-pink-100 text-purple-700 rounded-full text-xs"
                        >
                          {dog.name} ({dog.breed}, {dog.age} лет)
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">Интересы:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest, interestIndex) => (
                        <span
                          key={interestIndex}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{member.postsCount} постов</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{member.followersCount} подписчиков</span>
                      </div>
                      {member.mutualFriends > 0 && (
                        <div className="flex items-center space-x-1">
                          <UserPlus className="h-4 w-4" />
                          <span>{member.mutualFriends} общих друзей</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Написать
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Участники не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}
