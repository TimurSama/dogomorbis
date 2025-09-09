'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search, 
  Send,
  FileText,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export function SupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockFAQs = [
    {
      id: '1',
      question: 'Как добавить собаку в профиль?',
      answer: 'Перейдите в раздел "Профиль" → "Собаки" → "Добавить". Заполните информацию о вашем питомце.',
      category: 'profile',
    },
    {
      id: '2',
      question: 'Как работает система очков?',
      answer: 'Вы получаете очки за активность: прогулки, посты, участие в событиях. Очки можно тратить в магазине.',
      category: 'points',
    },
    {
      id: '3',
      question: 'Как найти друзей в приложении?',
      answer: 'Используйте раздел "Сообщество" для поиска других собачников в вашем районе.',
      category: 'social',
    },
  ];

  const mockTickets = [
    {
      id: '1',
      subject: 'Проблема с загрузкой фото',
      status: 'open',
      priority: 'medium',
      createdAt: '15 марта 2024',
      lastUpdate: '15 марта 2024',
    },
    {
      id: '2',
      subject: 'Не работает уведомления',
      status: 'resolved',
      priority: 'low',
      createdAt: '10 марта 2024',
      lastUpdate: '12 марта 2024',
    },
  ];

  const categories = [
    { id: 'all', label: 'Все', icon: HelpCircle },
    { id: 'profile', label: 'Профиль', icon: FileText },
    { id: 'points', label: 'Очки', icon: CheckCircle },
    { id: 'social', label: 'Сообщество', icon: MessageCircle },
  ];

  const contactMethods = [
    {
      id: 'chat',
      title: 'Онлайн чат',
      description: 'Быстрая помощь в реальном времени',
      icon: MessageCircle,
      available: true,
    },
    {
      id: 'email',
      title: 'Email поддержка',
      description: 'support@dogomorbis.com',
      icon: Mail,
      available: true,
    },
    {
      id: 'phone',
      title: 'Телефон',
      description: '+7 (800) 123-45-67',
      icon: Phone,
      available: false,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-[var(--text)] mb-4">Поддержка</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--dim)]" />
          <input
            type="text"
            placeholder="Поиск в базе знаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--outline)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--surface)] text-[var(--text)]"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-2)]'
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
      <div className="flex-1 overflow-y-auto p-4">
        {/* Contact Methods */}
        <div className="mb-6">
          <h3 className="font-semibold text-[var(--text)] mb-3">Связаться с нами</h3>
          <div className="grid gap-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 rounded-lg border ${
                    method.available
                      ? 'border-[var(--outline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                      : 'border-[var(--outline)] bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${
                      method.available ? 'text-blue-600' : 'text-[var(--dim)]'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        method.available ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                      }`}>
                        {method.title}
                      </h4>
                      <p className={`text-sm ${
                        method.available ? 'text-[var(--text-secondary)]' : 'text-[var(--dim)]'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                    {method.available && (
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Связаться
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-6">
          <h3 className="font-semibold text-[var(--text)] mb-3">Часто задаваемые вопросы</h3>
          <div className="space-y-3">
            {mockFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
              >
                <h4 className="font-medium text-[var(--text)] mb-2">{faq.question}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[var(--text)]">Мои обращения</h3>
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Send className="h-4 w-4" />
              <span>Новое обращение</span>
            </button>
          </div>
          <div className="space-y-3">
            {mockTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[var(--text)]">{ticket.subject}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'open'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status === 'open' ? 'Открыт' : 'Решен'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>Создан {ticket.createdAt}</span>
                  <span>Обновлен {ticket.lastUpdate}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}