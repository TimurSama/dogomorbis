'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Heart, 
  MapPin, 
  Clock,
  Camera,
  FileText,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

export function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mockEntries = [
    {
      id: '1',
      date: '15 марта 2024',
      title: 'Прогулка в парке',
      content: 'Отличная прогулка с Бобиком в Сокольниках. Прошли 3 км, встретили других собачников.',
      mood: 'happy',
      weather: 'sunny',
      duration: '45 минут',
      distance: '3.2 км',
      photos: ['/api/placeholder/200/150'],
      tags: ['прогулка', 'парк', 'социализация'],
    },
    {
      id: '2',
      date: '14 марта 2024',
      title: 'Дрессировка дома',
      content: 'Повторяли команды "сидеть" и "лежать". Бобик хорошо справляется!',
      mood: 'satisfied',
      weather: 'indoor',
      duration: '20 минут',
      distance: '0 км',
      photos: [],
      tags: ['дрессировка', 'команды'],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--outline)] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text)]">Дневник</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>Добавить запись</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-[var(--surface-2)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--text)]">Март 2024</h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-[var(--surface)] rounded">
                <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="p-2 text-[var(--dim)] font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                className={`p-2 rounded hover:bg-[var(--surface)] ${
                  day === 15 ? 'bg-blue-600 text-white' : 'text-[var(--text)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {mockEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--surface)] rounded-lg border border-[var(--outline)] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-[var(--text)]">{entry.title}</h3>
                    <span className="text-sm text-[var(--dim)]">{entry.date}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-3">{entry.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg">
                    <Edit className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                  <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg">
                    <Trash2 className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
              </div>

              {/* Entry Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Clock className="h-4 w-4" />
                  <span>{entry.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <MapPin className="h-4 w-4" />
                  <span>{entry.distance}</span>
                </div>
              </div>

              {/* Photos */}
              {entry.photos.length > 0 && (
                <div className="mb-3">
                  <div className="flex space-x-2">
                    {entry.photos.map((photo, photoIndex) => (
                      <img
                        key={photoIndex}
                        src={photo}
                        alt="Entry photo"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-[var(--surface-2)] text-[var(--text)] rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {mockEntries.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-[var(--dim)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Записей пока нет</h3>
            <p className="text-[var(--text-secondary)]">Добавьте первую запись в дневник</p>
          </div>
        )}
      </div>
    </div>
  );
}