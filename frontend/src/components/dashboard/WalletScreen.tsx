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
  Banknote,
  History,
  Settings,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'bonus' | 'reward';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
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
      category: 'Бонусы'
    },
    {
      id: '2',
      type: 'income',
      amount: 50,
      description: 'Прогулка с Бобиком в парке',
      date: '2024-01-14T15:45:00Z',
      status: 'completed',
      category: 'Прогулки'
    },
    {
      id: '3',
      type: 'expense',
      amount: -25,
      description: 'Покупка лакомства в зоомагазине',
      date: '2024-01-13T12:20:00Z',
      status: 'completed',
      category: 'Покупки'
    }
  ];

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        
        if (isGuest) {
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
        console.error('Ошибка загрузки данных кошелька');
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
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования');
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
      case 'income': return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'expense': return <ArrowUpRight className="w-4 h-4 text-error" />;
      case 'bonus': return <Gift className="w-4 h-4 text-info" />;
      case 'reward': return <Star className="w-4 h-4 text-warning" />;
      default: return <Wallet className="w-4 h-4 text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'failed': return 'text-error bg-error/10';
      default: return 'text-secondary bg-surface-2';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface theme-transition">
        <LoadingSpinner size="md" text="Загружаем кошелёк..." />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="h-full flex flex-col bg-surface overflow-hidden theme-transition">
        {/* Guest Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto">
            <motion.div 
              className="card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-10 w-10 text-secondary" />
              </div>
              <h2 className="title mb-2">
                Кошелёк недоступен
              </h2>
              <p className="body text-secondary mb-6">
                Зарегистрируйтесь, чтобы получить доступ к виртуальной валюте, 
                собирать косточки и пряжу, а также участвовать в программе лояльности.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-surface-2 rounded-l">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <Banknote className="h-4 w-4 text-warning" />
                  </div>
                  <div className="text-left">
                    <p className="body font-medium">Виртуальная валюта</p>
                    <p className="caption">Зарабатывайте и тратьте</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-surface-2 rounded-l">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <Gift className="h-4 w-4 text-warning" />
                  </div>
                  <div className="text-left">
                    <p className="body font-medium">Косточки и пряжа</p>
                    <p className="caption">Собирайте за активность</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-surface-2 rounded-l">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="body font-medium">Реферальная программа</p>
                    <p className="caption">Приглашайте друзей</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onShowAuth}
                className="btn btn-primary w-full"
              >
                Войти в аккаунт
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden theme-transition">
      {/* Header */}
      <div className="bg-surface-1 border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="title">Кошелёк</h1>
          <button className="flex items-center space-x-2 px-3 py-2 text-secondary hover:text-primary transition-colors">
            <Settings className="h-4 w-4" />
            <span className="caption">Настройки</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-1 border-b border-border flex-shrink-0">
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
                    ? 'text-primary border-b-2 border-primary bg-surface-2'
                    : 'text-secondary hover:text-primary'
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
              transition={{ duration: 0.24 }}
              className="space-y-6"
            >
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="caption">Баланс</p>
                      <p className="title">
                        {walletData.balance.toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-info" />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="caption">Косточки</p>
                      <p className="title text-warning">
                        {walletData.bones.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">🦴</span>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="caption">Пряжа</p>
                      <p className="title text-info">
                        {walletData.yarn.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">🧶</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="title mb-4">
                  Быстрые действия
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleTopUp}
                    className="h-16 flex flex-col items-center justify-center space-y-2 btn btn-primary"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Пополнить</span>
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="h-16 flex flex-col items-center justify-center space-y-2 btn btn-ghost"
                  >
                    <Minus className="h-6 w-6" />
                    <span>Вывести</span>
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-6">
                  <h4 className="caption mb-2">
                    Всего заработано
                  </h4>
                  <p className="title text-success">
                    {walletData.totalEarned.toLocaleString()} ₽
                  </p>
                </div>
                <div className="card p-6">
                  <h4 className="caption mb-2">
                    Всего потрачено
                  </h4>
                  <p className="title text-error">
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
              transition={{ duration: 0.24 }}
              className="space-y-4"
            >
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <p className="text-secondary">Нет транзакций</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="body font-medium">
                            {transaction.description}
                          </p>
                          <p className="caption">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`body font-semibold ${
                          transaction.amount > 0 ? 'text-success' : 'text-error'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} ₽
                        </p>
                        <span className={`caption px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
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
              transition={{ duration: 0.24 }}
              className="space-y-4"
            >
              <div className="card p-6">
                <h3 className="title mb-4">
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
                    <div key={index} className="flex items-center justify-between p-4 bg-surface-2 rounded-l">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="body font-medium">{item.title}</p>
                          <p className="caption">{item.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="body font-semibold text-success">{item.reward}</p>
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
              transition={{ duration: 0.24 }}
              className="space-y-4"
            >
              <div className="card p-6">
                <h3 className="title mb-4">
                  Реферальная программа
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-info/10 rounded-l">
                    <div className="flex items-center justify-between mb-2">
                      <p className="body font-medium">Ваш реферальный код</p>
                      <button
                        onClick={handleCopyReferralCode}
                        className="btn btn-ghost text-sm"
                      >
                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="title text-info font-mono">
                      {walletData.referralCode}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-surface-2 rounded-l">
                      <p className="title text-info">0</p>
                      <p className="caption">Приглашено друзей</p>
                    </div>
                    <div className="text-center p-4 bg-surface-2 rounded-l">
                      <p className="title text-success">{walletData.referralEarnings} ₽</p>
                      <p className="caption">Заработано с рефералов</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-warning/10 rounded-l">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="body font-medium text-warning">
                          Как работает реферальная программа
                        </p>
                        <p className="caption text-warning mt-1">
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