import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '@shared/types';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'zh-CN',
  autoStart: false,
  minimizeToTray: true,
  notifications: true,
  autoUpdate: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载设置
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (typeof window.electronAPI !== 'undefined') {
        const loadedSettings = await window.electronAPI.settings.get();
        setSettings(loadedSettings);
        console.log('设置已加载:', loadedSettings);
      } else {
        // 在浏览器环境中从 localStorage 加载
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      }
    } catch (err) {
      console.error('加载设置失败:', err);
      setError(err instanceof Error ? err.message : '加载设置失败');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新设置
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      setError(null);
      const updatedSettings = { ...settings, ...newSettings };

      if (typeof window.electronAPI !== 'undefined') {
        const result = await window.electronAPI.settings.set(newSettings);
        if (result.success && result.data) {
          setSettings(result.data);
          console.log('设置已更新:', result.data);
        } else {
          throw new Error(result.error || '更新设置失败');
        }
      } else {
        // 在浏览器环境中保存到 localStorage
        localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
      }
    } catch (err) {
      console.error('更新设置失败:', err);
      setError(err instanceof Error ? err.message : '更新设置失败');
      throw err;
    }
  };

  // 重置设置
  const resetSettings = async () => {
    try {
      setError(null);

      if (typeof window.electronAPI !== 'undefined') {
        const result = await window.electronAPI.settings.reset();
        if (result.success && result.data) {
          setSettings(result.data);
          console.log('设置已重置:', result.data);
        } else {
          throw new Error(result.error || '重置设置失败');
        }
      } else {
        // 在浏览器环境中重置
        localStorage.removeItem('app-settings');
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('重置设置失败:', err);
      setError(err instanceof Error ? err.message : '重置设置失败');
      throw err;
    }
  };

  // 初始化
  useEffect(() => {
    loadSettings();
  }, []);

  // 监听设置变化事件
  useEffect(() => {
    if (typeof window.electronAPI !== 'undefined') {
      const handleSettingsChange = (newSettings: AppSettings) => {
        setSettings(newSettings);
        console.log('收到设置变化事件:', newSettings);
      };

      window.electronAPI.on('settings-changed', handleSettingsChange);

      return () => {
        window.electronAPI.off('settings-changed', handleSettingsChange);
      };
    }
  }, []);

  // 监听特定设置变化并执行相应操作
  useEffect(() => {
    // 当语言设置变化时
    if (settings.language !== defaultSettings.language) {
      document.documentElement.lang = settings.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    }

    // 当通知设置变化时
    if (!settings.notifications) {
      console.log('通知已禁用');
    }

    // 当自动启动设置变化时
    if (settings.autoStart) {
      console.log('自动启动已启用');
    }
  }, [settings]);

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};