'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Send,
  FileText,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'account' | 'payment' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'support';
    message: string;
    timestamp: string;
  }>;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

export function SupportScreen() {
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });

  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      title: 'Проблема с загрузкой фото',
      description: 'Не могу загрузить фото в профиль собаки',
      category: 'technical',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
      messages: [
        {
          id: '1',
          sender: 'user',
          message: 'Здравствуйте! У меня проблема с загрузкой фото.',
          timestamp: '2024-01-15 10:30'
        },
        {
          id: '2',
          sender: 'support',
          message: 'Здравствуйте! Мы получили ваше обращение. Проверим проблему.',
          timestamp: '2024-01-15 11:00'
        }
      ]
    },
    {
      id: '2',
      title: 'Вопрос по оплате',
      description: 'Не пришли косточки после покупки',
      category: 'payment',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-16',
      messages: [
        {
          id: '1',
          sender: 'user',
          message: 'Купил косточки, но они не зачислились на счет',
          timestamp: '2024-01-14 15:20'
        }
      ]
    }
  ];

  const mockFAQ: FAQ[] = [
    {
      id: '1',
      question: 'Как добавить собаку в профиль?',
      answer: 'Перейдите в раздел "Профиль" → "Мои собаки" → "Добавить собаку". Заполните информацию о вашем питомце.',
      category: 'profile',
      helpful: 45,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'Как работает система косточек?',
      answer: 'Косточки - это внутренняя валюта приложения. Вы можете зарабатывать их за активность или покупать за реальные деньги.',
      category: 'payment',
      helpful: 38,
      notHelpful: 1
    },
    {
      id: '3',
      question: 'Как найти друзей в приложении?',
      answer: 'Используйте раздел "Друзья" для поиска других пользователей по имени, местоположению или интересам.',
      category: 'social',
      helpful: 52,
      notHelpful: 3
    },
    {
      id: '4',
      question: 'Почему не работает карта?',
      answer: 'Убедитесь, что у приложения есть доступ к геолокации. Проверьте настройки браузера или приложения.',
      category: 'technical',
      helpful: 29,
      notHelpful: 5
    }
  ];

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'profile', label: 'Профиль' },
    { id: 'payment', label: 'Платежи' },
    { id: 'social', label: 'Социальные функции' },
    { id: 'technical', label: 'Технические' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredFAQ = mockFAQ.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    // Здесь будет логика отправки тикета
    console.log('Submitting ticket:', newTicket);
    setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Поддержка</h1>
            <p className="text-sm text-purple-600">Помощь и обратная связь</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1">
          {[
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'tickets', label: 'Мои обращения', icon: MessageCircle },
            { id: 'contact', label: 'Связаться', icon: Phone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-pink-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 w-4 text-purple-400" />
              <input
                type="text"
                placeholder="Поиск в FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
              />
            </div>

            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white/80 text-gray-700 hover:bg-pink-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQ.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                  <p className="text-gray-700 mb-4">{faq.answer}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {categories.find(c => c.id === faq.category)?.label}
                    </span>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span>{faq.helpful}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span>{faq.notHelpful}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {mockTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{ticket.title}</h3>
                    <p className="text-gray-700 mb-3">{ticket.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  Создано: {ticket.createdAt} • Обновлено: {ticket.updatedAt}
                </div>
                
                <div className="space-y-2">
                  {ticket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-xl ${
                        message.sender === 'user'
                          ? 'bg-purple-50 ml-4'
                          : 'bg-pink-50 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {message.sender === 'user' ? 'Вы' : 'Поддержка'}
                        </span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center soft-shadow pencil-border fur-texture">
                <MessageCircle className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Чат поддержки</h3>
                <p className="text-sm text-gray-600 mb-4">Быстрые ответы в реальном времени</p>
                <Button className="w-full bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800">
                  Начать чат
                </Button>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center soft-shadow pencil-border fur-texture">
                <Mail className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                <p className="text-sm text-gray-600 mb-4">support@dogymorbis.com</p>
                <Button variant="outline" className="w-full text-purple-600 border-purple-300 hover:bg-purple-50">
                  Написать письмо
                </Button>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center soft-shadow pencil-border fur-texture">
                <Phone className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Телефон</h3>
                <p className="text-sm text-gray-600 mb-4">+7 (800) 123-45-67</p>
                <Button variant="outline" className="w-full text-purple-600 border-purple-300 hover:bg-purple-50">
                  Позвонить
                </Button>
              </div>
            </div>

            {/* Create Ticket */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Создать обращение</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тема</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
                    placeholder="Краткое описание проблемы"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
                    placeholder="Подробное описание проблемы или вопроса"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
                    >
                      <option value="general">Общие вопросы</option>
                      <option value="technical">Технические</option>
                      <option value="account">Аккаунт</option>
                      <option value="payment">Платежи</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
                    >
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                      <option value="urgent">Срочный</option>
                    </select>
                  </div>
                </div>
                
                <Button
                  onClick={handleSubmitTicket}
                  className="w-full bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить обращение
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
