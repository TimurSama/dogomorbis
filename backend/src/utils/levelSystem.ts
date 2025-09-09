import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Конфигурация уровней
export interface LevelConfig {
  level: number;
  minExperience: number;
  maxExperience: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  title: string;
  description: string;
  benefits: string[];
  color: string;
}

// Система уровней
export const LEVEL_SYSTEM: LevelConfig[] = [
  {
    level: 1,
    minExperience: 0,
    maxExperience: 99,
    tier: 'BRONZE',
    title: 'Новичок',
    description: 'Только начинаете свой путь в Dogymorbis',
    benefits: ['Доступ к базовым функциям', 'Сбор косточек'],
    color: '#CD7F32',
  },
  {
    level: 2,
    minExperience: 100,
    maxExperience: 249,
    tier: 'BRONZE',
    title: 'Любитель собак',
    description: 'Уже знаете основы ухода за питомцами',
    benefits: ['Доступ к базовым функциям', 'Сбор косточек', 'Создание постов'],
    color: '#CD7F32',
  },
  {
    level: 3,
    minExperience: 250,
    maxExperience: 499,
    tier: 'BRONZE',
    title: 'Активный владелец',
    description: 'Регулярно гуляете с собакой',
    benefits: ['Доступ к базовым функциям', 'Сбор косточек', 'Создание постов', 'Участие в событиях'],
    color: '#CD7F32',
  },
  {
    level: 4,
    minExperience: 500,
    maxExperience: 999,
    tier: 'SILVER',
    title: 'Опытный собачник',
    description: 'Знаете много о собаках и их потребностях',
    benefits: ['Все предыдущие', 'Создание событий', 'Доступ к премиум косточкам'],
    color: '#C0C0C0',
  },
  {
    level: 5,
    minExperience: 1000,
    maxExperience: 1999,
    tier: 'SILVER',
    title: 'Эксперт по собакам',
    description: 'Можете давать советы другим владельцам',
    benefits: ['Все предыдущие', 'Модерация контента', 'Специальные награды'],
    color: '#C0C0C0',
  },
  {
    level: 6,
    minExperience: 2000,
    maxExperience: 3999,
    tier: 'GOLD',
    title: 'Мастер собаководства',
    description: 'Настоящий профессионал в области собак',
    benefits: ['Все предыдущие', 'Приоритетная поддержка', 'Эксклюзивные события'],
    color: '#FFD700',
  },
  {
    level: 7,
    minExperience: 4000,
    maxExperience: 6999,
    tier: 'GOLD',
    title: 'Легенда Dogymorbis',
    description: 'Один из самых активных пользователей',
    benefits: ['Все предыдущие', 'Персональный менеджер', 'Участие в разработке'],
    color: '#FFD700',
  },
  {
    level: 8,
    minExperience: 7000,
    maxExperience: 11999,
    tier: 'PLATINUM',
    title: 'Амбассадор',
    description: 'Представляете Dogymorbis в сообществе',
    benefits: ['Все предыдущие', 'Бета-доступ к новым функциям', 'Встречи с командой'],
    color: '#E5E4E2',
  },
  {
    level: 9,
    minExperience: 12000,
    maxExperience: 19999,
    tier: 'PLATINUM',
    title: 'Гуру собаководства',
    description: 'Мудрый наставник для всех владельцев собак',
    benefits: ['Все предыдущие', 'Создание обучающих материалов', 'Монетизация контента'],
    color: '#E5E4E2',
  },
  {
    level: 10,
    minExperience: 20000,
    maxExperience: 999999,
    tier: 'DIAMOND',
    title: 'Император собак',
    description: 'Вершина мастерства в Dogymorbis',
    benefits: ['Все предыдущие', 'Пожизненный премиум', 'Собственный титул'],
    color: '#B9F2FF',
  },
];

