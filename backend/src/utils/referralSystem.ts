import { PrismaClient } from '@prisma/client';
import { addExperience } from './levelSystem';

const prisma = new PrismaClient();

// Конфигурация реферальной системы
export const REFERRAL_CONFIG = {
  REFERRER_REWARD: 100, // косточек за приглашение
  REFERRED_REWARD: 50,  // косточек за регистрацию по реферальной ссылке
  REFERRER_EXPERIENCE: 100, // опыта за приглашение
  REFERRED_EXPERIENCE: 50,  // опыта за регистрацию
  MAX_REFERRALS_PER_USER: 100, // максимум рефералов на пользователя
  REFERRAL_CODE_LENGTH: 8, // длина реферального кода
  REFERRAL_CODE_EXPIRY_DAYS: 365, // срок действия кода в днях
};

// Функция для генерации уникального реферального кода
export async function generateReferralCode(userId: string): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Генерируем код до тех пор, пока не найдем уникальный
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    code = '';
    for (let i = 0; i < REFERRAL_CONFIG.REFERRAL_CODE_LENGTH; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Проверяем уникальность
    const existing = await prisma.referralCode.findUnique({
      where: { code },
    });
    
    if (!existing) {
      break;
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  if (attempts >= maxAttempts) {
    throw new Error('Не удалось сгенерировать уникальный реферальный код');
  }
  
  return code;
}

// Функция для создания реферального кода для пользователя
export async function createReferralCode(userId: string): Promise<{
  success: boolean;
  code?: string;
  message: string;
}> {
  try {
    // Проверяем, есть ли уже код у пользователя
    const existingCode = await prisma.referralCode.findUnique({
      where: { userId },
    });
    
    if (existingCode && existingCode.isActive) {
      return {
        success: true,
        code: existingCode.code,
        message: 'У вас уже есть активный реферальный код',
      };
    }
    
    // Генерируем новый код
    const code = await generateReferralCode(userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFERRAL_CONFIG.REFERRAL_CODE_EXPIRY_DAYS);
    
    // Создаем или обновляем код
    const referralCode = await prisma.referralCode.upsert({
      where: { userId },
      update: {
        code,
        isActive: true,
        expiresAt,
        usedCount: 0,
      },
      create: {
        userId,
        code,
        isActive: true,
        expiresAt,
        maxUses: REFERRAL_CONFIG.MAX_REFERRALS_PER_USER,
      },
    });
    
    return {
      success: true,
      code: referralCode.code,
      message: 'Реферальный код создан успешно',
    };
  } catch (error) {
    console.error('Ошибка при создании реферального кода:', error);
    return {
      success: false,
      message: 'Ошибка при создании реферального кода',
    };
  }
}

// Функция для обработки реферальной регистрации
export async function processReferralRegistration(
  referredUserId: string,
  referralCode: string
): Promise<{
  success: boolean;
  message: string;
  referrerId?: string;
  rewards?: {
    referrerBones: number;
    referredBones: number;
    referrerExperience: number;
    referredExperience: number;
  };
}> {
  try {
    // Находим реферальный код
    const codeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { user: true },
    });
    
    if (!codeRecord) {
      return {
        success: false,
        message: 'Неверный реферальный код',
      };
    }
    
    if (!codeRecord.isActive) {
      return {
        success: false,
        message: 'Реферальный код неактивен',
      };
    }
    
    if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
      return {
        success: false,
        message: 'Реферальный код истек',
      };
    }
    
    if (codeRecord.maxUses && codeRecord.usedCount >= codeRecord.maxUses) {
      return {
        success: false,
        message: 'Достигнуто максимальное количество использований кода',
      };
    }
    
    // Проверяем, что пользователь не приглашает сам себя
    if (codeRecord.userId === referredUserId) {
      return {
        success: false,
        message: 'Нельзя использовать собственный реферальный код',
      };
    }
    
    // Проверяем, не был ли уже создан реферал между этими пользователями
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: codeRecord.userId,
        referredId: referredUserId,
      },
    });
    
    if (existingReferral) {
      return {
        success: false,
        message: 'Реферальная связь уже существует',
      };
    }
    
    // Создаем запись о реферале
    const referral = await prisma.referral.create({
      data: {
        referrerId: codeRecord.userId,
        referredId: referredUserId,
        codeId: codeRecord.id,
        status: 'COMPLETED',
        reward: REFERRAL_CONFIG.REFERRER_REWARD,
      },
    });
    
    // Обновляем счетчик использований кода
    await prisma.referralCode.update({
      where: { id: codeRecord.id },
      data: {
        usedCount: codeRecord.usedCount + 1,
      },
    });
    
    // Начисляем награды приглашающему
    await prisma.transaction.create({
      data: {
        userId: codeRecord.userId,
        type: 'EARN',
        currency: 'BONES',
        amount: REFERRAL_CONFIG.REFERRER_REWARD,
        description: `Награда за приглашение друга (${referralCode})`,
        metadata: JSON.stringify({
          referralId: referral.id,
          referredUserId,
          type: 'REFERRER_REWARD',
        }),
      },
    });
    
    // Начисляем опыт приглашающему
    await addExperience(codeRecord.userId, 'REFER_FRIEND', {
      referralId: referral.id,
      referredUserId,
    });
    
    // Начисляем награды приглашенному
    await prisma.transaction.create({
      data: {
        userId: referredUserId,
        type: 'EARN',
        currency: 'BONES',
        amount: REFERRAL_CONFIG.REFERRED_REWARD,
        description: `Бонус за регистрацию по реферальной ссылке`,
        metadata: JSON.stringify({
          referralId: referral.id,
          referrerId: codeRecord.userId,
          type: 'REFERRED_REWARD',
        }),
      },
    });
    
    // Начисляем опыт приглашенному
    await addExperience(referredUserId, 'BE_REFERRED', {
      referralId: referral.id,
      referrerId: codeRecord.userId,
    });
    
    // Создаем уведомления
    await Promise.all([
      // Уведомление приглашающему
      prisma.notification.create({
        data: {
          userId: codeRecord.userId,
          type: 'REFERRAL',
          title: 'Новый реферал!',
          message: `Поздравляем! Ваш друг зарегистрировался по вашей ссылке. Вы получили ${REFERRAL_CONFIG.REFERRER_REWARD} косточек!`,
        },
      }),
      // Уведомление приглашенному
      prisma.notification.create({
        data: {
          userId: referredUserId,
          type: 'REFERRAL',
          title: 'Добро пожаловать!',
          message: `Спасибо за регистрацию по реферальной ссылке! Вы получили ${REFERRAL_CONFIG.REFERRED_REWARD} косточек в подарок!`,
        },
      }),
    ]);
    
    return {
      success: true,
      message: 'Реферальная регистрация обработана успешно',
      referrerId: codeRecord.userId,
      rewards: {
        referrerBones: REFERRAL_CONFIG.REFERRER_REWARD,
        referredBones: REFERRAL_CONFIG.REFERRED_REWARD,
        referrerExperience: REFERRAL_CONFIG.REFERRER_EXPERIENCE,
        referredExperience: REFERRAL_CONFIG.REFERRED_EXPERIENCE,
      },
    };
  } catch (error) {
    console.error('Ошибка при обработке реферальной регистрации:', error);
    return {
      success: false,
      message: 'Ошибка при обработке реферальной регистрации',
    };
  }
}

