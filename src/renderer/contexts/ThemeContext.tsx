import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // 检测系统主题
  const detectSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // 更新实际主题
  const updateActualTheme = (newTheme: Theme) => {
    let resolvedTheme: 'light' | 'dark';
    
    if (newTheme === 'auto') {
      resolvedTheme = detectSystemTheme();
    } else {
      resolvedTheme = newTheme;
    }
    
    setActualTheme(resolvedTheme);
    
    // 更新 HTML 类名
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    
    // 更新 CSS 变量
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    
    // 保存到 Electron 设置
    if (typeof window.electronAPI !== 'undefined') {
      window.electronAPI.settings.set({ theme: newTheme }).catch(console.error);
    }
    
    console.log(`主题已更新: ${newTheme} (实际: ${resolvedTheme})`);
  };

  // 设置主题
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    updateActualTheme(newTheme);
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (theme === 'auto') {
          updateActualTheme('auto');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      handleSetTheme(savedTheme);
    } else {
      // 默认跟随系统
      handleSetTheme('auto');
    }
  }, []);

  // 保存主题到 localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 监听 Electron 主题变化事件
  useEffect(() => {
    if (typeof window.electronAPI !== 'undefined') {
      const handleThemeChange = (isDark: boolean) => {
        if (theme === 'auto') {
          setActualTheme(isDark ? 'dark' : 'light');
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(isDark ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
      };

      window.electronAPI.on('theme-changed', handleThemeChange);

      return () => {
        window.electronAPI.off('theme-changed', handleThemeChange);
      };
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};