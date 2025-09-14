import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed, currentPath }) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { showNotification } = useNotification();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 获取页面标题
  const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
      '/': '仪表板',
      '/dashboard': '仪表板',
      '/file-manager': '文件管理',
      '/database': '数据库管理',
      '/api-tester': 'API 测试器',
      '/system-info': '系统信息',
      '/settings': '设置',
      '/about': '关于'
    };
    return titles[path] || '未知页面';
  };

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('网络连接已恢复', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('网络连接已断开', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  // 处理主题切换
  const handleThemeToggle = () => {
    toggleTheme();
    showNotification(`已切换到${actualTheme === 'light' ? '深色' : '浅色'}主题`, 'info');
  };

  // 处理通知测试
  const handleNotificationTest = () => {
    showNotification('这是一个测试通知', 'info', '通知功能正常工作！');
  };

  // 处理窗口控制
  const handleMinimize = async () => {
    try {
      if (typeof window.electronAPI !== 'undefined') {
        await window.electronAPI.window.minimize('main');
      }
    } catch (error) {
      console.error('最小化窗口失败:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      if (typeof window.electronAPI !== 'undefined') {
        await window.electronAPI.window.maximize('main');
      }
    } catch (error) {
      console.error('最大化窗口失败:', error);
    }
  };

  const handleClose = async () => {
    try {
      if (typeof window.electronAPI !== 'undefined') {
        await window.electronAPI.window.close('main');
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

  return (
    <header className={`header ${actualTheme}`}>
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <span className="toggle-icon">
            {sidebarCollapsed ? '☰' : '✕'}
          </span>
        </button>

        <div className="page-info">
          <h1 className="page-title">{getPageTitle(currentPath)}</h1>
          <div className="breadcrumb">
            <span>Electron Advanced Demo</span>
            <span className="separator">›</span>
            <span>{getPageTitle(currentPath)}</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="搜索功能..." 
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="header-right">
        <div className="status-indicators">
          <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-icon">{isOnline ? '🟢' : '🔴'}</span>
            <span className="status-text">{isOnline ? '在线' : '离线'}</span>
          </div>

          <div className="current-time">
            <span className="time-icon">🕐</span>
            <span className="time-text">
              {currentTime.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn theme-toggle"
            onClick={handleThemeToggle}
            title={`切换到${actualTheme === 'light' ? '深色' : '浅色'}主题`}
          >
            <span>{actualTheme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          <button 
            className="action-btn notification-test"
            onClick={handleNotificationTest}
            title="测试通知"
          >
            <span>🔔</span>
          </button>

          <div className="window-controls">
            <button 
              className="window-btn minimize"
              onClick={handleMinimize}
              title="最小化"
            >
              <span>−</span>
            </button>
            <button 
              className="window-btn maximize"
              onClick={handleMaximize}
              title="最大化"
            >
              <span>□</span>
            </button>
            <button 
              className="window-btn close"
              onClick={handleClose}
              title="关闭"
            >
              <span>×</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header {
          height: 60px;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 16px;
          position: relative;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .sidebar-toggle {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--border-radius);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-toggle:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .toggle-icon {
          font-size: 18px;
        }

        .page-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .page-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .breadcrumb {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .separator {
          color: var(--text-muted);
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 400px;
          margin: 0 auto;
        }

        .search-box {
          position: relative;
          width: 100%;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .status-indicators {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .network-status,
        .current-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .network-status.online .status-text {
          color: var(--color-success);
        }

        .network-status.offline .status-text {
          color: var(--color-danger);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--border-radius);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .action-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .window-controls {
          display: flex;
          gap: 2px;
          margin-left: 8px;
        }

        .window-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border-radius: 4px;
        }

        .window-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .window-btn.close:hover {
          background-color: var(--color-danger);
          color: white;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .header {
            padding: 0 12px;
            gap: 12px;
          }

          .header-center {
            display: none;
          }

          .status-indicators {
            display: none;
          }

          .breadcrumb {
            display: none;
          }

          .page-title {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .window-controls {
            display: none;
          }
        }

        /* 主题变量 */
        .header.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --bg-hover: #e9ecef;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #868e96;
          --border-color: #dee2e6;
          --color-primary: #667eea;
          --color-success: #28a745;
          --color-danger: #dc3545;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
        }

        .header.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --bg-hover: #404040;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #888888;
          --border-color: #404040;
          --color-primary: #667eea;
          --color-success: #28a745;
          --color-danger: #dc3545;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
        }
      `}</style>
    </header>
  );
};