'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

// Схема валидации для регистрации
const registerSchema = z.object({
  email: z.string().min(1, 'Email обязателен').email('Неверный формат email'),
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа').max(30, 'Имя пользователя не должно превышать 30 символов'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать буквы и цифры'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя не должно превышать 50 символов'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').max(50, 'Фамилия не должна превышать 50 символов'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      clearError();

      // Удаляем confirmPassword из данных
      const { confirmPassword, ...registerData } = data;

      await registerUser(registerData);
      
      toast.success('Регистрация прошла успешно!');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-white">Создать аккаунт</h2>
        <p className="text-gray-600 text-gray-400 mt-2">
          Присоединяйтесь к сообществу собачников
        </p>
      </div>

      {/* Имя и Фамилия */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
            Имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
              placeholder="Ваше имя"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
            Фамилия
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
              placeholder="Ваша фамилия"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
            placeholder="your@email.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Имя пользователя */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Имя пользователя
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            {...register('username')}
            type="text"
            id="username"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
            placeholder="username"
          />
        </div>
        {errors.username && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Пароль */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
            placeholder="Минимум 8 символов"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Подтверждение пароля */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Подтвердите пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
            placeholder="Повторите пароль"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Дополнительные поля */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
            Телефон (необязательно)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
            Дата рождения (необязательно)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register('dateOfBirth')}
              type="date"
              id="dateOfBirth"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-800 text-white"
            />
          </div>
        </div>
      </div>

      {/* Кнопка регистрации */}
      <Button
        type="submit"
        loading={isLoading}
        fullWidth
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
      </Button>

      {/* Ошибка сервера */}
      {error && (
        <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-4">
          <p className="text-red-600 text-red-400 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Условия использования */}
      <p className="text-xs text-gray-500 text-gray-400 text-center">
        Регистрируясь, вы соглашаетесь с{' '}
        <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
          условиями использования
        </a>{' '}
        и{' '}
        <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
          политикой конфиденциальности
        </a>
      </p>
    </motion.form>
  );
} 