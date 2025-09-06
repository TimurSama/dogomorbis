'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, 
  Settings, 
  Camera, 
  Plus, 
  Heart, 
  Award, 
  MapPin, 
  Calendar,
  User,
  Dog,
  Crown,
  Star,
  Share,
  LogOut,
  Save,
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { toast } from 'react-hot-toast';

interface ProfileScreenProps {
  isGuest?: boolean;
  onShowAuth?: () => void;
}

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  character: string;
  walkGoals: string[];
  photos: string[];
}

export function ProfileScreen({ isGuest = false, onShowAuth }: ProfileScreenProps) {
  const { user, logout } = useAuthStore();
  const { profile, dogs, fetchProfile, fetchDogs } = useUserStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'dogs' | 'achievements'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Форма профиля
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    psychotype: '',
    avatar: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    interests: [] as string[],
    walkPreferences: [] as string[],
  });

  // Форма собаки
  const [dogForm, setDogForm] = useState<DogProfile>({
    id: '',
    name: '',
    breed: '',
    age: 0,
    gender: 'male',
    character: '',
    walkGoals: [],
    photos: [],
  });

  const [showDogForm, setShowDogForm] = useState(false);

  const interests = [
    'Активные прогулки', 'Спокойные прогулки', 'Дрессировка', 'Игры с мячом',
    'Плавание', 'Бег', 'Велосипед', 'Походы', 'Социализация', 'Тренировки'
  ];

  const walkPreferences = [
    'Утром', 'Днем', 'Вечером', 'Выходные', 'Будни', 'В любую погоду',
    'Только в хорошую погоду', 'В парке', 'В лесу', 'Во дворе'
  ];

  const psychotypes = [
    'Экстраверт', 'Интроверт', 'Амбиверт', 'Сангвиник', 'Холерик', 'Флегматик', 'Меланхолик'
  ];

  const dogBreeds = [
    'Лабрадор', 'Золотистый ретривер', 'Немецкая овчарка', 'Бульдог', 'Пудель',
    'Бигль', 'Ротвейлер', 'Йоркширский терьер', 'Чихуахуа', 'Хаски', 'Другое'
  ];

  const walkGoals = [
    'Социализация', 'Физическая активность', 'Дрессировка', 'Игры', 'Прогулка',
    'Тренировка команд', 'Знакомство с другими собаками', 'Исследование новых мест'
  ];

  useEffect(() => {
    if (!isGuest) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          await Promise.all([fetchProfile(), fetchDogs()]);
        } catch (error) {
          toast.error('Ошибка загрузки профиля');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile, fetchDogs, isGuest]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'interests' | 'walkPreferences', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleDogInputChange = (field: string, value: any) => {
    setDogForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDogArrayToggle = (field: 'walkGoals', value: string) => {
    setDogForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSaveProfile = () => {
    // Здесь будет логика сохранения профиля
    toast.success('Профиль сохранен!');
    setIsEditing(false);
  };

  const handleSaveDog = () => {
    // Здесь будет логика сохранения собаки
    toast.success('Профиль собаки сохранен!');
    setShowDogForm(false);
    setDogForm({
      id: '',
      name: '',
      breed: '',
      age: 0,
      gender: 'male',
      character: '',
      walkGoals: [],
      photos: [],
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы успешно вышли из системы');
    } catch (error) {
      toast.error('Ошибка при выходе из системы');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-700 font-display">Профиль</h1>
          <div className="flex items-center space-x-2">
            {!isGuest && (
              <>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        {isGuest ? (
          /* Гостевой режим - форма регистрации */
          <div className="p-4 space-y-6">
            <div className="bg-white bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-white mb-2">
                  Создайте профиль
                </h2>
                <p className="text-gray-600 text-gray-400 mb-6">
                  Заполните информацию о себе и своих собаках
                </p>
              </div>

              {/* Личная информация */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                    Личная информация
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Имя *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                        placeholder="Введите ваше имя"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Фамилия *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                        placeholder="Введите вашу фамилию"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Имя пользователя *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                        placeholder="Выберите имя пользователя"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                        Дата рождения
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                      Биография
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                      Местоположение
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                      placeholder="Город, район"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                      Психотип
                    </label>
                    <select
                      value={formData.psychotype}
                      onChange={(e) => handleInputChange('psychotype', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                    >
                      <option value="">Выберите психотип</option>
                      {psychotypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Интересы */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                    Ваши интересы
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleArrayToggle('interests', interest)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.interests.includes(interest)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Предпочтения прогулок */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                    Предпочтения прогулок
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {walkPreferences.map((pref) => (
                      <button
                        key={pref}
                        onClick={() => handleArrayToggle('walkPreferences', pref)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.walkPreferences.includes(pref)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Собаки */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-white">
                      Мои собаки
                    </h3>
                    <Button
                      onClick={() => setShowDogForm(true)}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить собаку
                    </Button>
                  </div>
                  
                  {showDogForm && (
                    <div className="bg-gray-50 bg-gray-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900 text-white">
                          Добавить собаку
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDogForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Имя собаки *
                          </label>
                          <input
                            type="text"
                            value={dogForm.name}
                            onChange={(e) => handleDogInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="Имя вашей собаки"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Порода *
                          </label>
                          <select
                            value={dogForm.breed}
                            onChange={(e) => handleDogInputChange('breed', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                          >
                            <option value="">Выберите породу</option>
                            {dogBreeds.map((breed) => (
                              <option key={breed} value={breed}>{breed}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Возраст
                          </label>
                          <input
                            type="number"
                            value={dogForm.age}
                            onChange={(e) => handleDogInputChange('age', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="Возраст в годах"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Пол
                          </label>
                          <select
                            value={dogForm.gender}
                            onChange={(e) => handleDogInputChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                          >
                            <option value="male">Кобель</option>
                            <option value="female">Сука</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                          Характер
                        </label>
                        <textarea
                          value={dogForm.character}
                          onChange={(e) => handleDogInputChange('character', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                          placeholder="Опишите характер собаки..."
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                          Цели прогулок
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {walkGoals.map((goal) => (
                            <button
                              key={goal}
                              onClick={() => handleDogArrayToggle('walkGoals', goal)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                dogForm.walkGoals.includes(goal)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
                              }`}
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowDogForm(false)}
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleSaveDog}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Кнопка регистрации */}
                <div className="text-center pt-6">
                  <Button
                    onClick={onShowAuth}
                    className="bg-primary-600 hover:bg-primary-700 px-8 py-3 text-lg"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Обычный режим для авторизованных пользователей */
          <div className="p-4 space-y-6">
            {/* Profile Header */}
            <div className="bg-white bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-100 bg-primary-900 rounded-full flex items-center justify-center">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-primary-600" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900 text-white">
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    {profile?.isPremium && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-gray-400">@{profile?.username}</p>
                  {profile?.location && (
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 text-gray-400">
                        {profile.location.address}
                      </span>
                    </div>
                  )}
                  {profile?.bio && (
                    <p className="text-sm text-gray-600 text-gray-400 mt-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{dogs.length}</div>
                  <div className="text-sm text-gray-500 text-gray-400">Собак</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">127</div>
                  <div className="text-sm text-gray-500 text-gray-400">Прогулок</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">15</div>
                  <div className="text-sm text-gray-500 text-gray-400">Достижений</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">42</div>
                  <div className="text-sm text-gray-500 text-gray-400">Друзей</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white bg-gray-800 rounded-lg">
              <div className="flex border-b border-gray-200 border-gray-700">
                {[
                  { id: 'profile', label: 'Профиль', icon: User },
                  { id: 'dogs', label: 'Мои собаки', icon: Dog },
                  { id: 'achievements', label: 'Достижения', icon: Award }
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
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Personal Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                        Личная информация
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Имя
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="Введите ваше имя"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Фамилия
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="Введите вашу фамилию"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="your@email.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                            Телефон
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                          Биография
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white"
                          placeholder="Расскажите о себе..."
                        />
                      </div>
                    </div>

                    {/* Interests */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                        Ваши интересы
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => handleArrayToggle('interests', interest)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              formData.interests.includes(interest)
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Walk Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 text-white mb-4">
                        Предпочтения прогулок
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {walkPreferences.map((pref) => (
                          <button
                            key={pref}
                            onClick={() => handleArrayToggle('walkPreferences', pref)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              formData.walkPreferences.includes(pref)
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить изменения
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'dogs' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 text-white">
                        Мои собаки
                      </h3>
                      <Button
                        onClick={() => setShowDogForm(true)}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить собаку
                      </Button>
                    </div>
                    
                    {dogs.length === 0 ? (
                      <div className="text-center py-12">
                        <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-gray-400 mb-4">
                          У вас пока нет добавленных собак
                        </p>
                        <Button
                          onClick={() => setShowDogForm(true)}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить первую собаку
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dogs.map((dog) => (
                          <div key={dog.id} className="bg-gray-50 bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-primary-100 bg-primary-900 rounded-full flex items-center justify-center">
                                <Dog className="h-6 w-6 text-primary-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-white">
                                  {dog.name}
                                </h4>
                                <p className="text-sm text-gray-600 text-gray-400">
                                  {dog.breed}, {dog.age} лет
                                </p>
                              </div>
                            </div>
                            {dog.character && (
                              <p className="text-sm text-gray-600 text-gray-400 mb-3">
                                {dog.character}
                              </p>
                            )}
                            {dog.walkGoals.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {dog.walkGoals.map((goal, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-primary-100 bg-primary-900 text-primary-800 text-primary-200 text-xs rounded-full"
                                  >
                                    {goal}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 text-white">
                      Достижения
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { title: 'Первая прогулка', description: 'Совершите первую прогулку', icon: '🚶', earned: true },
                        { title: '10 прогулок', description: 'Совершите 10 прогулок', icon: '🏃', earned: true },
                        { title: '50 прогулок', description: 'Совершите 50 прогулок', icon: '🏆', earned: false },
                        { title: 'Социальная бабочка', description: 'Познакомьтесь с 5 владельцами', icon: '👥', earned: true },
                        { title: 'Исследователь', description: 'Посетите 10 разных мест', icon: '🗺️', earned: false },
                        { title: 'Заботливый хозяин', description: 'Добавьте информацию о собаке', icon: '🐕', earned: true }
                      ].map((achievement, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            achievement.earned 
                              ? 'border-yellow-400 bg-yellow-50 bg-yellow-900/20' 
                              : 'border-gray-200 border-gray-700 bg-gray-50 bg-gray-700'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">{achievement.icon}</div>
                            <h4 className="font-semibold text-gray-900 text-white mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-gray-600 text-gray-400">
                              {achievement.description}
                            </p>
                            {achievement.earned && (
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-yellow-100 bg-yellow-900 text-yellow-800 text-yellow-200 text-xs rounded-full">
                                  Получено
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}