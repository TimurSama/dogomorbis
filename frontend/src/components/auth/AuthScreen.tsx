'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { DogIcon, HeartIcon, MapIcon, UsersIcon, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onBackToGuest?: () => void;
}

export function AuthScreen({ onBackToGuest }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: <DogIcon className="w-6 h-6" />,
      title: 'Профили собак',
      description: 'Создавайте профили для ваших питомцев с подробной информацией',
    },
    {
      icon: <MapIcon className="w-6 h-6" />,
      title: 'Интерактивная карта',
      description: 'Находите места для прогулок и других владельцев собак поблизости',
    },
    {
      icon: <UsersIcon className="w-6 h-6" />,
      title: 'Социальная сеть',
      description: 'Общайтесь с другими владельцами, делитесь фото и историями',
    },
    {
      icon: <HeartIcon className="w-6 h-6" />,
      title: 'Геймификация',
      description: 'Зарабатывайте косточки и клубки за активность и достижения',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Левая панель с информацией */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-8 text-white">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">🐕 Dogymorbis</h1>
            <p className="text-xl text-blue-100">
              Социальная сеть для владельцев собак
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая панель с формой */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Кнопка назад */}
        {onBackToGuest && (
          <div className="p-4">
            <button
              onClick={onBackToGuest}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад к гостевому режиму</span>
            </button>
          </div>
        )}

        {/* Форма */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Добро пожаловать!' : 'Присоединяйтесь к нам'}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Войдите в свой аккаунт' 
                  : 'Создайте аккаунт и начните общение с другими собачниками'
                }
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}