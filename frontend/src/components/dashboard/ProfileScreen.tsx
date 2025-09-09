'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Settings, 
  Camera, 
  Plus, 
  Heart, 
  Award, 
  MapPin, 
  Calendar,
  User,
  Dog,
  Crown,
  Star,
  Share,
  LogOut,
  Save,
  Upload,
  X
} from 'lucide-react';

interface ProfileScreenProps {
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function ProfileScreen({ isGuest = false, onShowAuth }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'dogs' | 'achievements'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  if (isGuest) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg)] overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-[var(--surface-2)] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-[var(--dim)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Войдите в аккаунт</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Создайте профиль и добавьте информацию о своих питомцах
            </p>
            <button
              onClick={onShowAuth}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Войти / Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text)]">Профиль</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-[var(--text)]" />
            </button>
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Share className="h-5 w-5 text-[var(--text)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-[var(--surface)] p-6 border-b border-[var(--outline)]">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-[var(--dim)]" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--text)]">Иван Петров</h2>
              <p className="text-[var(--text-secondary)]">@ivan_petrov</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-[var(--dim)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Москва</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-[var(--dim)]" />
                  <span className="text-sm text-[var(--text-secondary)]">На сайте 2 года</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--surface)] border-b border-[var(--outline)]">
          <div className="flex">
            {[
              { id: 'profile', label: 'Профиль', icon: User },
              { id: 'dogs', label: 'Собаки', icon: Dog },
              { id: 'achievements', label: 'Достижения', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Информация</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      О себе
                    </label>
                    <p className="text-[var(--text-secondary)]">
                      Люблю собак и активный образ жизни. Занимаюсь дрессировкой и участвую в выставках.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Интересы
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Дрессировка', 'Выставки', 'Прогулки', 'Фото'].map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dogs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text)]">Мои собаки</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  <span>Добавить</span>
                </button>
              </div>
              <div className="grid gap-4">
                {[
                  { name: 'Бобик', breed: 'Лабрадор', age: 3, gender: 'Мальчик' },
                  { name: 'Мурка', breed: 'Йоркширский терьер', age: 1, gender: 'Девочка' },
                ].map((dog, index) => (
                  <div key={index} className="bg-[var(--surface-2)] rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[var(--surface)] rounded-full flex items-center justify-center">
                        <Dog className="h-6 w-6 text-[var(--dim)]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--text)]">{dog.name}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{dog.breed}, {dog.age} лет, {dog.gender}</p>
                      </div>
                      <button className="p-2 hover:bg-[var(--surface)] rounded-lg">
                        <Edit className="h-4 w-4 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text)]">Достижения</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Первая прогулка', icon: Heart, earned: true },
                  { title: '100 км пройдено', icon: Award, earned: true },
                  { title: 'Социальная активность', icon: Star, earned: false },
                  { title: 'Эксперт', icon: Crown, earned: false },
                ].map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.earned
                          ? 'bg-green-50 border-green-200'
                          : 'bg-[var(--surface-2)] border-[var(--outline)]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`h-6 w-6 ${
                            achievement.earned ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            achievement.earned ? 'text-green-900' : 'text-[var(--dim)]'
                          }`}
                        >
                          {achievement.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}