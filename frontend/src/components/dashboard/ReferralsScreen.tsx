'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Share2, 
  Copy, 
  Gift, 
  Users,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Referral {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  joinedAt: string;
  status: 'pending' | 'active' | 'completed';
  reward: number;
  level: number;
}

export function ReferralsScreen() {
  const [referralCode, setReferralCode] = useState('DOGY2024');
  const [referralLink, setReferralLink] = useState('https://dogymorbis.com/ref/DOGY2024');

  const mockReferrals: Referral[] = [
    {
      id: '1',
      username: 'Анна_Собаковод',
      firstName: 'Анна',
      lastName: 'Петрова',
      avatar: '/api/placeholder/40/40',
      joinedAt: '2024-01-15',
      status: 'completed',
      reward: 100,
      level: 1
    },
    {
      id: '2',
      username: 'Максим_Кинолог',
      firstName: 'Максим',
      lastName: 'Сидоров',
      avatar: '/api/placeholder/40/40',
      joinedAt: '2024-01-10',
      status: 'active',
      reward: 50,
      level: 2
    },
    {
      id: '3',
      username: 'Елена_Ветеринар',
      firstName: 'Елена',
      lastName: 'Козлова',
      avatar: '/api/placeholder/40/40',
      joinedAt: '2024-01-08',
      status: 'pending',
      reward: 0,
      level: 0
    }
  ];

  const referralStats = {
    totalReferrals: mockReferrals.length,
    activeReferrals: mockReferrals.filter(r => r.status === 'active').length,
    completedReferrals: mockReferrals.filter(r => r.status === 'completed').length,
    totalEarned: mockReferrals.reduce((sum, r) => sum + r.reward, 0),
    pendingRewards: mockReferrals.filter(r => r.status === 'pending').length * 50
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Здесь можно добавить уведомление об успешном копировании
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Присоединяйтесь к Dogymorbis!',
        text: 'Присоединяйтесь к сообществу собачников и получите бонус!',
        url: referralLink
      });
    } else {
      copyToClipboard(referralLink);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Рефералы</h1>
            <p className="text-sm text-purple-600">Приглашайте друзей и получайте награды</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <QrCode className="h-4 w-4 mr-2" />
              QR код
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{referralStats.totalReferrals}</div>
            <div className="text-xs text-gray-600">Всего приглашено</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{referralStats.activeReferrals}</div>
            <div className="text-xs text-gray-600">Активных</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{referralStats.completedReferrals}</div>
            <div className="text-xs text-gray-600">Завершено</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{referralStats.totalEarned}</div>
            <div className="text-xs text-gray-600">Заработано</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Referral Code Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-4 soft-shadow pencil-border fur-texture">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ваш реферальный код</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Код для приглашения</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-pink-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-800 font-mono text-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralCode)}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка для приглашения</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-pink-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-800 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralLink)}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={shareReferral}
                  className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-4 soft-shadow pencil-border fur-texture">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Система наград</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <Gift className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-gray-800">За каждого друга</div>
                <div className="text-sm text-gray-600">50 косточек при регистрации</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <Award className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium text-gray-800">При первой активности</div>
                <div className="text-sm text-gray-600">+50 косточек за первую прогулку</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <Star className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-gray-800">Бонус за активность</div>
                <div className="text-sm text-gray-600">Дополнительные награды за активность друзей</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ваши рефералы</h2>
          
          {mockReferrals.length > 0 ? (
            <div className="space-y-3">
              {mockReferrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/30"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={referral.avatar || '/api/placeholder/40/40'}
                      alt={referral.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{referral.firstName} {referral.lastName}</div>
                      <div className="text-sm text-purple-600">@{referral.username}</div>
                      <div className="text-xs text-gray-500">Присоединился: {referral.joinedAt}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-800">{referral.reward} косточек</div>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {getStatusIcon(referral.status)}
                        <span>{referral.status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Пока нет рефералов</h3>
              <p className="text-gray-600 mb-4">Пригласите друзей и получите награды!</p>
              <Button
                variant="default"
                className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
                onClick={shareReferral}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
