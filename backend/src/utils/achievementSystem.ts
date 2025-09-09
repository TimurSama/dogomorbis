import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Типы достижений
export interface AchievementConfig {
  id: string;
  type: 'WALKING' | 'TRAINING' | 'SOCIAL' | 'COLLECTION' | 'LEVEL' | 'SPECIAL' | 'REFERRAL' | 'COMMUNITY';
  title: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  condition: {
    type: 'COUNT' | 'STREAK' | 'TIME' | 'VALUE' | 'COMBINATION';
    target: number;
    metric: string;
    timeframe?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
  };
  rewards: {
    experience: number;
    bones: number;
    badge?: string;
  };
  hidden: boolean;
  category: string;
}

// Конфигурация всех достижений
export const ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  // Достижения за прогулки
  {
    id: 'first_walk',
    type: 'WALKING',
    title: 'Первая прогулка',
    description: 'Записали первую прогулку с собакой',
    icon: '🚶‍♂️',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 1, metric: 'walks_logged' },
    rewards: { experience: 25, bones: 10 },
    hidden: false,
    category: 'Прогулки',
  },
  {
    id: 'walking_enthusiast',
    type: 'WALKING',
    title: 'Энтузиаст прогулок',
    description: 'Записали 10 прогулок',
    icon: '🚶‍♂️🚶‍♂️',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 10, metric: 'walks_logged' },
    rewards: { experience: 50, bones: 25 },
    hidden: false,
    category: 'Прогулки',
  },
  {
    id: 'daily_walker',
    type: 'WALKING',
    title: 'Ежедневный гуляка',
    description: 'Гуляли с собакой 7 дней подряд',
    icon: '📅',
    rarity: 'UNCOMMON',
    condition: { type: 'STREAK', target: 7, metric: 'daily_walks' },
    rewards: { experience: 100, bones: 50 },
    hidden: false,
    category: 'Прогулки',
  },
  {
    id: 'marathon_walker',
    type: 'WALKING',
    title: 'Марафонец',
    description: 'Записали 100 прогулок',
    icon: '🏃‍♂️',
    rarity: 'RARE',
    condition: { type: 'COUNT', target: 100, metric: 'walks_logged' },
    rewards: { experience: 200, bones: 100 },
    hidden: false,
    category: 'Прогулки',
  },

  // Достижения за тренировки
  {
    id: 'first_training',
    type: 'TRAINING',
    title: 'Первая тренировка',
    description: 'Провели первую тренировку с собакой',
    icon: '🎓',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 1, metric: 'trainings_logged' },
    rewards: { experience: 30, bones: 15 },
    hidden: false,
    category: 'Тренировки',
  },
  {
    id: 'training_master',
    type: 'TRAINING',
    title: 'Мастер тренировок',
    description: 'Провели 50 тренировок',
    icon: '🏆',
    rarity: 'RARE',
    condition: { type: 'COUNT', target: 50, metric: 'trainings_logged' },
    rewards: { experience: 150, bones: 75 },
    hidden: false,
    category: 'Тренировки',
  },

  // Социальные достижения
  {
    id: 'first_post',
    type: 'SOCIAL',
    title: 'Первый пост',
    description: 'Создали первый пост',
    icon: '📝',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 1, metric: 'posts_created' },
    rewards: { experience: 15, bones: 5 },
    hidden: false,
    category: 'Социальная активность',
  },
  {
    id: 'social_butterfly',
    type: 'SOCIAL',
    title: 'Социальная бабочка',
    description: 'Создали 50 постов',
    icon: '🦋',
    rarity: 'UNCOMMON',
    condition: { type: 'COUNT', target: 50, metric: 'posts_created' },
    rewards: { experience: 100, bones: 50 },
    hidden: false,
    category: 'Социальная активность',
  },
  {
    id: 'popular_author',
    type: 'SOCIAL',
    title: 'Популярный автор',
    description: 'Получили 100 лайков на посты',
    icon: '❤️',
    rarity: 'RARE',
    condition: { type: 'COUNT', target: 100, metric: 'likes_received' },
    rewards: { experience: 150, bones: 75 },
    hidden: false,
    category: 'Социальная активность',
  },

  // Достижения за сбор косточек
  {
    id: 'first_bone',
    type: 'COLLECTION',
    title: 'Первая косточка',
    description: 'Собрали первую косточку',
    icon: '🦴',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 1, metric: 'bones_collected' },
    rewards: { experience: 10, bones: 5 },
    hidden: false,
    category: 'Сбор косточек',
  },
  {
    id: 'bone_collector',
    type: 'COLLECTION',
    title: 'Коллекционер косточек',
    description: 'Собрали 100 косточек',
    icon: '📦',
    rarity: 'UNCOMMON',
    condition: { type: 'COUNT', target: 100, metric: 'bones_collected' },
    rewards: { experience: 100, bones: 50 },
    hidden: false,
    category: 'Сбор косточек',
  },
  {
    id: 'golden_hunter',
    type: 'COLLECTION',
    title: 'Охотник за золотом',
    description: 'Собрали 10 золотых косточек',
    icon: '🥇',
    rarity: 'EPIC',
    condition: { type: 'COUNT', target: 10, metric: 'golden_bones_collected' },
    rewards: { experience: 300, bones: 200 },
    hidden: false,
    category: 'Сбор косточек',
  },

  // Достижения за уровни
  {
    id: 'level_5',
    type: 'LEVEL',
    title: 'Опытный собачник',
    description: 'Достигли 5 уровня',
    icon: '⭐',
    rarity: 'UNCOMMON',
    condition: { type: 'VALUE', target: 5, metric: 'level' },
    rewards: { experience: 0, bones: 100 },
    hidden: false,
    category: 'Уровни',
  },
  {
    id: 'level_10',
    type: 'LEVEL',
    title: 'Император собак',
    description: 'Достигли максимального уровня',
    icon: '👑',
    rarity: 'LEGENDARY',
    condition: { type: 'VALUE', target: 10, metric: 'level' },
    rewards: { experience: 0, bones: 500 },
    hidden: false,
    category: 'Уровни',
  },

  // Реферальные достижения
  {
    id: 'first_referral',
    type: 'REFERRAL',
    title: 'Первый друг',
    description: 'Пригласили первого друга',
    icon: '👥',
    rarity: 'COMMON',
    condition: { type: 'COUNT', target: 1, metric: 'referrals_successful' },
    rewards: { experience: 100, bones: 100 },
    hidden: false,
    category: 'Реферальная программа',
  },
  {
    id: 'social_networker',
    type: 'REFERRAL',
    title: 'Социальный сетевщик',
    description: 'Пригласили 10 друзей',
    icon: '🌐',
    rarity: 'RARE',
    condition: { type: 'COUNT', target: 10, metric: 'referrals_successful' },
    rewards: { experience: 500, bones: 500 },
    hidden: false,
    category: 'Реферальная программа',
  },

  // Специальные достижения
  {
    id: 'early_adopter',
    type: 'SPECIAL',
    title: 'Ранний пользователь',
    description: 'Зарегистрировались в первые 1000 пользователей',
    icon: '🚀',
    rarity: 'LEGENDARY',
    condition: { type: 'VALUE', target: 1000, metric: 'registration_rank' },
    rewards: { experience: 200, bones: 200, badge: 'early_adopter' },
    hidden: true,
    category: 'Специальные',
  },
  {
    id: 'beta_tester',
    type: 'SPECIAL',
    title: 'Бета-тестер',
    description: 'Участвовали в тестировании новых функций',
    icon: '🧪',
    rarity: 'EPIC',
    condition: { type: 'COUNT', target: 1, metric: 'beta_features_tested' },
    rewards: { experience: 150, bones: 150, badge: 'beta_tester' },
    hidden: true,
    category: 'Специальные',
  },

  // Достижения сообщества
  {
    id: 'event_organizer',
    type: 'COMMUNITY',
    title: 'Организатор событий',
    description: 'Организовали 5 событий',
    icon: '📅',
    rarity: 'RARE',
    condition: { type: 'COUNT', target: 5, metric: 'events_organized' },
    rewards: { experience: 200, bones: 100 },
    hidden: false,
    category: 'Сообщество',
  },
  {
    id: 'community_helper',
    type: 'COMMUNITY',
    title: 'Помощник сообщества',
    description: 'Помогли 20 пользователям',
    icon: '🤝',
    rarity: 'EPIC',
    condition: { type: 'COUNT', target: 20, metric: 'help_actions' },
    rewards: { experience: 300, bones: 200 },
    hidden: false,
    category: 'Сообщество',
  },
];

