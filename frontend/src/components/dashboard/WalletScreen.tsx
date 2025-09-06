'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Gift,
  Star,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  History,
  Settings,
  Copy,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'bonus' | 'reward';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
  icon: string;
}

interface WalletData {
  balance: number;
  bones: number;
  yarn: number;
  totalEarned: number;
  totalSpent: number;
  referralCode: string;
  referralEarnings: number;
}

interface WalletScreenProps {
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function WalletScreen({ isGuest = false, onShowAuth }: WalletScreenProps) {
  const { user } = useAuthStore();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    bones: 0,
    yarn: 0,
    totalEarned: 0,
    totalSpent: 0,
    referralCode: '',
    referralEarnings: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earn' | 'referrals'>('overview');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Демо данные для гостевого режима
  const demoTransactions: Transaction[] = [
    {
      id: '1',
      type: 'bonus',
      amount: 100,
      description: 'Добро пожаловать! Бонус за регистрацию',
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      category: 'Бонусы',
      icon: '🎁'
    },
    {
      id: '2',
      type: 'income',
      amount: 50,
      description: 'Прогулка с Бобиком в парке',
      date: '2024-01-14T15:45:00Z',
      status: 'completed',
      category: 'Прогулки',
      icon: '🐕'
    },
    {
      id: '3',
      type: 'expense',
      amount: -25,
      description: 'Покупка лакомства в зоомагазине',
      date: '2024-01-13T12:20:00Z',
      status: 'completed',
      category: 'Покупки',
      icon: '🛒'
    },
    {
      id: '4',
      type: 'reward',
      amount: 75,
      description: 'Достижение: 10 прогулок подряд',
      date: '2024-01-12T18:00:00Z',
      status: 'completed',
      category: 'Достижения',
      icon: '🏆'
    },
    {
      id: '5',
      type: 'income',
      amount: 30,
      description: 'Реферальный бонус от друга',
      date: '2024-01-11T09:15:00Z',
      status: 'completed',
      category: 'Рефералы',
      icon: '👥'
    }
  ];

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        
        if (isGuest) {
          // Демо данные для гостевого режима
          setWalletData({
            balance: 0,
            bones: 0,
            yarn: 0,
            totalEarned: 0,
            totalSpent: 0,
            referralCode: '',
            referralEarnings: 0
          });
          setTransactions([]);
        } else {
          // Здесь будет загрузка реальных данных
          setWalletData({
            balance: 1250,
            bones: 45,
            yarn: 12,
            totalEarned: 2500,
            totalSpent: 1250,
            referralCode: 'DOGO2024',
            referralEarnings: 300
          });
          setTransactions(demoTransactions);
        }
      } catch (error) {
        toast.error('Ошибка загрузки данных кошелька');
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletData();
  }, [isGuest]);

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(walletData.referralCode);
      setCopiedCode(true);
      toast.success('Код скопирован!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Ошибка копирования');
    }
  };

  const handleTopUp = () => {
    if (isGuest) {
      onShowAuth?.();
      return;
    }
    setShowTopUp(true);
  };

  const handleWithdraw = () => {
    if (isGuest) {
      onShowAuth?.();
      return;
    }
    setShowWithdraw(true);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'expense': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'bonus': return <Gift className="w-4 h-4 text-blue-600" />;
      case 'reward': return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-gray-400">Загружаем кошелёк...</p>
        </div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
          <h1 className="text-xl font-bold text-purple-700 font-display">Кошелёк</h1>
        </div>

        {/* Guest Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center soft-shadow pencil-border fur-texture">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 soft-shadow">
                <Wallet className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-700 font-display mb-2">
                Кошелёк недоступен
              </h2>
              <p className="text-gray-700 mb-6">
                Зарегистрируйтесь, чтобы получить доступ к виртуальной валюте, 
                собирать косточки и пряжу, а также участвовать в программе лояльности.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full flex items-center justify-center soft-shadow">
                    <Banknote className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Виртуальная валюта</p>
                    <p className="text-sm text-gray-600">Зарабатывайте и тратьте</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-200 to-pink-300 rounded-full flex items-center justify-center soft-shadow">
                    <Gift className="h-4 w-4 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Косточки и пряжа</p>
                    <p className="text-sm text-gray-600">Собирайте за активность</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-200 to-blue-300 rounded-full flex items-center justify-center soft-shadow">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Реферальная программа</p>
                    <p className="text-sm text-gray-600">Приглашайте друзей</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={onShowAuth}
                className="w-full bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
              >
                Войти в аккаунт
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-700 font-display">Кошелёк</h1>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white bg-gray-800 border-b border-gray-200 border-gray-700 flex-shrink-0">
        <div className="flex space-x-0">
          {[
            { id: 'overview', label: 'Обзор', icon: Wallet },
            { id: 'transactions', label: 'История', icon: History },
            { id: 'earn', label: 'Заработать', icon: TrendingUp },
            { id: 'referrals', label: 'Рефералы', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 bg-primary-900/20'
                    : 'text-gray-600 text-gray-400 hover:text-gray-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 text-gray-400">Баланс</p>
                      <p className="text-2xl font-bold text-gray-900 text-white">
                        {walletData.balance.toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 bg-primary-900 rounded-full flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 text-gray-400">Косточки</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {walletData.bones.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 bg-orange-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">🦴</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 text-gray-400">Пряжа</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {walletData.yarn.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">🧶</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                  Быстрые действия
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleTopUp}
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Пополнить</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Minus className="h-6 w-6" />
                    <span>Вывести</span>
                  </Button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 text-gray-400 mb-2">
                    Всего заработано
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {walletData.totalEarned.toLocaleString()} ₽
                  </p>
                </div>
                <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 text-gray-400 mb-2">
                    Всего потрачено
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    {walletData.totalSpent.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-gray-400">Нет транзакций</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white bg-gray-800 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 bg-gray-700 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600 text-gray-400">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} ₽
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'completed' ? 'Завершено' :
                           transaction.status === 'pending' ? 'В обработке' : 'Ошибка'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'earn' && (
            <motion.div
              key="earn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                  Способы заработка
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Прогулки с собакой', reward: '10-50 ₽', icon: '🐕', desc: 'За каждую прогулку' },
                    { title: 'Встречи с друзьями', reward: '25 ₽', icon: '👥', desc: 'За встречу с другим пользователем' },
                    { title: 'Достижения', reward: '50-200 ₽', icon: '🏆', desc: 'За выполнение целей' },
                    { title: 'Ежедневный бонус', reward: '5-20 ₽', icon: '🎁', desc: 'За ежедневный вход' },
                    { title: 'Отзывы о партнерах', reward: '15 ₽', icon: '⭐', desc: 'За честный отзыв' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 text-white">{item.title}</p>
                          <p className="text-sm text-gray-600 text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{item.reward}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                  Реферальная программа
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 bg-primary-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 text-white">Ваш реферальный код</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyReferralCode}
                      >
                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-2xl font-bold text-primary-600 font-mono">
                      {walletData.referralCode}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">0</p>
                      <p className="text-sm text-gray-600 text-gray-400">Приглашено друзей</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{walletData.referralEarnings} ₽</p>
                      <p className="text-sm text-gray-600 text-gray-400">Заработано с рефералов</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 text-yellow-200">
                          Как работает реферальная программа
                        </p>
                        <p className="text-sm text-yellow-700 text-yellow-300 mt-1">
                          Приглашайте друзей по своему коду и получайте 50 ₽ за каждого, 
                          кто зарегистрируется и совершит первую прогулку.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}