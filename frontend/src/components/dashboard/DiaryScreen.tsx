'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock,
  Heart,
  Camera,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  location: string;
  duration: number; // в минутах
  dogs: Array<{
    name: string;
    breed: string;
    mood: 'happy' | 'tired' | 'energetic' | 'calm';
  }>;
  weather: string;
  photos: string[];
  tags: string[];
  mood: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
}

export function DiaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const mockEntries: DiaryEntry[] = [
    {
      id: '1',
      date: '2024-01-15',
      title: 'Утренняя прогулка в парке',
      content: 'Прекрасная прогулка с Бобиком в парке Сокольники. Он был очень активным и веселым!',
      location: 'Парк Сокольники',
      duration: 45,
      dogs: [
        { name: 'Бобик', breed: 'Лабрадор', mood: 'energetic' }
      ],
      weather: 'Солнечно, +5°C',
      photos: ['/api/placeholder/200/150', '/api/placeholder/200/150'],
      tags: ['прогулка', 'парк', 'утро'],
      mood: 'excellent',
      notes: 'Встретили других собачников, Бобик хорошо играл с другими собаками'
    },
    {
      id: '2',
      date: '2024-01-14',
      title: 'Дрессировка в кинологическом центре',
      content: 'Занятие по базовым командам. Бобик показал хорошие результаты в выполнении команд "сидеть" и "лежать".',
      location: 'Кинологический центр "Друг"',
      duration: 60,
      dogs: [
        { name: 'Бобик', breed: 'Лабрадор', mood: 'calm' }
      ],
      weather: 'Облачно, +2°C',
      photos: ['/api/placeholder/200/150'],
      tags: ['дрессировка', 'команды', 'обучение'],
      mood: 'good',
      notes: 'Тренер похвалил Бобика за послушание'
    },
    {
      id: '3',
      date: '2024-01-13',
      title: 'Вечерняя прогулка по району',
      content: 'Спокойная прогулка по знакомому маршруту. Бобик был немного уставшим после активного дня.',
      location: 'Район Сокольники',
      duration: 30,
      dogs: [
        { name: 'Бобик', breed: 'Лабрадор', mood: 'tired' }
      ],
      weather: 'Дождь, +1°C',
      photos: [],
      tags: ['прогулка', 'вечер', 'дождь'],
      mood: 'average',
      notes: 'Пришлось сократить прогулку из-за дождя'
    },
  ];

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-100 text-green-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'average': return 'bg-yellow-100 text-yellow-700';
      case 'poor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return '😊';
      case 'good': return '🙂';
      case 'average': return '😐';
      case 'poor': return '😔';
      default: return '😐';
    }
  };

  const getDogMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-green-100 text-green-700';
      case 'energetic': return 'bg-blue-100 text-blue-700';
      case 'calm': return 'bg-purple-100 text-purple-700';
      case 'tired': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEntries = mockEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const matchesDate = entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Дневник</h1>
            <p className="text-sm text-purple-600">Записи о прогулках и активности</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
            <Button variant="default" size="sm" className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800">
              <Plus className="h-4 w-4 mr-2" />
              Новая запись
            </Button>
          </div>
        </div>

        {/* Search and Date Filter */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Поиск записей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-pink-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-800 focus:ring-2 focus:ring-purple-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-pink-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-800 focus:ring-2 focus:ring-purple-500"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 soft-shadow pencil-border fur-texture"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">{entry.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                      {getMoodIcon(entry.mood)} {entry.mood}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{entry.title}</h3>
                  <p className="text-gray-700 mb-3">{entry.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{entry.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{entry.duration} мин</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">🌤️ {entry.weather}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{entry.photos.length} фото</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Собаки:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.dogs.map((dog, dogIndex) => (
                    <span
                      key={dogIndex}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDogMoodColor(dog.mood)}`}
                    >
                      {dog.name} ({dog.breed}) - {dog.mood}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Теги:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {entry.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">Заметки:</p>
                  <p className="text-sm text-gray-600 bg-pink-50 p-3 rounded-xl">{entry.notes}</p>
                </div>
              )}

              {entry.photos.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {entry.photos.map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo}
                      alt={`Фото ${photoIndex + 1}`}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Записи не найдены</h3>
            <p className="text-gray-600">Создайте первую запись в дневнике</p>
          </div>
        )}
      </div>
    </div>
  );
}
