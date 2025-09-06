'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'video';
    url: string;
    name: string;
    size: number;
  }>;
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  type: 'private' | 'group';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
    role?: 'admin' | 'moderator' | 'member';
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export function MessagesScreen() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Демо данные
  const demoChats: Chat[] = [
    {
      id: '1',
      name: 'Анна Петрова',
      avatar: '/api/placeholder/40/40',
      type: 'private',
      participants: [
        {
          id: '1',
          name: 'Анна Петрова',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
          lastSeen: '2 минуты назад'
        }
      ],
      lastMessage: {
        id: '1',
        content: 'Привет! Как дела с Бобиком?',
        type: 'text',
        senderId: '1',
        senderName: 'Анна Петрова',
        senderAvatar: '/api/placeholder/40/40',
        timestamp: '2024-01-15T14:30:00Z',
        isRead: true,
        isEdited: false,
        isDeleted: false,
        reactions: []
      },
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isArchived: false,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Московские собаководы',
      avatar: '/api/placeholder/40/40',
      type: 'group',
      participants: [
        {
          id: '1',
          name: 'Анна Петрова',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
          role: 'admin'
        },
        {
          id: '2',
          name: 'Максим Иванов',
          avatar: '/api/placeholder/40/40',
          isOnline: false,
          lastSeen: '1 час назад',
          role: 'member'
        },
        {
          id: '3',
          name: 'Елена Сидорова',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
          role: 'moderator'
        }
      ],
      lastMessage: {
        id: '2',
        content: 'Кто идет на прогулку в Сокольники?',
        type: 'text',
        senderId: '1',
        senderName: 'Анна Петрова',
        senderAvatar: '/api/placeholder/40/40',
        timestamp: '2024-01-15T13:45:00Z',
        isRead: false,
        isEdited: false,
        isDeleted: false,
        reactions: []
      },
      unreadCount: 3,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      createdAt: '2024-01-05T09:00:00Z',
      updatedAt: '2024-01-15T13:45:00Z'
    },
    {
      id: '3',
      name: 'Максим Иванов',
      avatar: '/api/placeholder/40/40',
      type: 'private',
      participants: [
        {
          id: '2',
          name: 'Максим Иванов',
          avatar: '/api/placeholder/40/40',
          isOnline: false,
          lastSeen: '1 час назад'
        }
      ],
      lastMessage: {
        id: '3',
        content: 'Спасибо за совет по дрессировке!',
        type: 'text',
        senderId: '2',
        senderName: 'Максим Иванов',
        senderAvatar: '/api/placeholder/40/40',
        timestamp: '2024-01-15T12:20:00Z',
        isRead: true,
        isEdited: false,
        isDeleted: false,
        reactions: []
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      createdAt: '2024-01-12T15:30:00Z',
      updatedAt: '2024-01-15T12:20:00Z'
    }
  ];

  const demoMessages: Message[] = [
    {
      id: '1',
      content: 'Привет! Как дела с Бобиком?',
      type: 'text',
      senderId: '1',
      senderName: 'Анна Петрова',
      senderAvatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T14:30:00Z',
      isRead: true,
      isEdited: false,
      isDeleted: false,
      reactions: []
    },
    {
      id: '2',
      content: 'Привет! Все отлично, спасибо! А как у тебя с Муркой?',
      type: 'text',
      senderId: 'user',
      senderName: 'Вы',
      senderAvatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T14:32:00Z',
      isRead: true,
      isEdited: false,
      isDeleted: false,
      reactions: []
    },
    {
      id: '3',
      content: 'Мурка тоже в порядке! Хочешь встретиться на прогулке?',
      type: 'text',
      senderId: '1',
      senderName: 'Анна Петрова',
      senderAvatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T14:35:00Z',
      isRead: true,
      isEdited: false,
      isDeleted: false,
      reactions: []
    },
    {
      id: '4',
      content: 'Конечно! Когда удобно?',
      type: 'text',
      senderId: 'user',
      senderName: 'Вы',
      senderAvatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T14:36:00Z',
      isRead: true,
      isEdited: false,
      isDeleted: false,
      reactions: []
    }
  ];

  useEffect(() => {
    const loadChatsData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChats(demoChats);
        if (demoChats.length > 0) {
          setSelectedChat(demoChats[0]);
          setMessages(demoMessages);
        }
      } catch (error) {
        toast.error('Ошибка загрузки чатов');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatsData();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      type: 'text',
      senderId: 'user',
      senderName: 'Вы',
      senderAvatar: '/api/placeholder/40/40',
      timestamp: new Date().toISOString(),
      isRead: false,
      isEdited: false,
      isDeleted: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    
    // Обновляем последнее сообщение в чате
    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date().toISOString() }
        : chat
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Здесь должна быть логика загрузки файла
    toast.success(`Файл ${file.name} загружен`);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...message,
            reactions: message.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, 'user'] }
                : r
            )
          };
        } else {
          return {
            ...message,
            reactions: [...message.reactions, { emoji, count: 1, users: ['user'] }]
          };
        }
      }
      return message;
    }));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загружаем сообщения...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-pink-200/30 flex flex-col soft-shadow pencil-border">
        {/* Header */}
        <div className="p-4 border-b border-pink-200/30">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-purple-700 font-display">Сообщения</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск сообщений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Нет чатов</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar || '/api/placeholder/40/40'}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <Users className="h-2 w-2 text-white" />
                        </div>
                      )}
                      {chat.participants.some(p => p.isOnline) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {chat.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {chat.isPinned && (
                            <Pin className="h-3 w-3 text-gray-400" />
                          )}
                          {chat.isMuted && (
                            <VolumeX className="h-3 w-3 text-gray-400" />
                          )}
                          {chat.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {chat.lastMessage.senderName}: {chat.lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : formatDate(chat.createdAt)}
                        </span>
                        {chat.lastMessage && (
                          <div className="flex items-center space-x-1">
                            {chat.lastMessage.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedChat.avatar || '/api/placeholder/40/40'}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChat.name}
                  </h2>
                  {selectedChat.type === 'private' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedChat.participants[0]?.isOnline ? 'В сети' : `Был(а) в сети ${selectedChat.participants[0]?.lastSeen}`}
                    </p>
                  )}
                  {selectedChat.type === 'group' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedChat.participants.length} участников
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.senderId === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.senderId !== 'user' && (
                    <img
                      src={message.senderAvatar || '/api/placeholder/30/30'}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    message.senderId === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.senderId === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.senderId === 'user' && (
                        <div className="flex items-center space-x-1">
                          {message.isRead ? (
                            <CheckCheck className="h-3 w-3 text-primary-100" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-100" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={1}
                />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <div className="mt-2 flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Image className="h-4 w-4 mr-2" />
                  Фото
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <File className="h-4 w-4 mr-2" />
                  Файл
                </Button>
                <Button variant="outline" size="sm">
                  <Mic className="h-4 w-4 mr-2" />
                  Голос
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Выберите чат
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Начните общение с друзьями или группами
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