// Функция для проверки достижений пользователя
export async function checkAchievements(userId: string, action: string, metadata?: any): Promise<void> {
  try {
    // Получаем статистику пользователя
    const userStats = await getUserStats(userId);
    
    // Проверяем каждое достижение
    for (const achievementConfig of ACHIEVEMENT_CONFIGS) {
      // Проверяем, не получено ли уже это достижение
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          userId,
          title: achievementConfig.title,
        },
      });

      if (existingAchievement) {
        continue; // Достижение уже получено
      }

      // Проверяем условие достижения
      const isEarned = await checkAchievementCondition(achievementConfig, userStats, action, metadata);
      
      if (isEarned) {
        // Выдаем достижение
        await grantAchievement(userId, achievementConfig);
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке достижений:', error);
  }
}

// Функция для проверки условия достижения
async function checkAchievementCondition(
  config: AchievementConfig,
  userStats: any,
  action: string,
  metadata?: any
): Promise<boolean> {
  const { condition } = config;

  switch (condition.type) {
    case 'COUNT':
      return userStats[condition.metric] >= condition.target;
    
    case 'STREAK':
      return userStats[`${condition.metric}_streak`] >= condition.target;
    
    case 'VALUE':
      return userStats[condition.metric] >= condition.target;
    
    case 'TIME':
      if (condition.timeframe === 'DAILY') {
        return userStats[`${condition.metric}_today`] >= condition.target;
      } else if (condition.timeframe === 'WEEKLY') {
        return userStats[`${condition.metric}_this_week`] >= condition.target;
      } else if (condition.timeframe === 'MONTHLY') {
        return userStats[`${condition.metric}_this_month`] >= condition.target;
      }
      return userStats[condition.metric] >= condition.target;
    
    case 'COMBINATION':
      // Для сложных условий
      return await checkCombinationCondition(config, userStats, action, metadata);
    
    default:
      return false;
  }
}