// Очки опыта за различные действия
export const EXPERIENCE_REWARDS = {
  // Социальная активность
  CREATE_POST: 10,
  LIKE_POST: 1,
  COMMENT_POST: 5,
  SHARE_POST: 3,
  
  // Взаимодействие с собаками
  ADD_DOG_PROFILE: 25,
  UPDATE_DOG_PROFILE: 5,
  ADD_DOG_PHOTO: 3,
  
  // Прогулки и активность
  LOG_WALK: 15,
  LOG_TRAINING: 20,
  LOG_FEEDING: 5,
  LOG_VET_VISIT: 30,
  
  // Сбор косточек
  COLLECT_BONE: 2,
  COLLECT_YARN_BALL: 1,
  COLLECT_TREAT: 5,
  COLLECT_TOY: 8,
  COLLECT_GOLDEN_BONE: 25,
  
  // События и сообщество
  JOIN_EVENT: 10,
  CREATE_EVENT: 20,
  COMPLETE_EVENT: 15,
  
  // Достижения
  EARN_ACHIEVEMENT: 50,
  EARN_BADGE: 30,
  
  // Реферальная программа
  REFER_FRIEND: 100,
  BE_REFERRED: 50,
  
  // Ежедневная активность
  DAILY_LOGIN: 5,
  WEEKLY_ACTIVE: 25,
  MONTHLY_ACTIVE: 100,
  
  // Специальные действия
  COMPLETE_PROFILE: 20,
  VERIFY_EMAIL: 10,
  VERIFY_PHONE: 10,
  UPLOAD_AVATAR: 5,
};

// Функция для получения текущего уровня пользователя
export function getCurrentLevel(experience: number): LevelConfig {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_SYSTEM[i].minExperience) {
      return LEVEL_SYSTEM[i];
    }
  }
  return LEVEL_SYSTEM[0];
}

// Функция для получения прогресса до следующего уровня
export function getLevelProgress(experience: number): {
  currentLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  progress: number;
  experienceToNext: number;
} {
  const currentLevel = getCurrentLevel(experience);
  const currentIndex = LEVEL_SYSTEM.findIndex(level => level.level === currentLevel.level);
  const nextLevel = currentIndex < LEVEL_SYSTEM.length - 1 ? LEVEL_SYSTEM[currentIndex + 1] : null;
  
  const experienceInCurrentLevel = experience - currentLevel.minExperience;
  const experienceNeededForCurrentLevel = currentLevel.maxExperience - currentLevel.minExperience;
  const progress = experienceNeededForCurrentLevel > 0 ? (experienceInCurrentLevel / experienceNeededForCurrentLevel) * 100 : 100;
  
  const experienceToNext = nextLevel ? nextLevel.minExperience - experience : 0;
  
  return {
    currentLevel,
    nextLevel,
    progress: Math.min(progress, 100),
    experienceToNext,
  };
}

// Функция для добавления опыта пользователю
export async function addExperience(
  userId: string,
  action: keyof typeof EXPERIENCE_REWARDS,
  metadata?: any
): Promise<{
  success: boolean;
  experienceAdded: number;
  newLevel?: LevelConfig;
  leveledUp: boolean;
  message?: string;
}> {
  try {
    const experienceToAdd = EXPERIENCE_REWARDS[action];
    
    // Получаем текущий уровень пользователя
    const userLevel = await prisma.level.findUnique({
      where: { userId },
    });
    
    const currentExperience = userLevel?.experience || 0;
    const currentLevel = getCurrentLevel(currentExperience);
    const newExperience = currentExperience + experienceToAdd;
    const newLevel = getCurrentLevel(newExperience);
    
    const leveledUp = newLevel.level > currentLevel.level;
    
    // Обновляем или создаем запись уровня
    await prisma.level.upsert({
      where: { userId },
      update: {
        experience: newExperience,
        level: newLevel.level,
        tier: newLevel.tier,
      },
      create: {
        userId,
        experience: newExperience,
        level: newLevel.level,
        tier: newLevel.tier,
      },
    });
    
    // Создаем транзакцию опыта
    await prisma.transaction.create({
      data: {
        userId,
        type: 'EARN',
        currency: 'EXPERIENCE',
        amount: experienceToAdd,
        description: `Получен опыт за: ${action}`,
        metadata: JSON.stringify({
          action,
          metadata,
          leveledUp,
          newLevel: newLevel.level,
        }),
      },
    });
    
    let message = `Получено ${experienceToAdd} опыта за ${action}`;
    
    if (leveledUp) {
      message += `! Поздравляем! Вы достигли ${newLevel.level} уровня: ${newLevel.title}`;
      
      // Создаем уведомление о повышении уровня
      await prisma.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: 'Повышение уровня!',
          message: `Поздравляем! Вы достигли ${newLevel.level} уровня: ${newLevel.title}. ${newLevel.description}`,
        },
      });
      
      // Создаем достижение за повышение уровня
      await prisma.achievement.create({
        data: {
          userId,
          type: 'LEVEL',
          title: `Уровень ${newLevel.level}`,
          description: `Достигли ${newLevel.level} уровня: ${newLevel.title}`,
          icon: getTierIcon(newLevel.tier),
        },
      });
    }
    
    return {
      success: true,
      experienceAdded: experienceToAdd,
      newLevel: leveledUp ? newLevel : undefined,
      leveledUp,
      message,
    };
  } catch (error) {
    console.error('Ошибка при добавлении опыта:', error);
    return {
      success: false,
      experienceAdded: 0,
      leveledUp: false,
      message: 'Ошибка при добавлении опыта',
    };
  }
}

