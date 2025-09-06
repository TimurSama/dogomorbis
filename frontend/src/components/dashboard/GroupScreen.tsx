'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MessageCircle, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Shield,
  Crown,
  Zap,
  Award,
  Settings,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Bell,
  BellOff,
  Share2,
  Flag,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Heart,
  MessageSquare,
  ThumbsUp,
  Share,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  coverImage?: string;
  membersCount: number;
  maxMembers?: number;
  isPrivate: boolean;
  isVerified: boolean;
  isPremium: boolean;
  category: string;
  location?: string;
  tags: string[];
  createdAt: string;
  lastActivity: string;
  isJoined: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  rules: string[];
  events: GroupEvent[];
  recentPosts: GroupPost[];
}

interface GroupEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  maxAttendees?: number;
  isAttending: boolean;
  organizer: {
    name: string;
    avatar?: string;
  };
}

interface GroupPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isAdmin: boolean;
    isModerator: boolean;
  };
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  isPinned: boolean;
}

export function GroupScreen() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'joined' | 'discover' | 'my'>('joined');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Демо данные
  const demoGroups: Group[] = [
    {
      id: '1',
      name: 'Московские собаководы',
      description: 'Сообщество владельцев собак в Москве. Обсуждаем уход, дрессировку, ветеринарию и просто общаемся!',
      avatar: '/api/placeholder/60/60',
      coverImage: '/api/placeholder/400/200',
      membersCount: 1250,
      maxMembers: 2000,
      isPrivate: false,
      isVerified: true,
      isPremium: true,
      category: 'Собаководство',
      location: 'Москва, Россия',
      tags: ['собаки', 'москва', 'дрессировка', 'ветеринария'],
      createdAt: '2023-01-15',
      lastActivity: '2 минуты назад',
      isJoined: true,
      isAdmin: false,
      isModerator: true,
      rules: [
        'Будьте вежливы и уважительны',
        'Не спамьте и не рекламируйте',
        'Публикуйте только релевантный контент'
      ],
      events: [
        {
          id: '1',
          title: 'Еженедельная прогулка в Сокольниках',
          description: 'Присоединяйтесь к нашей традиционной прогулке с собаками',
          date: '2024-01-20',
          time: '10:00',
          location: 'Парк Сокольники',
          attendeesCount: 25,
          maxAttendees: 50,
          isAttending: true,
          organizer: {
            name: 'Анна Петрова',
            avatar: '/api/placeholder/30/30'
          }
        }
      ],
      recentPosts: [
        {
          id: '1',
          author: {
            name: 'Максим Иванов',
            avatar: '/api/placeholder/30/30',
            isAdmin: false,
            isModerator: false
          },
          content: 'Отличная прогулка сегодня в парке! Рекс был в восторге от новых друзей 🐕',
          images: ['/api/placeholder/200/150'],
          likesCount: 12,
          commentsCount: 5,
          isLiked: true,
          createdAt: '2024-01-15T14:30:00Z',
          isPinned: false
        }
      ]
    },
    {
      id: '2',
      name: 'Дрессировка собак',
      description: 'Профессиональные советы по дрессировке и воспитанию собак от опытных кинологов',
      avatar: '/api/placeholder/60/60',
      coverImage: '/api/placeholder/400/200',
      membersCount: 850,
      isPrivate: false,
      isVerified: true,
      isPremium: false,
      category: 'Дрессировка',
      location: 'Россия',
      tags: ['дрессировка', 'воспитание', 'кинология', 'советы'],
      createdAt: '2023-03-20',
      lastActivity: '1 час назад',
      isJoined: true,
      isAdmin: false,
      isModerator: false,
      rules: [
        'Только профессиональные советы',
        'Не давайте вредных рекомендаций',
        'Подтверждайте информацию источниками'
      ],
      events: [],
      recentPosts: [
        {
          id: '2',
          author: {
            name: 'Елена Сидорова',
            avatar: '/api/placeholder/30/30',
            isAdmin: true,
            isModerator: false
          },
          content: 'Новый курс по базовой дрессировке начинается на следующей неделе. Кто записывается?',
          likesCount: 28,
          commentsCount: 15,
          isLiked: false,
          createdAt: '2024-01-15T12:00:00Z',
          isPinned: true
        }
      ]
    },
    {
      id: '3',
      name: 'Ветеринарные советы',
      description: 'Консультации по здоровью и уходу за собаками от ветеринаров',
      avatar: '/api/placeholder/60/60',
      coverImage: '/api/placeholder/400/200',
      membersCount: 2100,
      isPrivate: false,
      isVerified: true,
      isPremium: true,
      category: 'Здоровье',
      location: 'Россия',
      tags: ['ветеринария', 'здоровье', 'уход', 'лечение'],
      createdAt: '2022-11-10',
      lastActivity: '30 минут назад',
      isJoined: false,
      isAdmin: false,
      isModerator: false,
      rules: [
        'Только квалифицированные ветеринары могут давать советы',
        'Не заменяйте визит к врачу',
        'Будьте осторожны с самолечением'
      ],
      events: [],
      recentPosts: []
    }
  ];

  useEffect(() => {
    const loadGroupsData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGroups(demoGroups);
      } catch (error) {
        toast.error('Ошибка загрузки групп');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupsData();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (activeTab) {
      case 'joined':
        return matchesSearch && group.isJoined;
      case 'my':
        return matchesSearch && (group.isAdmin || group.isModerator);
      case 'discover':
        return matchesSearch && !group.isJoined;
      default:
        return matchesSearch;
    }
  });

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, membersCount: group.membersCount + 1 }
        : group
    ));
    toast.success('Вы присоединились к группе');
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: false, membersCount: group.membersCount - 1 }
        : group
    ));
    toast.success('Вы покинули группу');
  };

  const handleLikePost = (groupId: string, postId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            recentPosts: group.recentPosts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
                  }
                : post
            )
          }
        : group
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}д назад`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-gray-400">Загружаем группы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Группы</h1>
            <p className="text-sm text-purple-600">
              {groups.filter(g => g.isJoined).length} групп • {groups.filter(g => !g.isJoined).length} доступно
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Создать группу
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск групп..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-0 mt-4">
          {[
            { id: 'joined', label: 'Мои группы', count: groups.filter(g => g.isJoined).length },
            { id: 'discover', label: 'Открыть', count: groups.filter(g => !g.isJoined).length },
            { id: 'my', label: 'Управляю', count: groups.filter(g => g.isAdmin || g.isModerator).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 bg-primary-900/20'
                  : 'text-gray-600 text-gray-400 hover:text-gray-900 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 bg-gray-200 bg-gray-700 text-gray-600 text-gray-400 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-gray-400">
                {activeTab === 'joined' ? 'Вы не состоите ни в одной группе' :
                 activeTab === 'discover' ? 'Нет доступных групп' :
                 'Вы не управляете ни одной группой'}
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white bg-gray-800 rounded-lg shadow-sm border border-gray-200 border-gray-700 overflow-hidden"
              >
                {/* Group Header */}
                <div className="relative">
                  {group.coverImage && (
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {group.isPrivate && (
                      <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Приватная
                      </div>
                    )}
                    {group.isVerified && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Проверенная
                      </div>
                    )}
                    {group.isPremium && (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Crown className="h-3 w-3 mr-1" />
                        Премиум
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Group Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={group.avatar || '/api/placeholder/60/60'}
                      alt={group.name}
                      className="w-16 h-16 rounded-full object-cover -mt-8 border-4 border-white border-gray-800"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 text-white">
                          {group.name}
                        </h3>
                        {group.isAdmin && (
                          <span className="px-2 py-1 bg-red-100 bg-red-900 text-red-800 text-red-200 text-xs rounded-full">
                            Админ
                          </span>
                        )}
                        {group.isModerator && !group.isAdmin && (
                          <span className="px-2 py-1 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-xs rounded-full">
                            Модератор
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 text-gray-400 mb-2">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{group.membersCount} участников</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{group.lastActivity}</span>
                        </div>
                        {group.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{group.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {group.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 bg-gray-700 text-gray-600 text-gray-400 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      {group.isJoined ? (
                        <>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Обсуждения
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            События
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Настройки
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleJoinGroup(group.id)}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Присоединиться
                        </Button>
                      )}
                    </div>
                    
                    {group.isJoined && (
                      <Button
                        onClick={() => handleLeaveGroup(group.id)}
                        variant="outline"
                        size="sm"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Покинуть
                      </Button>
                    )}
                  </div>

                  {/* Recent Posts */}
                  {group.isJoined && group.recentPosts.length > 0 && (
                    <div className="border-t border-gray-200 border-gray-700 pt-4">
                      <h4 className="font-semibold text-gray-900 text-white mb-3">
                        Последние посты
                      </h4>
                      <div className="space-y-3">
                        {group.recentPosts.map((post) => (
                          <div key={post.id} className="bg-gray-50 bg-gray-700 rounded-lg p-3">
                            <div className="flex items-start space-x-3">
                              <img
                                src={post.author.avatar || '/api/placeholder/30/30'}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900 text-white text-sm">
                                    {post.author.name}
                                  </span>
                                  {post.author.isAdmin && (
                                    <span className="px-1 py-0.5 bg-red-100 bg-red-900 text-red-800 text-red-200 text-xs rounded">
                                      Админ
                                    </span>
                                  )}
                                  {post.author.isModerator && !post.author.isAdmin && (
                                    <span className="px-1 py-0.5 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-xs rounded">
                                      Мод
                                    </span>
                                  )}
                                  {post.isPinned && (
                                    <span className="px-1 py-0.5 bg-yellow-100 bg-yellow-900 text-yellow-800 text-yellow-200 text-xs rounded">
                                      Закреплен
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 text-gray-300 mb-2">
                                  {post.content}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 text-gray-400">
                                  <button
                                    onClick={() => handleLikePost(group.id, post.id)}
                                    className={`flex items-center space-x-1 ${
                                      post.isLiked ? 'text-red-500' : 'hover:text-red-500'
                                    }`}
                                  >
                                    <Heart className={`h-3 w-3 ${post.isLiked ? 'fill-current' : ''}`} />
                                    <span>{post.likesCount}</span>
                                  </button>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{post.commentsCount}</span>
                                  </div>
                                  <span>{formatTimeAgo(post.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

