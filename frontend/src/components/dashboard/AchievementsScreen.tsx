'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Heart, 
  MapPin, 
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Crown,
  Medal
} from 'lucide-react';

export function AchievementsScreen() {
  const [activeCategory, setActiveCategory] = useState('all');

  const mockAchievements = [
    {
      id: '1',
      title: 'Первая прогулка',
      description: 'Совершите первую прогулку с собакой',
      icon: Heart,
      category: 'activity',
      isEarned: true,
      earnedDate: '10 марта 2024',
      progress: 100,
      points: 10,
      rarity: 'common',
    },
    {
      id: '2',
      title: '100 км пройдено',
      description: 'Пройдите 100 километров с собакой',
      icon: MapPin,
      category: 'distance',
      isEarned: true,
      earnedDate: '12 марта 2024',
      progress: 100,
      points: 50,
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Социальная активность',
      description: 'Поделитесь 10 постами в сообществе',
      icon: Users,
      category: 'social',
      isEarned: false,
      earnedDate: null,
      progress: 60,
      points: 25,
      rarity: 'uncommon',
    },
    {
      id: '4',
      title: 'Эксперт по дрессировке',
      description: 'Обучите собаку 5 командам',
      icon: Target,
      category: 'training',
      isEarned: false,
      earnedDate: null,
      progress: 40,
      points: 100,
      rarity: 'epic',
    },
  ];

  const categories = [
    { id: 'all', label: 'Все', icon: Award },
    { id: 'activity', label: 'Активность', icon: Heart },
    { id: 'distance', label: 'Дистанция', icon: MapPin },
    { id: 'social', label: 'Социальные', icon: Users },
    { id: 'training', label: 'Дрессировка', icon: Target },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-[var(--surface-2)] text-[var(--text)]';
      case 'uncommon': return 'bg-green-100 text-green-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-blue-100 text-blue-700';
      case 'legendary': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-[var(--surface-2)] text-[var(--text)]';
    }
  };

  const filteredAchievements = mockAchievements.filter(achievement => 
    activeCategory === 'all' || achievement.category === activeCategory
  );

  const earnedCount = mockAchievements.filter(a => a.isEarned).length;
  const totalPoints = mockAchievements.filter(a => a.isEarned).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">Достижения</h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--text)]">{earnedCount}/{mockAchievements.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">достижений</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[var(--surface-2)] rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-[var(--text)]">Очки</span>
            </div>
            <div className="text-xl font-bold text-[var(--text)]">{totalPoints}</div>
          </div>
          <div className="bg-[var(--surface-2)] rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-[var(--text)]">Уровень</span>
            </div>
            <div className="text-xl font-bold text-[var(--text)]">5</div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredAchievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border-2 p-4 ${
                  achievement.isEarned
                    ? 'bg-green-50 border-green-200'
                    : 'bg-[var(--surface-2)] border-[var(--outline)]'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    achievement.isEarned ? 'bg-green-100' : 'bg-[var(--surface-2)]'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      achievement.isEarned ? 'text-green-600' : 'text-[var(--dim)]'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        achievement.isEarned ? 'text-green-900' : 'text-[var(--text)]'
                      }`}>
                        {achievement.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {achievement.points} очков
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      achievement.isEarned ? 'text-green-700' : 'text-[var(--text-secondary)]'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.isEarned ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Calendar className="h-4 w-4" />
                        <span>Получено {achievement.earnedDate}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                          <span>Прогресс</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-[var(--surface)] rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}