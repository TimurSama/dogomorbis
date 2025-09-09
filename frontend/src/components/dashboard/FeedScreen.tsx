'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

interface Post {
  id: string;
  type: 'photo' | 'video' | 'text' | 'poll' | 'ad' | 'dao' | 'partner';
  author: {
    id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  media?: string[];
  timestamp: string;
  location?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState('all');

  const mockPosts: Post[] = [
    {
      id: '1',
      type: 'photo',
      author: {
        id: '1',
        username: 'Анна_Собаковод',
        avatar: '/api/placeholder/40/40',
        verified: true,
      },
      content: 'Прекрасная прогулка с Бобиком в парке! 🐕',
      media: ['/api/placeholder/400/300'],
      timestamp: '2 часа назад',
      location: 'Парк Сокольники',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: '2',
      type: 'text',
      author: {
        id: '2',
        username: 'Максим_Кинолог',
        avatar: '/api/placeholder/40/40',
      },
      content: 'Поделитесь опытом дрессировки щенков немецкой овчарки. Какие команды лучше изучать первыми?',
      timestamp: '4 часа назад',
      likes: 12,
      comments: 15,
      shares: 2,
      isLiked: true,
      isBookmarked: true,
    },
    {
      id: '3',
      type: 'video',
      author: {
        id: '3',
        username: 'Елена_Ветеринар',
        avatar: '/api/placeholder/40/40',
        verified: true,
      },
      content: 'Полезные советы по уходу за зубами собак',
      media: ['/api/placeholder/400/300'],
      timestamp: '6 часов назад',
      likes: 45,
      comments: 12,
      shares: 8,
      isLiked: false,
      isBookmarked: false,
    },
  ];

  const filters = [
    { id: 'all', label: 'Все', icon: TrendingUp },
    { id: 'following', label: 'Подписки', icon: Users },
    { id: 'nearby', label: 'Рядом', icon: MapPin },
    { id: 'trending', label: 'Популярное', icon: Star },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">Лента</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Search className="h-5 w-5 text-[var(--text)]" />
            </button>
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <Filter className="h-5 w-5 text-[var(--text)]" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-[var(--honey)] text-[#1C1A19]'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
            >
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={post.author.avatar || '/api/placeholder/40/40'}
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-[var(--text)]">{post.author.username}</span>
                    {post.author.verified && (
                      <Star className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[var(--dim)]">
                    <span>{post.timestamp}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{post.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-[var(--text)]" />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-3">
                <p className="text-[var(--text)]">{post.content}</p>
              </div>

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <div className="mb-3">
                  {post.type === 'photo' && (
                    <img
                      src={post.media[0]}
                      alt="Post media"
                      className="w-full rounded-lg object-cover"
                    />
                  )}
                  {post.type === 'video' && (
                    <div className="relative w-full bg-[var(--surface-2)] rounded-lg aspect-video flex items-center justify-center">
                      <button className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--outline)]">
                <div className="flex items-center space-x-6">
                  <button className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : 'text-[var(--dim)] hover:text-red-500'}`}>
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[var(--dim)] hover:text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[var(--dim)] hover:text-green-500">
                    <Share className="h-5 w-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
                <button className={`p-2 ${post.isBookmarked ? 'text-blue-500' : 'text-[var(--dim)] hover:text-blue-500'}`}>
                  <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}