// Функция для проверки сложных условий
async function checkCombinationCondition(
  config: AchievementConfig,
  userStats: any,
  action: string,
  metadata?: any
): Promise<boolean> {
  // Здесь можно добавить логику для сложных условий
  // Например, "создать 10 постов И получить 50 лайков"
  return false;
}

// Функция для выдачи достижения
async function grantAchievement(userId: string, config: AchievementConfig): Promise<void> {
  try {
    // Создаем запись о достижении
    await prisma.achievement.create({
      data: {
        userId,
        type: config.type,
        title: config.title,
        description: config.description,
        icon: config.icon,
      },
    });

    // Начисляем награды
    if (config.rewards.experience > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'EXPERIENCE',
          amount: config.rewards.experience,
          description: `Опыт за достижение: ${config.title}`,
        },
      });
    }

    if (config.rewards.bones > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: config.rewards.bones,
          description: `Косточки за достижение: ${config.title}`,
        },
      });
    }

    // Создаем значок, если предусмотрен
    if (config.rewards.badge) {
      await prisma.badge.create({
        data: {
          userId,
          type: 'ACHIEVEMENT',
          title: config.rewards.badge,
          description: `Значок за достижение: ${config.title}`,
          icon: config.icon,
        },
      });
    }

    // Создаем уведомление
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT',
        title: 'Новое достижение!',
        message: `Поздравляем! Вы получили достижение "${config.title}". ${config.description}`,
      },
    });

    console.log(`🏆 Достижение "${config.title}" выдано пользователю ${userId}`);
  } catch (error) {
    console.error('Ошибка при выдаче достижения:', error);
  }
}

// Функция для получения статистики пользователя
async function getUserStats(userId: string): Promise<any> {
  const stats = {
    // Прогулки
    walks_logged: await prisma.journalEntry.count({
      where: { userId, activity: 'WALK' },
    }),
    daily_walks_streak: await getStreak(userId, 'WALK'),
    
    // Тренировки
    trainings_logged: await prisma.journalEntry.count({
      where: { userId, activity: 'TRAINING' },
    }),
    
    // Социальная активность
    posts_created: await prisma.post.count({
      where: { userId },
    }),
    likes_received: await prisma.like.count({
      where: {
        post: { userId },
      },
    }),
    
    // Сбор косточек
    bones_collected: await prisma.collectibleCollection.count({
      where: { userId },
    }),
    golden_bones_collected: await prisma.collectibleCollection.count({
      where: {
        userId,
        spawn: { type: 'GOLDEN_BONE' },
      },
    }),
    
    // Уровень
    level: (await prisma.level.findUnique({
      where: { userId },
    }))?.level || 1,
    
    // Рефералы
    referrals_successful: await prisma.referral.count({
      where: { referrerId: userId, status: 'COMPLETED' },
    }),
    
    // События
    events_organized: await prisma.event.count({
      where: { organizerId: userId },
    }),
    
    // Помощь сообществу
    help_actions: 0, // Пока не реализовано
    
    // Специальные метрики
    registration_rank: await getUserRegistrationRank(userId),
    beta_features_tested: 0, // Пока не реализовано
  };

  return stats;
}

// Функция для получения серии (streak)
async function getStreak(userId: string, activity: string): Promise<number> {
  // Простая реализация - можно улучшить
  const recentEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      activity,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 30, // Проверяем последние 30 дней
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    const hasEntry = recentEntries.some(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === checkDate.getTime();
    });

    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Функция для получения ранга регистрации пользователя
async function getUserRegistrationRank(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (!user) return 0;

  const earlierUsers = await prisma.user.count({
    where: {
      createdAt: {
        lt: user.createdAt,
      },
    },
  });

  return earlierUsers + 1;
}

// Функция для получения всех доступных достижений
export function getAvailableAchievements(): AchievementConfig[] {
  return ACHIEVEMENT_CONFIGS.filter(achievement => !achievement.hidden);
}

// Функция для получения достижений по категории
export function getAchievementsByCategory(category: string): AchievementConfig[] {
  return ACHIEVEMENT_CONFIGS.filter(achievement => achievement.category === category);
}

// Функция для получения достижений по типу
export function getAchievementsByType(type: string): AchievementConfig[] {
  return ACHIEVEMENT_CONFIGS.filter(achievement => achievement.type === type);
}
