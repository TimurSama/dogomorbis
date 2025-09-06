import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// Типы событий WebSocket
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  events: WebSocketEvent[];
}

interface WebSocketActions {
  // Подключение
  connect: () => void;
  disconnect: () => void;
  
  // Отправка событий
  emit: (event: string, data: any) => void;
  
  // Подписка на события
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string) => void;
  
  // Управление состоянием
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  addEvent: (event: WebSocketEvent) => void;
  clearEvents: () => void;
  
  // Сброс состояния
  reset: () => void;
}

type WebSocketStore = WebSocketState & WebSocketActions;

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  // Начальное состояние
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  events: [],

  // Подключение к WebSocket
  connect: () => {
    const { socket, isConnected } = get();
    
    if (socket && isConnected) {
      return; // Уже подключены
    }

    set({ isConnecting: true, error: null });

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const newSocket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Обработчики событий
      newSocket.on('connect', () => {
        set({ 
          isConnected: true, 
          isConnecting: false, 
          error: null 
        });
        
        // Добавляем событие подключения
        get().addEvent({
          type: 'connect',
          data: { socketId: newSocket.id },
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('disconnect', (reason) => {
        set({ 
          isConnected: false, 
          isConnecting: false 
        });
        
        get().addEvent({
          type: 'disconnect',
          data: { reason },
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('connect_error', (error) => {
        set({ 
          isConnected: false, 
          isConnecting: false, 
          error: error.message 
        });
        
        get().addEvent({
          type: 'connect_error',
          data: { error: error.message },
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('reconnect', (attemptNumber) => {
        set({ 
          isConnected: true, 
          isConnecting: false, 
          error: null 
        });
        
        get().addEvent({
          type: 'reconnect',
          data: { attemptNumber },
          timestamp: new Date().toISOString(),
        });
      });

      // Обработка пользовательских событий
      newSocket.on('match_invite', (data) => {
        get().addEvent({
          type: 'match_invite',
          data,
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('collectible_spawn', (data) => {
        get().addEvent({
          type: 'collectible_spawn',
          data,
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('user_nearby', (data) => {
        get().addEvent({
          type: 'user_nearby',
          data,
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('notification', (data) => {
        get().addEvent({
          type: 'notification',
          data,
          timestamp: new Date().toISOString(),
        });
      });

      newSocket.on('dao_update', (data) => {
        get().addEvent({
          type: 'dao_update',
          data,
          timestamp: new Date().toISOString(),
        });
      });

      set({ socket: newSocket });

    } catch (error: any) {
      set({ 
        isConnecting: false, 
        error: error.message || 'Ошибка подключения к WebSocket' 
      });
    }
  },

  // Отключение от WebSocket
  disconnect: () => {
    const { socket } = get();
    
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        isConnecting: false 
      });
    }
  },

  // Отправка события
  emit: (event, data) => {
    const { socket, isConnected } = get();
    
    if (socket && isConnected) {
      socket.emit(event, data);
      
      get().addEvent({
        type: `emit_${event}`,
        data,
        timestamp: new Date().toISOString(),
      });
    } else {
      set({ error: 'WebSocket не подключен' });
    }
  },

  // Подписка на событие
  subscribe: (event, callback) => {
    const { socket } = get();
    
    if (socket) {
      socket.on(event, callback);
    }
  },

  // Отписка от события
  unsubscribe: (event) => {
    const { socket } = get();
    
    if (socket) {
      socket.off(event);
    }
  },

  // Управление состоянием
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ error }),
  
  addEvent: (event) => {
    set((state) => ({
      events: [event, ...state.events.slice(0, 99)], // Храним последние 100 событий
    }));
  },
  
  clearEvents: () => set({ events: [] }),

  // Сброс состояния
  reset: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    
    set({
      socket: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      events: [],
    });
  },
})); 