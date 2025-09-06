'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Image, 
  Video, 
  Vote, 
  TrendingUp,
  User,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  ShoppingCart,
  Star,
  Award,
  Users,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Story {
  id: string;
  username: string;
  userAvatar?: string;
  isViewed: boolean;
  isLive?: boolean;
}

interface Post {
  id: string;
  type: 'photo' | 'video' | 'text' | 'poll' | 'ad' | 'dao' | 'partner';
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
    isPartner?: boolean;
  };
  content: {
    text?: string;
    images?: string[];
    video?: string;
    poll?: {
      question: string;
      options: Array<{ id: string; text: string; votes: number }>;
      totalVotes: number;
      userVote?: string;
      expiresAt: string;
    };
    ad?: {
      title: string;
      description: string;
      image: string;
      link: string;
      discount?: string;
      partner: string;
    };
    dao?: {
      title: string;
      description: string;
      proposal: string;
      votes: { for: number; against: number };
      userVote?: 'for' | 'against';
      expiresAt: string;
    };
    partner?: {
      name: string;
      type: 'vet' | 'groomer' | 'store' | 'cafe' | 'park';
      rating: number;
      offers: string[];
      image: string;
      distance: number;
    };
  };
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
}

export function FeedScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos' | 'polls' | 'ads' | 'dao'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Демо данные
  const demoStories: Story[] = [
    { id: '1', username: 'Анна_Собаковод', userAvatar: '/api/placeholder/40/40', isViewed: false, isLive: true },
    { id: '2', username: 'Максим_Песик', userAvatar: '/api/placeholder/40/40', isViewed: true },
    { id: '3', username: 'Елена_Кинолог', userAvatar: '/api/placeholder/40/40', isViewed: false },
    { id: '4', username: 'Ветклиника_Друг', userAvatar: '/api/placeholder/40/40', isViewed: true, isLive: false },
    { id: '5', username: 'Зоомагазин_Лапки', userAvatar: '/api/placeholder/40/40', isViewed: false },
  ];

  const demoPosts: Post[] = [
    {
      id: '1',
      type: 'photo',
      author: {
        id: '1',
        username: 'Анна_Собаковод',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      content: {
        text: 'Прекрасная прогулка с Бобиком в парке! 🐕✨ Он так радуется каждому новому дню! #прогулка #лабрадор #счастье',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400']
      },
      location: {
        name: 'Парк Сокольники',
        coordinates: { lat: 55.7908, lng: 37.6756 }
      },
      createdAt: '2024-01-15T10:30:00Z',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false,
      tags: ['прогулка', 'лабрадор', 'парк']
    },
    {
      id: '2',
      type: 'video',
      author: {
        id: '2',
        username: 'Максим_Песик',
        avatar: '/api/placeholder/40/40',
        isVerified: false
      },
      content: {
        text: 'Рекс учится новым командам! Посмотрите, как он старается 🎾 #дрессировка #овчарка #обучение',
        video: '/api/placeholder/400/400'
      },
      createdAt: '2024-01-15T09:15:00Z',
      likes: 45,
      comments: 12,
      shares: 7,
      isLiked: true,
      isBookmarked: true,
      tags: ['дрессировка', 'овчарка', 'команды']
    },
    {
      id: '3',
      type: 'poll',
      author: {
        id: '3',
        username: 'Елена_Кинолог',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      content: {
        text: 'Помогите выбрать лучший корм для моих собак! Что вы предпочитаете?',
        poll: {
          question: 'Какой корм лучше для собак?',
          options: [
            { id: '1', text: 'Сухой корм премиум класса', votes: 45 },
            { id: '2', text: 'Натуральное питание', votes: 32 },
            { id: '3', text: 'Смешанное питание', votes: 28 },
            { id: '4', text: 'Влажный корм', votes: 15 }
          ],
          totalVotes: 120,
          expiresAt: '2024-01-20T12:00:00Z'
        }
      },
      createdAt: '2024-01-15T08:45:00Z',
      likes: 18,
      comments: 25,
      shares: 4,
      isLiked: false,
      isBookmarked: false,
      tags: ['корм', 'питание', 'опрос']
    },
    {
      id: '4',
      type: 'ad',
      author: {
        id: '4',
        username: 'Ветклиника_Друг',
        avatar: '/api/placeholder/40/40',
        isVerified: true,
        isPartner: true
      },
      content: {
        ad: {
          title: 'Скидка 20% на все прививки!',
          description: 'Защитите своего питомца от болезней. Акция действует до конца месяца.',
          image: '/api/placeholder/400/200',
          link: 'https://vetclinic.ru',
          discount: '20%',
          partner: 'Ветклиника "Друг"'
        }
      },
      createdAt: '2024-01-15T07:30:00Z',
      likes: 12,
      comments: 3,
      shares: 8,
      isLiked: false,
      isBookmarked: false,
      tags: ['реклама', 'ветеринар', 'прививки']
    },
    {
      id: '5',
      type: 'dao',
      author: {
        id: '5',
        username: 'Dogymorbis_DAO',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      content: {
        dao: {
          title: 'Предложение: Новые функции в приложении',
          description: 'Голосуйте за добавление функции видеозвонков между владельцами собак',
          proposal: 'Добавить возможность видеозвонков для общения владельцев собак во время прогулок',
          votes: { for: 156, against: 23 },
          expiresAt: '2024-01-25T12:00:00Z'
        }
      },
      createdAt: '2024-01-15T06:00:00Z',
      likes: 89,
      comments: 34,
      shares: 15,
      isLiked: true,
      isBookmarked: false,
      tags: ['DAO', 'голосование', 'функции']
    },
    {
      id: '6',
      type: 'partner',
      author: {
        id: '6',
        username: 'Зоомагазин_Лапки',
        avatar: '/api/placeholder/40/40',
        isVerified: true,
        isPartner: true
      },
      content: {
        text: 'Новинка! Интерактивные игрушки для собак 🎾 Ваш питомец будет в восторге!',
        images: ['/api/placeholder/400/300'],
        partner: {
          name: 'Зоомагазин "Лапки"',
          type: 'store',
          rating: 4.8,
          offers: ['Скидка 15% на игрушки', 'Бесплатная доставка'],
          image: '/api/placeholder/400/200',
          distance: 0.5
        }
      },
      createdAt: '2024-01-15T05:20:00Z',
      likes: 31,
      comments: 7,
      shares: 5,
      isLiked: false,
      isBookmarked: true,
      tags: ['магазин', 'игрушки', 'новинки']
    }
  ];

  useEffect(() => {
    const loadFeedData = async () => {
      try {
        setIsLoading(true);
        // Симуляция загрузки
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStories(demoStories);
        setPosts(demoPosts);
      } catch (error) {
        toast.error('Ошибка загрузки ленты');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedData();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'photos' && post.type === 'photo') return true;
    if (activeFilter === 'videos' && post.type === 'video') return true;
    if (activeFilter === 'polls' && post.type === 'poll') return true;
    if (activeFilter === 'ads' && post.type === 'ad') return true;
    if (activeFilter === 'dao' && post.type === 'dao') return true;
    return false;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleVote = (postId: string, optionId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.content.poll) {
        const poll = post.content.poll;
        const option = poll.options.find(opt => opt.id === optionId);
        if (option && !poll.userVote) {
          return {
            ...post,
            content: {
              ...post.content,
              poll: {
                ...poll,
                userVote: optionId,
                totalVotes: poll.totalVotes + 1,
                options: poll.options.map(opt => 
                  opt.id === optionId 
                    ? { ...opt, votes: opt.votes + 1 }
                    : opt
                )
              }
            }
          };
        }
      }
      return post;
    }));
  };

  const handleDAOVote = (postId: string, vote: 'for' | 'against') => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.content.dao && !post.content.dao.userVote) {
        return {
          ...post,
          content: {
            ...post.content,
            dao: {
              ...post.content.dao,
              userVote: vote,
              votes: {
                for: vote === 'for' ? post.content.dao.votes.for + 1 : post.content.dao.votes.for,
                against: vote === 'against' ? post.content.dao.votes.against + 1 : post.content.dao.votes.against
              }
            }
          }
        };
      }
      return post;
    }));
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-purple-600">Загружаем ленту...</p>
      </div>
    </div>
  );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-purple-700 font-display">Лента</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Поиск
            </Button>
          </div>
        </div>

        {/* Stories */}
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 text-center cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full border-2 ${
                story.isViewed 
                  ? 'border-gray-300 dark:border-gray-600' 
                  : 'border-primary-600'
              } p-0.5 relative`}>
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {story.userAvatar ? (
                    <img
                      src={story.userAvatar}
                      alt={story.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                {story.isLive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate w-16">
                {story.username}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'Все', icon: <Image className="h-4 w-4" /> },
            { id: 'photos', label: 'Фото', icon: <Image className="h-4 w-4" /> },
            { id: 'videos', label: 'Видео', icon: <Video className="h-4 w-4" /> },
            { id: 'polls', label: 'Опросы', icon: <Vote className="h-4 w-4" /> },
            { id: 'ads', label: 'Реклама', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'dao', label: 'DAO', icon: <Award className="h-4 w-4" /> },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 max-w-2xl mx-auto">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {post.author.username}
                        </p>
                        {post.author.isVerified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        {post.author.isPartner && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Партнер
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{post.location.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {post.content.text && (
                  <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">
                    {post.content.text}
                  </p>
                )}

                {/* Images */}
                {post.content.images && (
                  <div className={`grid gap-2 mb-4 ${
                    post.content.images.length === 1 ? 'grid-cols-1' :
                    post.content.images.length === 2 ? 'grid-cols-2' :
                    post.content.images.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.content.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {post.content.images!.length > 3 && index === 2 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-semibold">
                              +{post.content.images!.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Video */}
                {post.content.video && (
                  <div className="relative mb-4">
                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Видео</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Poll */}
                {post.content.poll && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {post.content.poll.question}
                    </h4>
                    <div className="space-y-2">
                      {post.content.poll.options.map((option) => {
                        const percentage = post.content.poll!.totalVotes > 0 
                          ? (option.votes / post.content.poll!.totalVotes) * 100 
                          : 0;
                        const isUserVote = post.content.poll!.userVote === option.id;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleVote(post.id, option.id)}
                            disabled={!!post.content.poll!.userVote}
                            className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                              isUserVote 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            } ${post.content.poll!.userVote ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.text}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {option.votes} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Всего голосов: {post.content.poll.totalVotes}
                    </p>
                  </div>
                )}

                {/* Ad */}
                {post.content.ad && (
                  <div className="mb-4 border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
                    <div className="relative">
                      <img
                        src={post.content.ad.image}
                        alt={post.content.ad.title}
                        className="w-full h-48 object-cover"
                      />
                      {post.content.ad.discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                          -{post.content.ad.discount}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {post.content.ad.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {post.content.ad.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-600 font-medium">
                          {post.content.ad.partner}
                        </span>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DAO */}
                {post.content.dao && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        DAO Голосование
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {post.content.dao.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {post.content.dao.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          За: {post.content.dao.votes.for}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Против: {post.content.dao.votes.against}
                        </span>
                      </div>
                      {!post.content.dao.userVote ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleDAOVote(post.id, 'for')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            За
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDAOVote(post.id, 'against')}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Против
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Вы проголосовали: {post.content.dao.userVote === 'for' ? 'За' : 'Против'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Partner */}
                {post.content.partner && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.content.partner.image}
                        alt={post.content.partner.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {post.content.partner.name}
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium ml-1">
                              {post.content.partner.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {post.content.partner.distance} км
                          </span>
                        </div>
                        <div className="space-y-1">
                          {post.content.partner.offers.map((offer, index) => (
                            <p key={index} className="text-sm text-green-700 dark:text-green-300">
                              • {offer}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                      <Share className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`transition-colors ${
                      post.isBookmarked ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600'
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}