'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MessageCircle, 
  Heart,
  MapPin,
  Clock,
  Star,
  Shield,
  Crown,
  Zap,
  Award,
  Calendar,
  Phone,
  Video,
  MoreHorizontal,
  UserCheck,
  UserX,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
  dogs: Array<{
    name: string;
    breed: string;
    age: number;
    avatar?: string;
  }>;
  interests: string[];
  walkPreferences: string[];
  psychotype: string;
  isVerified: boolean;
  isPremium: boolean;
  friendshipStatus: 'friends' | 'pending' | 'requested' | 'blocked';
  compatibility: number;
  distance: number;
  joinedAt: string;
}

interface FriendRequest {
  id: string;
  user: Friend;
  message?: string;
  createdAt: string;
}

export function FriendsScreen() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'nearby' | 'requests'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Демо данные
  const demoFriends: Friend[] = [
    {
      id: '1',
      username: 'Анна_Собаковод',
      firstName: 'Анна',
      lastName: 'Петрова',
      avatar: '/api/placeholder/40/40',
      bio: 'Люблю долгие прогулки с моими собаками',
      location: 'Москва, Россия',
      isOnline: true,
      lastActive: '2 минуты назад',
      mutualFriends: 12,
      dogs: [
        { name: 'Бобик', breed: 'Лабрадор', age: 3, avatar: '/api/placeholder/30/30' },
        { name: 'Мурка', breed: 'Йоркширский терьер', age: 1, avatar: '/api/placeholder/30/30' }
      ],
      interests: ['Прогулки', 'Фотография', 'Спорт'],
      walkPreferences: ['Парки', 'Леса', 'Городские маршруты'],
      psychotype: 'Экстраверт',
      isVerified: true,
      isPremium: true,
      friendshipStatus: 'friends',
      compatibility: 85,
      distance: 0.5,
      joinedAt: '2023-01-15'
    },
    {
      id: '2',
      username: 'Максим_Песик',
      firstName: 'Максим',
      lastName: 'Иванов',
      avatar: '/api/placeholder/40/40',
      bio: 'Кинолог с 10-летним стажем',
      location: 'Санкт-Петербург, Россия',
      isOnline: false,
      lastActive: '1 час назад',
      mutualFriends: 8,
      dogs: [
        { name: 'Рекс', breed: 'Немецкая овчарка', age: 5, avatar: '/api/placeholder/30/30' }
      ],
      interests: ['Дрессировка', 'Спорт', 'Путешествия'],
      walkPreferences: ['Парки', 'Спортивные площадки'],
      psychotype: 'Амбиверт',
      isVerified: true,
      isPremium: false,
      friendshipStatus: 'friends',
      compatibility: 72,
      distance: 15.2,
      joinedAt: '2023-03-20'
    },
    {
      id: '3',
      username: 'Елена_Кинолог',
      firstName: 'Елена',
      lastName: 'Сидорова',
      avatar: '/api/placeholder/40/40',
      bio: 'Ветеринар и любитель активного отдыха',
      location: 'Москва, Россия',
      isOnline: true,
      lastActive: '5 минут назад',
      mutualFriends: 15,
      dogs: [
        { name: 'Лада', breed: 'Хаски', age: 2, avatar: '/api/placeholder/30/30' },
        { name: 'Тиша', breed: 'Бигль', age: 4, avatar: '/api/placeholder/30/30' }
      ],
      interests: ['Ветеринария', 'Активный отдых', 'Фотография'],
      walkPreferences: ['Леса', 'Горы', 'Набережные'],
      psychotype: 'Экстраверт',
      isVerified: true,
      isPremium: true,
      friendshipStatus: 'friends',
      compatibility: 91,
      distance: 2.1,
      joinedAt: '2022-11-10'
    }
  ];

  const demoFriendRequests: FriendRequest[] = [
    {
      id: '1',
      user: {
        id: '4',
        username: 'Дмитрий_Собачник',
        firstName: 'Дмитрий',
        lastName: 'Козлов',
        avatar: '/api/placeholder/40/40',
        bio: 'Новичок в мире собаководства',
        location: 'Москва, Россия',
        isOnline: true,
        lastActive: '10 минут назад',
        mutualFriends: 3,
        dogs: [
          { name: 'Джек', breed: 'Джек-рассел-терьер', age: 1, avatar: '/api/placeholder/30/30' }
        ],
        interests: ['Обучение', 'Прогулки'],
        walkPreferences: ['Парки'],
        psychotype: 'Интроверт',
        isVerified: false,
        isPremium: false,
        friendshipStatus: 'pending',
        compatibility: 68,
        distance: 1.2,
        joinedAt: '2024-01-01'
      },
      message: 'Привет! Хотел бы познакомиться с другими владельцами собак в районе',
      createdAt: '2024-01-15T10:30:00Z'
    }
  ];

  useEffect(() => {
    const loadFriendsData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFriends(demoFriends);
        setFriendRequests(demoFriendRequests);
      } catch (error) {
        toast.error('Ошибка загрузки друзей');
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendsData();
  }, []);

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'online':
        return matchesSearch && friend.isOnline;
      case 'nearby':
        return matchesSearch && friend.distance < 5;
      case 'requests':
        return false; // Заявки показываются отдельно
      default:
        return matchesSearch;
    }
  });

  const handleAcceptRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Заявка в друзья принята');
  };

  const handleDeclineRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Заявка в друзья отклонена');
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
    toast.success('Пользователь удален из друзей');
  };

  const handleBlockUser = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
    toast.success('Пользователь заблокирован');
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
          <p className="text-gray-600 dark:text-gray-400">Загружаем друзей...</p>
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
            <h1 className="text-xl font-bold text-purple-700 font-display">Друзья</h1>
            <p className="text-sm text-purple-600">
              {friends.length} друзей • {friendRequests.length} заявок
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <UserPlus className="h-4 w-4 mr-2" />
              Найти друзей
            </Button>
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Поиск друзей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-0 mt-4">
          {[
            { id: 'all', label: 'Все', count: friends.length },
            { id: 'online', label: 'Онлайн', count: friends.filter(f => f.isOnline).length },
            { id: 'nearby', label: 'Рядом', count: friends.filter(f => f.distance < 5).length },
            { id: 'requests', label: 'Заявки', count: friendRequests.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 bg-pink-100 text-purple-600 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {activeTab === 'requests' ? (
          /* Friend Requests */
          <div className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Нет новых заявок в друзья</p>
              </div>
            ) : (
              friendRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={request.user.avatar || '/api/placeholder/40/40'}
                        alt={request.user.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {request.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        {request.user.isVerified && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                        {request.user.isPremium && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        @{request.user.username}
                      </p>
                      
                      {request.message && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          "{request.message}"
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{request.user.mutualFriends} общих друзей</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{request.user.distance} км</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4" />
                          <span>{request.user.compatibility}% совместимость</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Принять
                        </Button>
                        <Button
                          onClick={() => handleDeclineRequest(request.id)}
                          variant="outline"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Friends List */
          <div className="space-y-4">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'online' ? 'Нет друзей онлайн' :
                   activeTab === 'nearby' ? 'Нет друзей рядом' :
                   'Друзья не найдены'}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 soft-shadow pencil-border fur-texture"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={friend.avatar || '/api/placeholder/40/40'}
                        alt={friend.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {friend.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {friend.firstName} {friend.lastName}
                          </h3>
                          {friend.isVerified && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                          {friend.isPremium && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        @{friend.username}
                      </p>
                      
                      {friend.bio && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {friend.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{friend.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{friend.lastActive}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4" />
                          <span>{friend.compatibility}% совместимость</span>
                        </div>
                      </div>
                      
                      {/* Dogs */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Собаки:</span>
                        <div className="flex space-x-1">
                          {friend.dogs.map((dog, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              <img
                                src={dog.avatar || '/api/placeholder/20/20'}
                                alt={dog.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {dog.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Interests */}
                      <div className="flex flex-wrap gap-1">
                        {friend.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

