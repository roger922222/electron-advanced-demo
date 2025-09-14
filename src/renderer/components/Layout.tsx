import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationContainer } from './NotificationContainer';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const { settings } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理侧边栏切换
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 处理导航
  const handleNavigation = (path: string) => {
    navigate(path);
    // 在移动端导航后自动收起侧边栏
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className={`layout ${actualTheme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 标题栏 (Windows/Linux) */}
      {process.platform !== 'darwin' && (
        <div className="titlebar">
          <div className="titlebar-drag-region">
            <div className="titlebar-title">Electron Advanced Demo</div>
          </div>
          <div className="titlebar-controls">
            <button className="titlebar-button minimize" onClick={() => window.electronAPI?.window.minimize('main')}>
              <span>−</span>
            </button>
            <button className="titlebar-button maximize" onClick={() => window.electronAPI?.window.maximize('main')}>
              <span>□</span>
            </button>
            <button className="titlebar-button close" onClick={() => window.electronAPI?.window.close('main')}>
              <span>×</span>
            </button>
          </div>
        </div>
      )}

      <div className="layout-content">
        {/* 侧边栏 */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onNavigate={handleNavigation}
          currentPath={location.pathname}
        />

        {/* 主内容区域 */}
        <div className="main-content">
          {/* 顶部导航栏 */}
          <Header 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            currentPath={location.pathname}
          />

          {/* 页面内容 */}
          <main className="page-content">
            {children}
          </main>
        </div>
      </div>

      {/* 通知容器 */}
      <NotificationContainer />

      {/* 移动端遮罩 */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          overflow: hidden;
        }

        .titlebar {
          display: flex;
          height: 32px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          -webkit-app-region: drag;
          user-select: none;
        }

        .titlebar-drag-region {
          flex: 1;
          display: flex;
          align-items: center;
          padding-left: 12px;
        }

        .titlebar-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .titlebar-controls {
          display: flex;
          -webkit-app-region: no-drag;
        }

        .titlebar-button {
          width: 46px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .titlebar-button:hover {
          background-color: var(--bg-hover);
        }

        .titlebar-button.close:hover {
          background-color: #e81123;
          color: white;
        }

        .layout-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .page-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background-color: var(--bg-primary);
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .page-content {
            padding: 16px;
          }
        }

        /* 主题变量 */
        .layout.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --bg-hover: #e9ecef;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --border-color: #dee2e6;
        }

        .layout.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --bg-hover: #404040;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: #404040;
        }

        /* 侧边栏收起状态 */
        .layout.sidebar-collapsed .page-content {
          margin-left: 0;
        }

        /* 滚动条样式 */
        .page-content::-webkit-scrollbar {
          width: 8px;
        }

        .page-content::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .page-content::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .page-content::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};