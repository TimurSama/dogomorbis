'use client';

import { useState, useEffect } from 'react';
import { getDeviceType, getScreenSize, DeviceType } from '@/lib/responsive';

export function useResponsive() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateResponsive = () => {
      const device = getDeviceType();
      const size = getScreenSize();
      
      setDeviceType(device);
      setScreenSize(size);
      setIsMobile(device === 'mobile');
      setIsTablet(device === 'tablet');
      setIsDesktop(device === 'desktop');
    };

    // Устанавливаем начальные значения
    updateResponsive();

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', updateResponsive);

    // Очищаем слушатель при размонтировании
    return () => window.removeEventListener('resize', updateResponsive);
  }, []);

  return {
    deviceType,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
  };
}

// Хук для определения ориентации экрана
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
}

// Хук для определения поддержки touch
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

// Хук для определения темной темы
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return isDark;
}

// Хук для определения поддержки PWA
export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
    setIsStandalone(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return { isPWA, isStandalone };
}