// Функция для получения статистики рефералов пользователя
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  referralCode?: string;
  recentReferrals: any[];
}> {
  try {
    // Получаем реферальный код пользователя
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId },
    });
    
    // Получаем статистику рефералов
    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId },
    });
    
    const successfulReferrals = await prisma.referral.count({
      where: { 
        referrerId: userId,
        status: 'COMPLETED',
      },
    });
    
    const pendingReferrals = await prisma.referral.count({
      where: { 
        referrerId: userId,
        status: 'PENDING',
      },
    });
    
    // Получаем общую сумму наград
    const totalRewards = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EARN',
        currency: 'BONES',
        description: {
          contains: 'приглашение друга',
        },
      },
      _sum: {
        amount: true,
      },
    });
    
    // Получаем последние рефералы
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    
    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalRewards: totalRewards._sum.amount || 0,
      referralCode: referralCode?.code,
      recentReferrals: recentReferrals.map(r => ({
        id: r.id,
        status: r.status,
        reward: r.reward,
        createdAt: r.createdAt,
        referred: r.referred,
      })),
    };
  } catch (error) {
    console.error('Ошибка при получении статистики рефералов:', error);
    throw error;
  }
}

// Функция для получения реферальной ссылки
export function getReferralLink(code: string, baseUrl: string = 'https://dogymorbis.com'): string {
  return `${baseUrl}/register?ref=${code}`;
}

// Функция для валидации реферального кода
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  message: string;
  codeInfo?: any;
}> {
  try {
    const codeRecord = await prisma.referralCode.findUnique({
      where: { code },
      include: { user: true },
    });
    
    if (!codeRecord) {
      return {
        valid: false,
        message: 'Реферальный код не найден',
      };
    }
    
    if (!codeRecord.isActive) {
      return {
        valid: false,
        message: 'Реферальный код неактивен',
      };
    }
    
    if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
      return {
        valid: false,
        message: 'Реферальный код истек',
      };
    }
    
    if (codeRecord.maxUses && codeRecord.usedCount >= codeRecord.maxUses) {
      return {
        valid: false,
        message: 'Достигнуто максимальное количество использований',
      };
    }
    
    return {
      valid: true,
      message: 'Реферальный код действителен',
      codeInfo: {
        code: codeRecord.code,
        referrer: {
          username: codeRecord.user.username,
          firstName: codeRecord.user.firstName,
          lastName: codeRecord.user.lastName,
        },
        usedCount: codeRecord.usedCount,
        maxUses: codeRecord.maxUses,
        expiresAt: codeRecord.expiresAt,
      },
    };
  } catch (error) {
    console.error('Ошибка при валидации реферального кода:', error);
    return {
      valid: false,
      message: 'Ошибка при проверке кода',
    };
  }
}
