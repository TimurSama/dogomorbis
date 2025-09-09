'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Gift, 
  Share, 
  Copy, 
  Check, 
  Star, 
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  UserPlus
} from 'lucide-react';

export function ReferralsScreen() {
  const [copiedCode, setCopiedCode] = useState(false);
  const referralCode = 'DOGOMORBIS2024';

  const mockReferrals = [
    {
      id: '1',
      name: 'Анна Петрова',
      email: 'anna@example.com',
      joinDate: '10 марта 2024',
      status: 'active',
      reward: 100,
    },
    {
      id: '2',
      name: 'Максим Сидоров',
      email: 'maxim@example.com',
      joinDate: '8 марта 2024',
      status: 'active',
      reward: 100,
    },
    {
      id: '3',
      name: 'Елена Козлова',
      email: 'elena@example.com',
      joinDate: '5 марта 2024',
      status: 'pending',
      reward: 0,
    },
  ];

  const stats = {
    totalReferrals: 3,
    activeReferrals: 2,
    totalRewards: 200,
    pendingRewards: 100,
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-[var(--text)] mb-4">Реферальная программа</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[var(--surface-2)] rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-[var(--text)]">Рефералов</span>
            </div>
            <div className="text-xl font-bold text-[var(--text)]">{stats.totalReferrals}</div>
          </div>
          <div className="bg-[var(--surface-2)] rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-[var(--text)]">Награды</span>
            </div>
            <div className="text-xl font-bold text-[var(--text)]">{stats.totalRewards}</div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text)] mb-2">Ваш реферальный код</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-[var(--surface)] border border-[var(--outline)] rounded-lg px-3 py-2">
              <span className="font-mono text-lg font-bold text-[var(--text)]">{referralCode}</span>
            </div>
            <button
              onClick={copyReferralCode}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* How it works */}
        <div className="bg-[var(--surface-2)] rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[var(--text)] mb-3">Как это работает</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Поделитесь своим реферальным кодом с друзьями
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Друг регистрируется по вашему коду
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Вы получаете 100 очков за каждого реферала
              </p>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-4">Ваши рефералы</h3>
          <div className="space-y-3">
            {mockReferrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--surface-2)] rounded-full flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-[var(--dim)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)]">{referral.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">{referral.email}</p>
                      <p className="text-xs text-[var(--dim)]">Присоединился {referral.joinDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {referral.status === 'active' ? 'Активен' : 'Ожидает'}
                    </div>
                    <div className="text-sm font-medium text-[var(--text)] mt-1">
                      {referral.reward} очков
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-6">
          <h3 className="font-semibold text-[var(--text)] mb-3">Поделиться</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Share className="h-4 w-4" />
              <span>Социальные сети</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Share className="h-4 w-4" />
              <span>Мессенджеры</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}