'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Send,
  Paperclip,
  Smile,
  Image,
  File,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Archive,
  Trash2,
  Block,
  Flag,
  Star,
  StarOff,
  Pin,
  PinOff,
  Edit,
  Copy,
  Reply,
  Forward,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  Zap,
  Heart,
  ThumbsUp,
  Laugh,
  Sad,
  Angry,
  Surprised,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  isMuted: boolean;
  type: 'private' | 'group';
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export function MessagesScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mockChats: Chat[] = [
    {
      id: 'dev-team',
      name: 'Команда разработчиков Dogymorbis',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Добро пожаловать в Dogymorbis! 🐕',
      timestamp: '12:00',
      unreadCount: 1,
      isOnline: true,
      isPinned: true,
      isMuted: false,
      type: 'private',
    },
    {
      id: 'project-official',
      name: 'Dogymorbis Official',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Приглашаем в реферальную программу! 🎁',
      timestamp: '11:45',
      unreadCount: 1,
      isOnline: true,
      isPinned: true,
      isMuted: false,
      type: 'private',
    },
    {
      id: '1',
      name: 'Анна Петрова',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Как дела с Бобиком?',
      timestamp: '10:30',
      unreadCount: 2,
      isOnline: true,
      isPinned: false,
      isMuted: false,
      type: 'private',
    },
    {
      id: '2',
      name: 'Максим Сидоров',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Спасибо за совет по дрессировке!',
      timestamp: '09:15',
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isMuted: false,
      type: 'private',
    },
    {
      id: '3',
      name: 'Группа "Собачники Москвы"',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Елена: Кто идет на выставку в выходные?',
      timestamp: '08:45',
      unreadCount: 5,
      isOnline: false,
      isPinned: false,
      isMuted: true,
      type: 'group',
    },
  ];

  const getMessagesForChat = (chatId: string): Message[] => {
    if (chatId === 'dev-team') {
      return [
        {
          id: 'dev-1',
          senderId: 'dev-team',
          content: 'Привет! Добро пожаловать в Dogymorbis! 🐕✨',
          timestamp: '12:00',
          isRead: false,
          type: 'text',
        },
        {
          id: 'dev-2',
          senderId: 'dev-team',
          content: 'Мы рады, что вы присоединились к нашему сообществу любителей собак! Здесь вы найдете все необходимое для ухода за вашим питомцем.',
          timestamp: '12:01',
          isRead: false,
          type: 'text',
        },
        {
          id: 'dev-3',
          senderId: 'dev-team',
          content: 'Не забудьте пригласить друзей - за каждого приглашенного друга вы получите бонусы! 🎁',
          timestamp: '12:02',
          isRead: false,
          type: 'text',
        },
      ];
    }
    
    if (chatId === 'project-official') {
      return [
        {
          id: 'official-1',
          senderId: 'project-official',
          content: '🎉 Добро пожаловать в Dogymorbis!',
          timestamp: '11:45',
          isRead: false,
          type: 'text',
        },
        {
          id: 'official-2',
          senderId: 'project-official',
          content: 'Спасибо за интерес к нашему проекту! Мы создали это приложение специально для владельцев собак.',
          timestamp: '11:46',
          isRead: false,
          type: 'text',
        },
        {
          id: 'official-3',
          senderId: 'project-official',
          content: 'Приглашаем вас участвовать в нашей реферальной программе! За каждого друга, которого вы пригласите, вы получите:',
          timestamp: '11:47',
          isRead: false,
          type: 'text',
        },
        {
          id: 'official-4',
          senderId: 'project-official',
          content: '• 100 косточек бонусом 💰\n• Скидку 10% в магазине 🛍️\n• Эксклюзивные награды 🏆',
          timestamp: '11:48',
          isRead: false,
          type: 'text',
        },
        {
          id: 'official-5',
          senderId: 'project-official',
          content: 'Поделитесь ссылкой с друзьями и получите награды! 🎁',
          timestamp: '11:49',
          isRead: false,
          type: 'text',
        },
      ];
    }
    
    // Обычные сообщения для других чатов
    return [
      {
        id: '1',
        senderId: '1',
        content: 'Привет! Как дела с Бобиком?',
        timestamp: '10:25',
        isRead: true,
        type: 'text',
      },
      {
        id: '2',
        senderId: 'me',
        content: 'Все отлично! Он уже знает команду "сидеть"',
        timestamp: '10:28',
        isRead: true,
        type: 'text',
      },
      {
        id: '3',
        senderId: '1',
        content: 'Как дела с Бобиком?',
        timestamp: '10:30',
        isRead: false,
        type: 'text',
      },
    ];
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    const chat = mockChats.find(c => c.id === selectedChat);
    return (
      <div className="h-full flex flex-col bg-[var(--bg)]">
        {/* Chat Header */}
        <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text)]" />
            </button>
            <img
              src={chat?.avatar || '/api/placeholder/40/40'}
              alt={chat?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-[var(--text)]">{chat?.name}</h2>
              <p className="text-sm text-[var(--dim)]">
                {chat?.isOnline ? 'В сети' : 'Был(а) в сети недавно'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-[var(--text)]" />
              </button>
              <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                <Video className="h-5 w-5 text-[var(--text)]" />
              </button>
              <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                <Info className="h-5 w-5 text-[var(--text)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {getMessagesForChat(selectedChat).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === 'me'
                    ? 'bg-[var(--honey)] text-[#1C1A19]'
                    : 'bg-[var(--surface-2)] text-[var(--text)]'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  message.senderId === 'me' ? 'text-[#1C1A19]/70' : 'text-[var(--dim)]'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {message.senderId === 'me' && (
                    <CheckCheck className={`h-3 w-3 ${message.isRead ? 'text-[#1C1A19]/80' : 'text-[#1C1A19]/50'}`} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-[var(--surface)] border-t border-[var(--outline)] p-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Paperclip className="h-5 w-5 text-[var(--text)]" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Напишите сообщение..."
                className="w-full px-4 py-2 border border-[var(--outline)] rounded-lg focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent bg-[var(--surface-2)] text-[var(--text)] placeholder-[var(--dim)]"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[var(--surface-2)] rounded transition-colors">
                <Smile className="h-4 w-4 text-[var(--text)]" />
              </button>
            </div>
            <button className="p-2 bg-[var(--honey)] text-[#1C1A19] rounded-lg hover:bg-[var(--honey)]/90 transition-colors">
              <Send className="h-5 w-5" />
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">Сообщения</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Filter className="h-5 w-5 text-[var(--text)]" />
            </button>
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-[var(--text)]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--dim)]" />
          <input
            type="text"
            placeholder="Поиск в сообщениях..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--outline)] rounded-lg focus:ring-2 focus:ring-[var(--honey)] focus:border-transparent bg-[var(--surface-2)] text-[var(--text)] placeholder-[var(--dim)]"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedChat(chat.id)}
              className="flex items-center space-x-3 p-4 hover:bg-[var(--surface-2)] cursor-pointer border-b border-[var(--outline)] transition-colors"
            >
              <div className="relative">
                <img
                  src={chat.avatar || '/api/placeholder/40/40'}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--text)] truncate">{chat.name}</h3>
                  <div className="flex items-center space-x-1">
                    {chat.isPinned && <Pin className="h-3 w-3 text-[var(--dim)]" />}
                    {chat.isMuted && <VolumeX className="h-3 w-3 text-[var(--dim)]" />}
                    <span className="text-xs text-[var(--dim)]">{chat.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--text-secondary)] truncate">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <div className="bg-[var(--honey)] text-[#1C1A19] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-[var(--dim)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Сообщения не найдены</h3>
            <p className="text-[var(--text-secondary)]">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}