// Функция для получения иконки тира
function getTierIcon(tier: string): string {
  const icons = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
    PLATINUM: '💎',
    DIAMOND: '💠',
  };
  return icons[tier as keyof typeof icons] || '⭐';
}

// Функция для получения статистики пользователя
export async function getUserStats(userId: string): Promise<{
  level: LevelConfig;
  progress: {
    currentLevel: LevelConfig;
    nextLevel: LevelConfig | null;
    progress: number;
    experienceToNext: number;
  };
  totalExperience: number;
  experienceThisWeek: number;
  experienceThisMonth: number;
  topActions: Array<{ action: string; count: number; totalExperience: number }>;
}> {
  const userLevel = await prisma.level.findUnique({
    where: { userId },
  });
  
  const totalExperience = userLevel?.experience || 0;
  const level = getCurrentLevel(totalExperience);
  const progress = getLevelProgress(totalExperience);
  
  // Опыт за неделю
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const experienceThisWeek = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EARN',
      currency: 'EXPERIENCE',
      createdAt: {
        gte: weekAgo,
      },
    },
    _sum: {
      amount: true,
    },
  });
  
  // Опыт за месяц
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const experienceThisMonth = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EARN',
      currency: 'EXPERIENCE',
      createdAt: {
        gte: monthAgo,
      },
    },
    _sum: {
      amount: true,
    },
  });
  
  // Топ действий за опыт
  const topActionsData = await prisma.transaction.groupBy({
    by: ['metadata'],
    where: {
      userId,
      type: 'EARN',
      currency: 'EXPERIENCE',
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 5,
  });
  
  const topActions = topActionsData.map(item => {
    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    return {
      action: metadata.action || 'Unknown',
      count: item._count.id,
      totalExperience: item._sum.amount || 0,
    };
  });
  
  return {
    level,
    progress,
    totalExperience,
    experienceThisWeek: experienceThisWeek._sum.amount || 0,
    experienceThisMonth: experienceThisMonth._sum.amount || 0,
    topActions,
  };
}

// Функция для получения лидерборда
export async function getLeaderboard(limit: number = 50): Promise<Array<{
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  level: number;
  tier: string;
  experience: number;
  title: string;
}>> {
  const topUsers = await prisma.level.findMany({
    take: limit,
    orderBy: [
      { level: 'desc' },
      { experience: 'desc' },
    ],
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
  
  return topUsers.map((userLevel, index) => {
    const levelConfig = getCurrentLevel(userLevel.experience);
    return {
      rank: index + 1,
      userId: userLevel.userId,
      username: userLevel.user.username,
      firstName: userLevel.user.firstName,
      lastName: userLevel.user.lastName,
      avatar: userLevel.user.avatar,
      level: userLevel.level,
      tier: userLevel.tier,
      experience: userLevel.experience,
      title: levelConfig.title,
    };
  });
}
