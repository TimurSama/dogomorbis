import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Типы косточек и их характеристики
export interface BoneSpawnConfig {
  type: 'BONE' | 'YARN_BALL' | 'TREAT' | 'TOY' | 'GOLDEN_BONE';
  value: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  spawnChance: number; // 0-1
  maxSpawns: number;
  respawnTime: number; // в минутах
  radius: number; // радиус в метрах для проверки близости
}

// Конфигурация косточек
export const BONE_CONFIGS: Record<string, BoneSpawnConfig> = {
  BONE: {
    type: 'BONE',
    value: 5,
    rarity: 'COMMON',
    spawnChance: 0.7,
    maxSpawns: 50,
    respawnTime: 30,
    radius: 100,
  },
  YARN_BALL: {
    type: 'YARN_BALL',
    value: 3,
    rarity: 'COMMON',
    spawnChance: 0.8,
    maxSpawns: 80,
    respawnTime: 20,
    radius: 80,
  },
  TREAT: {
    type: 'TREAT',
    value: 10,
    rarity: 'UNCOMMON',
    spawnChance: 0.4,
    maxSpawns: 30,
    respawnTime: 60,
    radius: 120,
  },
  TOY: {
    type: 'TOY',
    value: 15,
    rarity: 'RARE',
    spawnChance: 0.2,
    maxSpawns: 15,
    respawnTime: 120,
    radius: 150,
  },
  GOLDEN_BONE: {
    type: 'GOLDEN_BONE',
    value: 50,
    rarity: 'LEGENDARY',
    spawnChance: 0.05,
    maxSpawns: 5,
    respawnTime: 480, // 8 часов
    radius: 200,
  },
};

// Популярные места для спавна косточек в Москве
export const MOSCOW_SPAWN_LOCATIONS = [
  { name: 'Парк Горького', lat: 55.7314, lng: 37.6006, weight: 0.15 },
  { name: 'Сокольники', lat: 55.7944, lng: 37.6792, weight: 0.12 },
  { name: 'ВДНХ', lat: 55.8270, lng: 37.6390, weight: 0.10 },
  { name: 'Коломенское', lat: 55.6670, lng: 37.6700, weight: 0.08 },
  { name: 'Царицыно', lat: 55.6150, lng: 37.6810, weight: 0.08 },
  { name: 'Измайловский парк', lat: 55.7890, lng: 37.7800, weight: 0.07 },
  { name: 'Битцевский парк', lat: 55.6000, lng: 37.5500, weight: 0.06 },
  { name: 'Кузьминки', lat: 55.6900, lng: 37.7800, weight: 0.05 },
  { name: 'Лосиный остров', lat: 55.8500, lng: 37.8500, weight: 0.04 },
  { name: 'Серебряный бор', lat: 55.7800, lng: 37.4500, weight: 0.03 },
  // Центральные районы
  { name: 'Красная площадь', lat: 55.7539, lng: 37.6208, weight: 0.05 },
  { name: 'Арбат', lat: 55.7520, lng: 37.5925, weight: 0.04 },
  { name: 'Тверская', lat: 55.7616, lng: 37.6065, weight: 0.03 },
  { name: 'Китай-город', lat: 55.7558, lng: 37.6176, weight: 0.03 },
  { name: 'Замоскворечье', lat: 55.7400, lng: 37.6200, weight: 0.02 },
];

// Функция для генерации случайной точки в радиусе от центра
function generateRandomPointInRadius(centerLat: number, centerLng: number, radiusMeters: number) {
  const earthRadius = 6371000; // радиус Земли в метрах
  const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(centerLat * Math.PI / 180);
  
  const randomLat = centerLat + (Math.random() - 0.5) * latDelta * 2;
  const randomLng = centerLng + (Math.random() - 0.5) * lngDelta * 2;
  
  return {
    lat: Math.round(randomLat * 1000000) / 1000000, // округляем до 6 знаков
    lng: Math.round(randomLng * 1000000) / 1000000,
  };
}

