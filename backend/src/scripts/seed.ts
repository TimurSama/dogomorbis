import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем тестовых пользователей
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    // Аккаунт разработчиков
    prisma.user.upsert({
      where: { email: 'dev@dogymorbis.com' },
      update: {},
      create: {
        email: 'dev@dogymorbis.com',
        username: 'dogymorbis_dev',
        password: hashedPassword,
        firstName: 'Команда',
        lastName: 'Разработчиков',
        bio: 'Мы создаем лучшее приложение для владельцев собак! 🐕',
        isVerified: true,
        isActive: true,
        isPremium: true,
        psychotype: 'EXTROVERT',
        psychotypeTestCompleted: true,
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, офис Dogymorbis' }),
      },
    }),
    // Аккаунт компании
    prisma.user.upsert({
      where: { email: 'company@dogymorbis.com' },
      update: {},
      create: {
        email: 'company@dogymorbis.com',
        username: 'dogymorbis_official',
        password: hashedPassword,
        firstName: 'Dogymorbis',
        lastName: 'Official',
        bio: 'Официальный аккаунт Dogymorbis - социальной сети для владельцев собак! 🐾',
        isVerified: true,
        isActive: true,
        isPremium: true,
        psychotype: 'EXTROVERT',
        psychotypeTestCompleted: true,
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, штаб-квартира Dogymorbis' }),
      },
    }),
    // Админ аккаунт
    prisma.user.upsert({
      where: { email: 'admin@dogymorbis.com' },
      update: {},
      create: {
        email: 'admin@dogymorbis.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Админ',
        lastName: 'Админов',
        isVerified: true,
        isActive: true,
        psychotype: 'EXTROVERT',
        psychotypeTestCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'user1@dogymorbis.com' },
      update: {},
      create: {
        email: 'user1@dogymorbis.com',
        username: 'doglover1',
        password: hashedPassword,
        firstName: 'Анна',
        lastName: 'Петрова',
        isVerified: true,
        isActive: true,
        psychotype: 'EXTROVERT',
        psychotypeTestCompleted: true,
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, Красная площадь' }),
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@dogymorbis.com' },
      update: {},
      create: {
        email: 'user2@dogymorbis.com',
        username: 'puppyfriend',
        password: hashedPassword,
        firstName: 'Михаил',
        lastName: 'Сидоров',
        isVerified: true,
        isActive: true,
        psychotype: 'INTROVERT',
        psychotypeTestCompleted: true,
        location: JSON.stringify({ lat: 55.7658, lng: 37.6276, address: 'Москва, Арбат' }),
      },
    }),
    prisma.user.upsert({
      where: { email: 'partner@dogymorbis.com' },
      update: {},
      create: {
        email: 'partner@dogymorbis.com',
        username: 'vetclinic',
        password: hashedPassword,
        firstName: 'Елена',
        lastName: 'Ветеринарова',
        isVerified: true,
        isActive: true,
        psychotype: 'AMBIVERT',
        psychotypeTestCompleted: true,
      },
    }),
  ]);

  console.log('✅ Пользователи созданы');

  // Создаем уровни для пользователей
  await Promise.all(
    users.map(user =>
      prisma.level.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          level: Math.floor(Math.random() * 10) + 1,
          experience: Math.floor(Math.random() * 1000),
          tier: ['BRONZE', 'SILVER', 'GOLD'][Math.floor(Math.random() * 3)],
        },
      })
    )
  );

  console.log('✅ Уровни созданы');

  // Создаем профиль администратора
  await prisma.adminProfile.upsert({
    where: { userId: users[2].id },
    update: {},
    create: {
      userId: users[2].id,
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['users:read', 'users:write', 'partners:verify', 'system:stats']),
    },
  });

  console.log('✅ Профиль администратора создан');

  // Создаем профиль партнера
  await prisma.partnerProfile.upsert({
    where: { userId: users[4].id },
    update: {},
    create: {
      userId: users[4].id,
      category: 'VET',
      name: 'Ветеринарная клиника "Здоровые лапки"',
      description: 'Современная ветеринарная клиника с полным спектром услуг для собак',
      website: 'https://healthy-paws.ru',
      location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, ул. Ветеринарная, 1' }),
      contact: JSON.stringify({
        phone: '+7 (495) 123-45-67',
        email: 'info@healthy-paws.ru',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
      }),
      isVerified: true,
    },
  });

  console.log('✅ Профиль партнера создан');

  // Создаем тестовых собак
  const dogs = await Promise.all([
    prisma.dog.create({
      data: {
        name: 'Бобик',
        breed: 'Лабрадор',
        gender: 'MALE',
        dateOfBirth: new Date('2020-05-15'),
        weight: 25.5,
        height: 55,
        color: 'Золотистый',
        temperament: 'FRIENDLY,PLAYFUL,ENERGETIC',
        energyLevel: 'HIGH',
        sociability: 'VERY_SOCIAL',
        trainability: 'EASY',
        isNeutered: false,
        isVaccinated: true,
        isFriendly: true,
      },
    }),
    prisma.dog.create({
      data: {
        name: 'Мурка',
        breed: 'Хаски',
        gender: 'FEMALE',
        dateOfBirth: new Date('2019-03-20'),
        weight: 22.0,
        height: 50,
        color: 'Серо-белый',
        temperament: 'INDEPENDENT,ENERGETIC',
        energyLevel: 'VERY_HIGH',
        sociability: 'SOCIAL',
        trainability: 'MODERATE',
        isNeutered: true,
        isVaccinated: true,
        isFriendly: true,
      },
    }),
    prisma.dog.create({
      data: {
        name: 'Рекс',
        breed: 'Немецкая овчарка',
        gender: 'MALE',
        dateOfBirth: new Date('2021-08-10'),
        weight: 30.0,
        height: 60,
        color: 'Черно-коричневый',
        temperament: 'CALM,INDEPENDENT',
        energyLevel: 'MEDIUM',
        sociability: 'MODERATE',
        trainability: 'EASY',
        isNeutered: false,
        isVaccinated: true,
        isFriendly: true,
      },
    }),
  ]);

  console.log('✅ Собаки созданы');

  // Создаем связи владения
  await Promise.all([
    prisma.dogOwnership.create({
      data: {
        userId: users[1].id,
        dogId: dogs[0].id,
        role: 'PRIMARY',
      },
    }),
    prisma.dogOwnership.create({
      data: {
        userId: users[2].id,
        dogId: dogs[1].id,
        role: 'PRIMARY',
      },
    }),
    prisma.dogOwnership.create({
      data: {
        userId: users[1].id,
        dogId: dogs[2].id,
        role: 'PRIMARY',
      },
    }),
  ]);

  console.log('✅ Связи владения созданы');

  // Создаем фотографии собак
  await Promise.all([
    prisma.dogPhoto.create({
      data: {
        dogId: dogs[0].id,
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        caption: 'Бобик в парке',
        isPrimary: true,
      },
    }),
    prisma.dogPhoto.create({
      data: {
        dogId: dogs[1].id,
        url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
        caption: 'Мурка на прогулке',
        isPrimary: true,
      },
    }),
    prisma.dogPhoto.create({
      data: {
        dogId: dogs[2].id,
        url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400',
        caption: 'Рекс на тренировке',
        isPrimary: true,
      },
    }),
  ]);

  console.log('✅ Фотографии собак созданы');

  // Создаем посты от имени аккаунтов
  const posts = await Promise.all([
    // Пост от команды разработчиков
    prisma.post.create({
      data: {
        userId: users[0].id, // dev@dogymorbis.com
        content: '🚀 Добро пожаловать в Dogymorbis! Мы рады представить вам новую социальную сеть для владельцев собак. Здесь вы можете найти друзей для прогулок, поделиться историями о своих питомцах и зарабатывать косточки за активность! 🐕✨',
        images: JSON.stringify(['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400']),
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, офис Dogymorbis' }),
        isPublic: true,
      },
    }),
    // Пост от официального аккаунта компании
    prisma.post.create({
      data: {
        userId: users[1].id, // company@dogymorbis.com
        content: '🎉 Приветствуем всех новых пользователей! Мы создали Dogymorbis специально для вас - владельцев собак. Присоединяйтесь к нашей дружной команде, приглашайте друзей и получайте бонусы за рефералов! 🐾💝',
        images: JSON.stringify(['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400']),
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, штаб-квартира Dogymorbis' }),
        isPublic: true,
      },
    }),
    // Пост от команды разработчиков о реферальной программе
    prisma.post.create({
      data: {
        userId: users[0].id, // dev@dogymorbis.com
        content: '🎁 Реферальная программа запущена! Приглашайте друзей и получайте 100 косточек за каждого нового пользователя. Ваш друг тоже получит 50 косточек за регистрацию по вашей ссылке! Поделитесь своим реферальным кодом в профиле 🐕💰',
        images: JSON.stringify(['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400']),
        isPublic: true,
      },
    }),
    // Пост от официального аккаунта о косточкономике
    prisma.post.create({
      data: {
        userId: users[1].id, // company@dogymorbis.com
        content: '🦴 Косточкономика в действии! Собирайте косточки на карте, зарабатывайте за активность и тратьте в магазине на полезные товары для ваших питомцев. Каждый день появляются новые косточки в разных местах города! 🗺️✨',
        images: JSON.stringify(['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400']),
        isPublic: true,
      },
    }),
    // Пользовательские посты
    prisma.post.create({
      data: {
        userId: users[3].id,
        dogId: dogs[0].id,
        content: 'Сегодня отличная прогулка с Бобиком! Он так радовался новому мячику 🎾',
        images: JSON.stringify(['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400']),
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Парк Горького' }),
        isPublic: true,
      },
    }),
    prisma.post.create({
      data: {
        userId: users[4].id,
        dogId: dogs[1].id,
        content: 'Мурка освоила новую команду "сидеть"! Горжусь своей умницей 🐕',
        images: JSON.stringify(['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400']),
        isPublic: true,
      },
    }),
  ]);

  console.log('✅ Посты созданы');

  // Создаем тестовые транзакции
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        type: 'EARN',
        currency: 'BONES',
        amount: 50,
        description: 'Регистрация в приложении',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        type: 'EARN',
        currency: 'BONES',
        amount: 25,
        description: 'Добавление профиля собаки',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        type: 'EARN',
        currency: 'BONES',
        amount: 5,
        description: 'Создание поста',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[2].id,
        type: 'EARN',
        currency: 'BONES',
        amount: 50,
        description: 'Регистрация в приложении',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[2].id,
        type: 'EARN',
        currency: 'BONES',
        amount: 25,
        description: 'Добавление профиля собаки',
      },
    }),
  ]);

  console.log('✅ Транзакции созданы');

  // Создаем тестовые коллекционные предметы
  await Promise.all([
    prisma.collectibleSpawn.create({
      data: {
        type: 'BONE',
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176 }),
        value: 10,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
      },
    }),
    prisma.collectibleSpawn.create({
      data: {
        type: 'YARN_BALL',
        location: JSON.stringify({ lat: 55.7658, lng: 37.6276 }),
        value: 5,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
      },
    }),
  ]);

  console.log('✅ Коллекционные предметы созданы');

  // Создаем тестовые услуги
  const services = await Promise.all([
    prisma.service.create({
      data: {
        partnerId: (await prisma.partnerProfile.findUnique({ where: { userId: users[3].id } }))!.id,
        category: 'VET',
        title: 'Профилактический осмотр',
        description: 'Полный осмотр собаки, проверка здоровья, консультация ветеринара',
        price: 2000,
        duration: 60,
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, ул. Ветеринарная, 1' }),
      },
    }),
    prisma.service.create({
      data: {
        partnerId: (await prisma.partnerProfile.findUnique({ where: { userId: users[3].id } }))!.id,
        category: 'GROOMING',
        title: 'Стрижка и мытье',
        description: 'Полный груминг: стрижка, мытье, сушка, стрижка когтей',
        price: 1500,
        duration: 90,
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Москва, ул. Ветеринарная, 1' }),
      },
    }),
  ]);

  console.log('✅ Услуги созданы');

  // Создаем тестовые записи в журнале
  await Promise.all([
    prisma.journalEntry.create({
      data: {
        userId: users[1].id,
        dogId: dogs[0].id,
        mood: 'HAPPY',
        activity: 'WALK',
        content: 'Отличная прогулка в парке! Бобик был очень активным и веселым.',
        location: JSON.stringify({ lat: 55.7558, lng: 37.6176, address: 'Парк Горького' }),
      },
    }),
    prisma.journalEntry.create({
      data: {
        userId: users[2].id,
        dogId: dogs[1].id,
        mood: 'EXCITED',
        activity: 'TRAINING',
        content: 'Мурка выучила новую команду! Очень горжусь прогрессом.',
      },
    }),
  ]);

  console.log('✅ Записи в журнале созданы');

  // Создаем тестовые цели
  await Promise.all([
    prisma.goal.create({
      data: {
        userId: users[1].id,
        dogId: dogs[0].id,
        type: 'WALKING',
        title: 'Ежедневные прогулки',
        description: 'Гулять с Бобиком каждый день минимум 30 минут',
        target: 30,
        current: 15,
        unit: 'минут в день',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    }),
    prisma.goal.create({
      data: {
        userId: users[2].id,
        dogId: dogs[1].id,
        type: 'TRAINING',
        title: 'Изучение команд',
        description: 'Выучить 5 новых команд с Муркой',
        target: 5,
        current: 2,
        unit: 'команд',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 дней
      },
    }),
  ]);

  console.log('✅ Цели созданы');

  // Создаем тестовые достижения
  await Promise.all([
    prisma.achievement.create({
      data: {
        userId: users[1].id,
        type: 'WALKING',
        title: 'Первая прогулка',
        description: 'Совершили первую прогулку с собакой',
        icon: '🚶‍♂️',
        earnedAt: new Date(),
      },
    }),
    prisma.achievement.create({
      data: {
        userId: users[2].id,
        type: 'TRAINING',
        title: 'Ученик',
        description: 'Выучили первую команду',
        icon: '🎓',
        earnedAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Достижения созданы');

  // Создаем приветственные сообщения от аккаунтов
  await Promise.all([
    // Сообщение от команды разработчиков
    prisma.message.create({
      data: {
        fromUserId: users[0].id, // dev@dogymorbis.com
        toUserId: users[3].id, // user1
        type: 'TEXT',
        content: 'Привет! Добро пожаловать в Dogymorbis! 🐕 Мы рады, что вы присоединились к нашему сообществу. Не забудьте пригласить друзей - за каждого нового пользователя вы получите 100 косточек! Удачи в изучении приложения! 🚀',
      },
    }),
    prisma.message.create({
      data: {
        fromUserId: users[0].id, // dev@dogymorbis.com
        toUserId: users[4].id, // user2
        type: 'TEXT',
        content: 'Привет! Добро пожаловать в Dogymorbis! 🐕 Мы рады, что вы присоединились к нашему сообществу. Не забудьте пригласить друзей - за каждого нового пользователя вы получите 100 косточек! Удачи в изучении приложения! 🚀',
      },
    }),
    // Сообщение от официального аккаунта
    prisma.message.create({
      data: {
        fromUserId: users[1].id, // company@dogymorbis.com
        toUserId: users[3].id, // user1
        type: 'TEXT',
        content: 'Добро пожаловать в семью Dogymorbis! 🎉 Мы создали это приложение специально для таких заботливых владельцев собак, как вы. Изучайте карту, собирайте косточки, общайтесь с другими собачниками и получайте удовольствие! 🐾✨',
      },
    }),
    prisma.message.create({
      data: {
        fromUserId: users[1].id, // company@dogymorbis.com
        toUserId: users[4].id, // user2
        type: 'TEXT',
        content: 'Добро пожаловать в семью Dogymorbis! 🎉 Мы создали это приложение специально для таких заботливых владельцев собак, как вы. Изучайте карту, собирайте косточки, общайтесь с другими собачниками и получайте удовольствие! 🐾✨',
      },
    }),
  ]);

  // Создаем тестовые уведомления
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[3].id,
        type: 'SYSTEM',
        title: 'Добро пожаловать в Dogymorbis!',
        message: 'Добро пожаловать в Dogymorbis! Начните с добавления профиля вашей собаки и получите 50 косточек!',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: 'SYSTEM',
        title: 'Добро пожаловать в Dogymorbis!',
        message: 'Добро пожаловать в Dogymorbis! Начните с добавления профиля вашей собаки и получите 50 косточек!',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[3].id,
        type: 'ACHIEVEMENT',
        title: 'Новое достижение!',
        message: 'Поздравляем! Вы получили достижение "Первая прогулка"',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: 'ACHIEVEMENT',
        title: 'Новое достижение!',
        message: 'Поздравляем! Вы получили достижение "Ученик"',
      },
    }),
    // Уведомления о реферальной программе
    prisma.notification.create({
      data: {
        userId: users[3].id,
        type: 'REFERRAL',
        title: 'Реферальная программа',
        message: 'Пригласите друзей и получите 100 косточек за каждого нового пользователя! Поделитесь своим реферальным кодом.',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: 'REFERRAL',
        title: 'Реферальная программа',
        message: 'Пригласите друзей и получите 100 косточек за каждого нового пользователя! Поделитесь своим реферальным кодом.',
      },
    }),
  ]);

  console.log('✅ Уведомления созданы');

  console.log('🎉 Заполнение базы данных завершено!');
  console.log('\n📋 Созданные тестовые данные:');
  console.log(`👥 Пользователи: ${users.length}`);
  console.log(`🐕 Собаки: ${dogs.length}`);
  console.log(`📝 Посты: ${posts.length}`);
  console.log(`🏥 Услуги: ${services.length}`);
  console.log('\n🔑 Тестовые аккаунты:');
  console.log('dev@dogymorbis.com / password123 (Команда разработчиков)');
  console.log('company@dogymorbis.com / password123 (Официальный аккаунт Dogymorbis)');
  console.log('admin@dogymorbis.com / password123 (Администратор)');
  console.log('user1@dogymorbis.com / password123 (Владелец Бобика)');
  console.log('user2@dogymorbis.com / password123 (Владелец Мурки)');
  console.log('partner@dogymorbis.com / password123 (Ветеринарная клиника)');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

