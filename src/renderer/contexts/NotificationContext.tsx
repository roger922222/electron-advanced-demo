import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (title: string, type?: NotificationType, message?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSystemNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 生成唯一ID
  const generateId = () => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 显示应用内通知
  const showNotification = useCallback((
    title: string,
    type: NotificationType = 'info',
    message?: string,
    duration: number = 5000
  ) => {
    const id = generateId();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev]);

    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    console.log('显示通知:', notification);
  }, []);

  // 显示系统原生通知
  const showSystemNotification = useCallback(async (
    title: string,
    message: string,
    type: NotificationType = 'info'
  ) => {
    try {
      if (typeof window.electronAPI !== 'undefined') {
        // 使用 Electron 原生通知
        const result = await window.electronAPI.system.showNotification({
          title,
          body: message,
          urgency: type === 'error' ? 'critical' : type === 'warning' ? 'normal' : 'low'
        });

        if (result.success) {
          console.log('系统通知已发送:', title);
        } else {
          console.error('系统通知发送失败:', result.error);
          // 回退到应用内通知
          showNotification(title, type, message);
        }
      } else if ('Notification' in window) {
        // 使用 Web Notification API
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon.png'
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/icon.png'
            });
          } else {
            // 回退到应用内通知
            showNotification(title, type, message);
          }
        } else {
          // 回退到应用内通知
          showNotification(title, type, message);
        }
      } else {
        // 回退到应用内通知
        showNotification(title, type, message);
      }
    } catch (error) {
      console.error('显示系统通知失败:', error);
      // 回退到应用内通知
      showNotification(title, type, message);
    }
  }, [showNotification]);

  // 移除通知
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // 清空所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 限制通知数量
  React.useEffect(() => {
    const maxNotifications = 5;
    if (notifications.length > maxNotifications) {
      setNotifications(prev => prev.slice(0, maxNotifications));
    }
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSystemNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};