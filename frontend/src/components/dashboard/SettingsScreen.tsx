'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Moon, Sun, Globe, Download, Trash2, LogOut, Eye, EyeOff, Volume2, VolumeX, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    newMatches: true,
    newMessages: true,
    achievements: true,
    events: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    locationVisible: false,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'privacy', label: 'Приватность', icon: Shield },
    { id: 'appearance', label: 'Внешний вид', icon: Sun },
    { id: 'account', label: 'Аккаунт', icon: Settings },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Личная информация</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Имя</label>
            <input
              type="text"
              defaultValue="Анна"
              className="w-full px-3 py-2 border border-[var(--outline)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Фамилия</label>
            <input
              type="text"
              defaultValue="Петрова"
              className="w-full px-3 py-2 border border-[var(--outline)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">О себе</label>
            <textarea
              rows={3}
              defaultValue="Люблю собак и активный образ жизни!"
              className="w-full px-3 py-2 border border-[var(--outline)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Типы уведомлений</h3>
        <div className="space-y-4">
          {[
            { key: 'push', label: 'Push-уведомления', icon: Smartphone },
            { key: 'email', label: 'Email уведомления', icon: Mail },
            { key: 'sms', label: 'SMS уведомления', icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
                <span className="text-[var(--text)]">{label}</span>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-[var(--honey)]' : 'bg-[var(--surface-2)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">События</h3>
        <div className="space-y-4">
          {[
            { key: 'newMatches', label: 'Новые совпадения' },
            { key: 'newMessages', label: 'Новые сообщения' },
            { key: 'achievements', label: 'Достижения' },
            { key: 'events', label: 'События' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[var(--text)]">{label}</span>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-[var(--honey)]' : 'bg-[var(--surface-2)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Видимость профиля</h3>
        <div className="space-y-4">
          {[
            { key: 'profileVisible', label: 'Профиль виден другим пользователям' },
            { key: 'locationVisible', label: 'Показывать местоположение' },
            { key: 'showOnlineStatus', label: 'Показывать статус онлайн' },
            { key: 'allowMessages', label: 'Разрешить сообщения от незнакомцев' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[var(--text)]">{label}</span>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy[key as keyof typeof privacy] ? 'bg-[var(--honey)]' : 'bg-[var(--surface-2)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy[key as keyof typeof privacy] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Тема</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sun className="h-5 w-5 text-[var(--text-secondary)]" />
            <span className="text-[var(--text)]">Тёмная/светлая тема</span>
          </div>
          <ThemeToggle size="sm" />
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Язык</h3>
        <select className="w-full px-3 py-2 border border-[var(--outline)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent">
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Экспорт данных</h3>
        <p className="text-[var(--text-secondary)] mb-4">Скачайте все ваши данные в формате JSON</p>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Экспортировать данные</span>
        </Button>
      </div>

      <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--outline)]">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Опасная зона</h3>
        <div className="space-y-4">
          <Button variant="outline" className="flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            <span>Удалить аккаунт</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            <span>Выйти из аккаунта</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'appearance': return renderAppearanceSettings();
      case 'account': return renderAccountSettings();
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] overflow-hidden">
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-[var(--text)]">Настройки</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-[var(--surface-2)] border-r border-[var(--outline)] p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--honey)] text-[#1C1A19] font-medium'
                      : 'text-[var(--text)] hover:bg-[var(--surface)]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}