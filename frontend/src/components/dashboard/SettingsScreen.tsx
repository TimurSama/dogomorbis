'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  LogOut,
  Save,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsSection {
  id: string;
  title: string;
  icon: any;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'button' | 'slider';
  value: any;
  options?: Array<{ label: string; value: any }>;
  action?: () => void;
}

export function SettingsScreen() {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [settings, setSettings] = useState({
    // Profile
    firstName: 'Анна',
    lastName: 'Петрова',
    username: 'Анна_Собаковод',
    email: 'anna@example.com',
    phone: '+7 (999) 123-45-67',
    bio: 'Люблю прогулки с собакой и активный образ жизни',
    
    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newMessages: true,
    newFriends: true,
    events: true,
    promotions: false,
    
    // Privacy
    profileVisibility: 'public',
    showLocation: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowMessages: 'friends',
    
    // Appearance
    theme: 'light',
    language: 'ru',
    fontSize: 'medium',
    animations: true,
    
    // Location
    locationServices: true,
    shareLocation: 'friends',
    autoLocation: true,
    
    // Sound
    soundEnabled: true,
    vibrationEnabled: true,
    notificationSound: 'default',
    volume: 70,
    
    // Data
    autoBackup: true,
    dataUsage: 'wifi',
    cacheSize: '256MB',
  });

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Профиль',
      icon: User,
      items: [
        {
          id: 'firstName',
          label: 'Имя',
          type: 'input',
          value: settings.firstName,
        },
        {
          id: 'lastName',
          label: 'Фамилия',
          type: 'input',
          value: settings.lastName,
        },
        {
          id: 'username',
          label: 'Имя пользователя',
          type: 'input',
          value: settings.username,
        },
        {
          id: 'email',
          label: 'Email',
          type: 'input',
          value: settings.email,
        },
        {
          id: 'phone',
          label: 'Телефон',
          type: 'input',
          value: settings.phone,
        },
        {
          id: 'bio',
          label: 'О себе',
          type: 'input',
          value: settings.bio,
        },
      ]
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: Bell,
      items: [
        {
          id: 'pushNotifications',
          label: 'Push-уведомления',
          description: 'Получать уведомления в приложении',
          type: 'toggle',
          value: settings.pushNotifications,
        },
        {
          id: 'emailNotifications',
          label: 'Email уведомления',
          description: 'Получать уведомления на email',
          type: 'toggle',
          value: settings.emailNotifications,
        },
        {
          id: 'smsNotifications',
          label: 'SMS уведомления',
          description: 'Получать уведомления по SMS',
          type: 'toggle',
          value: settings.smsNotifications,
        },
        {
          id: 'newMessages',
          label: 'Новые сообщения',
          type: 'toggle',
          value: settings.newMessages,
        },
        {
          id: 'newFriends',
          label: 'Запросы в друзья',
          type: 'toggle',
          value: settings.newFriends,
        },
        {
          id: 'events',
          label: 'События',
          type: 'toggle',
          value: settings.events,
        },
        {
          id: 'promotions',
          label: 'Акции и предложения',
          type: 'toggle',
          value: settings.promotions,
        },
      ]
    },
    {
      id: 'privacy',
      title: 'Приватность',
      icon: Shield,
      items: [
        {
          id: 'profileVisibility',
          label: 'Видимость профиля',
          type: 'select',
          value: settings.profileVisibility,
          options: [
            { label: 'Публичный', value: 'public' },
            { label: 'Только друзья', value: 'friends' },
            { label: 'Приватный', value: 'private' },
          ]
        },
        {
          id: 'showLocation',
          label: 'Показывать местоположение',
          type: 'toggle',
          value: settings.showLocation,
        },
        {
          id: 'showOnlineStatus',
          label: 'Показывать статус онлайн',
          type: 'toggle',
          value: settings.showOnlineStatus,
        },
        {
          id: 'allowFriendRequests',
          label: 'Разрешить запросы в друзья',
          type: 'toggle',
          value: settings.allowFriendRequests,
        },
        {
          id: 'allowMessages',
          label: 'Кто может писать сообщения',
          type: 'select',
          value: settings.allowMessages,
          options: [
            { label: 'Все', value: 'everyone' },
            { label: 'Только друзья', value: 'friends' },
            { label: 'Никто', value: 'none' },
          ]
        },
      ]
    },
    {
      id: 'appearance',
      title: 'Внешний вид',
      icon: Palette,
      items: [
        {
          id: 'theme',
          label: 'Тема',
          type: 'select',
          value: settings.theme,
          options: [
            { label: 'Светлая', value: 'light' },
            { label: 'Темная', value: 'dark' },
            { label: 'Автоматически', value: 'auto' },
          ]
        },
        {
          id: 'language',
          label: 'Язык',
          type: 'select',
          value: settings.language,
          options: [
            { label: 'Русский', value: 'ru' },
            { label: 'English', value: 'en' },
          ]
        },
        {
          id: 'fontSize',
          label: 'Размер шрифта',
          type: 'select',
          value: settings.fontSize,
          options: [
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ]
        },
        {
          id: 'animations',
          label: 'Анимации',
          description: 'Включить анимации в приложении',
          type: 'toggle',
          value: settings.animations,
        },
      ]
    },
    {
      id: 'location',
      title: 'Местоположение',
      icon: MapPin,
      items: [
        {
          id: 'locationServices',
          label: 'Службы геолокации',
          type: 'toggle',
          value: settings.locationServices,
        },
        {
          id: 'shareLocation',
          label: 'Поделиться местоположением',
          type: 'select',
          value: settings.shareLocation,
          options: [
            { label: 'Все', value: 'everyone' },
            { label: 'Только друзья', value: 'friends' },
            { label: 'Никто', value: 'none' },
          ]
        },
        {
          id: 'autoLocation',
          label: 'Автоматическое определение',
          type: 'toggle',
          value: settings.autoLocation,
        },
      ]
    },
    {
      id: 'sound',
      title: 'Звук',
      icon: Volume2,
      items: [
        {
          id: 'soundEnabled',
          label: 'Звук',
          type: 'toggle',
          value: settings.soundEnabled,
        },
        {
          id: 'vibrationEnabled',
          label: 'Вибрация',
          type: 'toggle',
          value: settings.vibrationEnabled,
        },
        {
          id: 'notificationSound',
          label: 'Звук уведомлений',
          type: 'select',
          value: settings.notificationSound,
          options: [
            { label: 'По умолчанию', value: 'default' },
            { label: 'Тихий', value: 'quiet' },
            { label: 'Громкий', value: 'loud' },
          ]
        },
        {
          id: 'volume',
          label: 'Громкость',
          type: 'slider',
          value: settings.volume,
        },
      ]
    },
    {
      id: 'data',
      title: 'Данные',
      icon: Smartphone,
      items: [
        {
          id: 'autoBackup',
          label: 'Автоматическое резервное копирование',
          type: 'toggle',
          value: settings.autoBackup,
        },
        {
          id: 'dataUsage',
          label: 'Использование данных',
          type: 'select',
          value: settings.dataUsage,
          options: [
            { label: 'Wi-Fi и мобильные', value: 'all' },
            { label: 'Только Wi-Fi', value: 'wifi' },
            { label: 'Экономия трафика', value: 'save' },
          ]
        },
        {
          id: 'cacheSize',
          label: 'Размер кэша',
          description: 'Текущий размер: 256MB',
          type: 'button',
          value: 'Очистить кэш',
          action: () => console.log('Clear cache'),
        },
        {
          id: 'exportData',
          label: 'Экспорт данных',
          type: 'button',
          value: 'Скачать данные',
          action: () => console.log('Export data'),
        },
        {
          id: 'deleteAccount',
          label: 'Удалить аккаунт',
          description: 'Это действие нельзя отменить',
          type: 'button',
          value: 'Удалить аккаунт',
          action: () => console.log('Delete account'),
        },
      ]
    }
  ];

  const handleSettingChange = (sectionId: string, itemId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSave = () => {
    // Здесь будет логика сохранения настроек
    console.log('Saving settings:', settings);
  };

  const currentSection = settingsSections.find(s => s.id === activeSection);

  return (
    <div className="h-full flex bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-pink-200/30 flex flex-col soft-shadow pencil-border">
        <div className="p-4 border-b border-pink-200/30">
          <h1 className="text-xl font-bold text-purple-700 font-display">Настройки</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-800 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-pink-200/30">
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-400 rounded-lg flex items-center justify-center soft-shadow">
                  <currentSection.icon className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{currentSection.title}</h2>
              </div>
              
              <div className="space-y-6">
                {currentSection.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-pink-200/30 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {item.type === 'toggle' && (
                        <button
                          onClick={() => handleSettingChange(activeSection, item.id, !item.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.value ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                      
                      {item.type === 'select' && (
                        <select
                          value={item.value}
                          onChange={(e) => handleSettingChange(activeSection, item.id, e.target.value)}
                          className="px-3 py-1 border border-pink-300 rounded-lg bg-white/80 backdrop-blur-sm text-gray-800 focus:ring-2 focus:ring-purple-500"
                        >
                          {item.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {item.type === 'input' && (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleSettingChange(activeSection, item.id, e.target.value)}
                          className="px-3 py-1 border border-pink-300 rounded-lg bg-white/80 backdrop-blur-sm text-gray-800 focus:ring-2 focus:ring-purple-500 w-48"
                        />
                      )}
                      
                      {item.type === 'slider' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={item.value}
                            onChange={(e) => handleSettingChange(activeSection, item.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600 w-8">{item.value}%</span>
                        </div>
                      )}
                      
                      {item.type === 'button' && (
                        <Button
                          variant={item.id === 'deleteAccount' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={item.action}
                          className={item.id === 'deleteAccount' 
                            ? 'text-red-600 border-red-300 hover:bg-red-50' 
                            : 'text-purple-600 border-purple-300 hover:bg-purple-50'
                          }
                        >
                          {item.value}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
