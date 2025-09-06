'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Calendar,
  MapPin,
  Users,
  Heart,
  Zap,
  Crown,
  Medal,
  Badge,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'walking' | 'training' | 'social' | 'health' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  reward?: string;
  requirements: string[];
}

export function AchievementsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Первые шаги',
      description: 'Совершите первую прогулку с собакой',
      category: 'walking',
      rarity: 'common',
      icon: '🚶‍♂️',
      isUnlocked: true,
      unlockedAt: '2024-01-10',
      reward: '10 косточек',
      requirements: ['Совершить 1 прогулку']
    },
    {
      id: '2',
      title: 'Мастер прогулок',
      description: 'Совершите 100 прогулок',
      category: 'walking',
      rarity: 'rare',
      icon: '🏃‍♂️',
      isUnlocked: false,
      progress: 45,
      maxProgress: 100,
      reward: '50 косточек + специальный ошейник',
      requirements: ['Совершить 100 прогулок']
    },
    {
      id: '3',
      title: 'Социальная бабочка',
      description: 'Познакомьтесь с 10 другими собачниками',
      category: 'social',
      rarity: 'epic',
      icon: '🦋',
      isUnlocked: false,
      progress: 7,
      maxProgress: 10,
      reward: '100 косточек + значок "Социальный"',
      requirements: ['Добавить 10 друзей']
    },
    {
      id: '4',
      title: 'Дрессировщик года',
      description: 'Пройдите 50 занятий по дрессировке',
      category: 'training',
      rarity: 'legendary',
      icon: '🎓',
      isUnlocked: false,
      progress: 12,
      maxProgress: 50,
      reward: '500 косточек + золотой ошейник + титул "Дрессировщик"',
      requirements: ['Пройдите 50 занятий', 'Получите оценку 5 звезд']
    },
    {
      id: '5',
      title: 'Здоровый образ жизни',
      description: 'Ведите активный образ жизни 30 дней подряд',
      category: 'health',
      rarity: 'rare',
      icon: '💪',
      isUnlocked: true,
      unlockedAt: '2024-01-05',
      reward: '25 косточек + браслет здоровья',
      requirements: ['30 дней активности подряд']
    },
    {
      id: '6',
      title: 'Исследователь',
      description: 'Посетите 20 разных мест для прогулок',
      category: 'walking',
      rarity: 'epic',
      icon: '🗺️',
      isUnlocked: false,
      progress: 8,
      maxProgress: 20,
      reward: '75 косточек + карта исследователя',
      requirements: ['Посетить 20 уникальных мест']
    },
    {
      id: '7',
      title: 'Сердце золота',
      description: 'Участвуйте в 5 благотворительных акциях',
      category: 'special',
      rarity: 'legendary',
      icon: '❤️',
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
      reward: '200 косточек + титул "Благотворитель" + специальный значок',
      requirements: ['Участвовать в 5 акциях', 'Пожертвовать минимум 1000 рублей']
    },
    {
      id: '8',
      title: 'Скоростной',
      description: 'Пройдите 10 км за одну прогулку',
      category: 'walking',
      rarity: 'rare',
      icon: '⚡',
      isUnlocked: true,
      unlockedAt: '2024-01-12',
      reward: '30 косточек + спортивный ошейник',
      requirements: ['Пройдите 10 км за раз']
    }
  ];

  const categories = [
    { id: 'all', label: 'Все', icon: Award },
    { id: 'walking', label: 'Прогулки', icon: MapPin },
    { id: 'training', label: 'Дрессировка', icon: Target },
    { id: 'social', label: 'Социальные', icon: Users },
    { id: 'health', label: 'Здоровье', icon: Heart },
    { id: 'special', label: 'Особые', icon: Crown },
  ];

  const rarities = [
    { id: 'all', label: 'Все', color: 'bg-gray-100 text-gray-700' },
    { id: 'common', label: 'Обычные', color: 'bg-gray-100 text-gray-700' },
    { id: 'rare', label: 'Редкие', color: 'bg-blue-100 text-blue-700' },
    { id: 'epic', label: 'Эпические', color: 'bg-purple-100 text-purple-700' },
    { id: 'legendary', label: 'Легендарные', color: 'bg-yellow-100 text-yellow-700' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-purple-100 text-purple-700';
      case 'legendary': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return matchesCategory && matchesRarity;
  });

  const unlockedCount = mockAchievements.filter(a => a.isUnlocked).length;
  const totalCount = mockAchievements.length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Достижения</h1>
            <p className="text-sm text-purple-600">Ваши награды и прогресс</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{unlockedCount}/{totalCount}</div>
            <div className="text-sm text-purple-600">достижений</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <span>Общий прогресс</span>
            <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-300 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-2">Категории:</p>
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
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-2">Редкость:</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {rarities.map((rarity) => (
              <button
                key={rarity.id}
                onClick={() => setSelectedRarity(rarity.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedRarity === rarity.id
                    ? 'ring-2 ring-purple-500'
                    : ''
                } ${rarity.color}`}
              >
                {rarity.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture ${
                achievement.isUnlocked ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-4xl ${achievement.isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{achievement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{achievement.description}</p>
                  
                  {achievement.isUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span>Разблокировано {achievement.unlockedAt}</span>
                      </div>
                      {achievement.reward && (
                        <div className="text-sm text-purple-600">
                          <strong>Награда:</strong> {achievement.reward}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                            <span>Прогресс</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-pink-300 to-purple-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {achievement.reward && (
                        <div className="text-sm text-gray-600">
                          <strong>Награда:</strong> {achievement.reward}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-1">Требования:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {achievement.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center space-x-1">
                          <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Достижения не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры</p>
          </div>
        )}
      </div>
    </div>
  );
}
