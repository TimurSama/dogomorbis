'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(8, 'Пароль должен содержать минимум 8 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      clearError();
      
      await login(data.email, data.password);
      
      toast.success('Успешный вход!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      toast.error(errorMessage);
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
      {/* Email поле */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
              errors.email ? 'border-error-500' : 'border-gray-300'
            }`}
            placeholder="Введите ваш email"
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-error-600 text-error-400 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email.message}
          </motion.p>
        )}
      </div>

      {/* Пароль поле */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
          Пароль
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
              errors.password ? 'border-error-500' : 'border-gray-300'
            }`}
            placeholder="Введите ваш пароль"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-error-600 text-error-400 flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.password.message}
          </motion.p>
        )}
      </div>

      {/* Запомнить меня и забыли пароль */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 text-gray-300">
            Запомнить меня
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            className="text-primary-600 text-primary-400 hover:text-primary-500 hover:text-primary-300 font-medium"
          >
            Забыли пароль?
          </button>
        </div>
      </div>

      {/* Кнопка входа */}
      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        size="lg"
        variant="default"
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>

      {/* Ошибка от сервера */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-50 bg-error-900/20 border border-error-200 border-error-800 rounded-lg p-4"
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-sm text-error-800 text-error-200">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Демо аккаунт */}
      <div className="mt-6 p-4 bg-gray-50 bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 text-gray-400 mb-2">
          Для демонстрации используйте:
        </p>
        <div className="text-xs space-y-1">
          <p><strong>Email:</strong> demo@dogymorbis.com</p>
          <p><strong>Пароль:</strong> demo123</p>
        </div>
      </div>
    </motion.form>
  );
} 