// Функция для проверки, не слишком ли близко косточка к существующим
async function isLocationAvailable(lat: number, lng: number, radius: number): Promise<boolean> {
  const existingSpawns = await prisma.collectibleSpawn.findMany({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  for (const spawn of existingSpawns) {
    const location = JSON.parse(spawn.location);
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    if (distance < radius) {
      return false;
    }
  }

  return true;
}

// Функция для расчета расстояния между двумя точками
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // радиус Земли в метрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Основная функция генерации косточек
export async function generateBoneSpawns(): Promise<void> {
  console.log('🦴 Начинаем генерацию косточек...');

  // Очищаем истекшие косточки
  await prisma.collectibleSpawn.updateMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      isActive: false,
    },
  });

  // Генерируем косточки для каждого типа
  for (const [type, config] of Object.entries(BONE_CONFIGS)) {
    const currentSpawns = await prisma.collectibleSpawn.count({
      where: {
        type: config.type,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const neededSpawns = Math.max(0, config.maxSpawns - currentSpawns);
    
    if (neededSpawns === 0) {
      console.log(`✅ ${type}: достаточно косточек (${currentSpawns}/${config.maxSpawns})`);
      continue;
    }

    let generated = 0;
    let attempts = 0;
    const maxAttempts = neededSpawns * 10; // максимум попыток

    while (generated < neededSpawns && attempts < maxAttempts) {
      attempts++;

      // Выбираем случайное место с учетом весов
      const totalWeight = MOSCOW_SPAWN_LOCATIONS.reduce((sum, loc) => sum + loc.weight, 0);
      let randomWeight = Math.random() * totalWeight;
      let selectedLocation = MOSCOW_SPAWN_LOCATIONS[0];

      for (const location of MOSCOW_SPAWN_LOCATIONS) {
        randomWeight -= location.weight;
        if (randomWeight <= 0) {
          selectedLocation = location;
          break;
        }
      }

      // Генерируем случайную точку в радиусе 500 метров от выбранного места
      const spawnPoint = generateRandomPointInRadius(
        selectedLocation.lat,
        selectedLocation.lng,
        500
      );

      // Проверяем доступность места
      if (await isLocationAvailable(spawnPoint.lat, spawnPoint.lng, config.radius)) {
        // Проверяем шанс спавна
        if (Math.random() <= config.spawnChance) {
          const expiresAt = new Date(Date.now() + config.respawnTime * 60 * 1000);

          await prisma.collectibleSpawn.create({
            data: {
              type: config.type,
              location: JSON.stringify(spawnPoint),
              value: config.value,
              isActive: true,
              expiresAt,
            },
          });

          generated++;
          console.log(`🦴 Создана ${type} в ${selectedLocation.name} (${spawnPoint.lat.toFixed(6)}, ${spawnPoint.lng.toFixed(6)})`);
        }
      }
    }

    console.log(`✅ ${type}: создано ${generated} косточек (всего ${currentSpawns + generated}/${config.maxSpawns})`);
  }

  console.log('🎉 Генерация косточек завершена!');
}

// Функция для сбора косточки пользователем
export async function collectBone(
  userId: string,
  dogId: string | null,
  spawnId: string
): Promise<{ success: boolean; message: string; bonesEarned?: number }> {
  try {
    // Проверяем существование косточки
    const spawn = await prisma.collectibleSpawn.findUnique({
      where: { id: spawnId },
    });

    if (!spawn) {
      return { success: false, message: 'Косточка не найдена' };
    }

    if (!spawn.isActive) {
      return { success: false, message: 'Косточка уже собрана' };
    }

    if (spawn.expiresAt && spawn.expiresAt < new Date()) {
      return { success: false, message: 'Косточка истекла' };
    }

    // Проверяем, не собирал ли пользователь эту косточку
    const existingCollection = await prisma.collectibleCollection.findFirst({
      where: {
        userId,
        spawnId,
      },
    });

    if (existingCollection) {
      return { success: false, message: 'Вы уже собирали эту косточку' };
    }

    // Создаем запись о сборе
    await prisma.collectibleCollection.create({
      data: {
        userId,
        dogId,
        spawnId,
      },
    });

    // Создаем транзакцию
    await prisma.transaction.create({
      data: {
        userId,
        type: 'EARN',
        currency: 'BONES',
        amount: spawn.value,
        description: `Собрана косточка ${spawn.type}`,
        metadata: JSON.stringify({
          spawnId,
          spawnType: spawn.type,
          location: spawn.location,
        }),
      },
    });

    // Деактивируем косточку
    await prisma.collectibleSpawn.update({
      where: { id: spawnId },
      data: { isActive: false },
    });

    // Проверяем и выдаем достижения
    await checkCollectionAchievements(userId);

    return {
      success: true,
      message: `Вы собрали ${spawn.type} и получили ${spawn.value} косточек!`,
      bonesEarned: spawn.value,
    };
  } catch (error) {
    console.error('Ошибка при сборе косточки:', error);
    return { success: false, message: 'Произошла ошибка при сборе косточки' };
  }
}

// Функция для проверки достижений по сбору косточек
async function checkCollectionAchievements(userId: string): Promise<void> {
  const collections = await prisma.collectibleCollection.count({
    where: { userId },
  });

  const achievements = [
    { count: 1, title: 'Первая косточка', description: 'Собрали первую косточку', icon: '🦴' },
    { count: 10, title: 'Коллекционер', description: 'Собрали 10 косточек', icon: '📦' },
    { count: 50, title: 'Охотник за косточками', description: 'Собрали 50 косточек', icon: '🎯' },
    { count: 100, title: 'Мастер сбора', description: 'Собрали 100 косточек', icon: '🏆' },
    { count: 500, title: 'Легенда косточек', description: 'Собрали 500 косточек', icon: '👑' },
  ];

  for (const achievement of achievements) {
    if (collections === achievement.count) {
      // Проверяем, не получено ли уже это достижение
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          userId,
          title: achievement.title,
        },
      });

      if (!existingAchievement) {
        await prisma.achievement.create({
          data: {
            userId,
            type: 'COLLECTION',
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
          },
        });

        // Создаем уведомление
        await prisma.notification.create({
          data: {
            userId,
            type: 'ACHIEVEMENT',
            title: 'Новое достижение!',
            message: `Поздравляем! Вы получили достижение "${achievement.title}"`,
          },
        });
      }
    }
  }
}

// Функция для получения косточек в радиусе от пользователя
export async function getNearbyBones(
  lat: number,
  lng: number,
  radiusMeters: number = 1000
): Promise<any[]> {
  const spawns = await prisma.collectibleSpawn.findMany({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  const nearbyBones = spawns.filter(spawn => {
    const location = JSON.parse(spawn.location);
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    return distance <= radiusMeters;
  });

  return nearbyBones.map(spawn => ({
    id: spawn.id,
    type: spawn.type,
    location: JSON.parse(spawn.location),
    value: spawn.value,
    expiresAt: spawn.expiresAt,
    config: BONE_CONFIGS[spawn.type],
  }));
}

// Функция для запуска периодической генерации косточек
export function startBoneGenerationScheduler(): void {
  // Генерируем косточки сразу при запуске
  generateBoneSpawns();

  // Затем каждые 15 минут
  setInterval(() => {
    generateBoneSpawns();
  }, 15 * 60 * 1000);

  console.log('⏰ Планировщик генерации косточек запущен (каждые 15 минут)');
}
