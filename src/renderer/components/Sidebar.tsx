import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  onNavigate: (path: string) => void;
  currentPath: string;
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    path: '/',
    label: '仪表板',
    icon: '📊',
    description: '应用概览和统计'
  },
  {
    id: 'file-manager',
    path: '/file-manager',
    label: '文件管理',
    icon: '📁',
    description: '文件操作和管理'
  },
  {
    id: 'database',
    path: '/database',
    label: '数据库',
    icon: '🗄️',
    description: 'SQLite 数据管理'
  },
  {
    id: 'api-tester',
    path: '/api-tester',
    label: 'API 测试',
    icon: '🔌',
    description: 'HTTP 请求测试'
  },
  {
    id: 'system-info',
    path: '/system-info',
    label: '系统信息',
    icon: '💻',
    description: '系统状态和信息'
  },
  {
    id: 'settings',
    path: '/settings',
    label: '设置',
    icon: '⚙️',
    description: '应用程序设置'
  },
  {
    id: 'about',
    path: '/about',
    label: '关于',
    icon: 'ℹ️',
    description: '关于此应用'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onNavigate, currentPath }) => {
  const { actualTheme } = useTheme();

  const handleNavClick = (path: string) => {
    onNavigate(path);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${actualTheme}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          {!collapsed && (
            <span className="logo-text">Electron Demo</span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                title={collapsed ? item.label : item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
                {!collapsed && currentPath === item.path && (
                  <span className="nav-indicator"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-info">
            <div className="info-item">
              <span className="info-label">版本</span>
              <span className="info-value">v1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">状态</span>
              <span className="info-value status-online">在线</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar {
          width: ${collapsed ? '60px' : '240px'};
          height: 100vh;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          position: relative;
          z-index: 100;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .logo-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .sidebar-nav {
          flex: 1;
          padding: 8px 0;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          margin-bottom: 2px;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
          gap: 12px;
        }

        .nav-link:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-link.active {
          background-color: var(--color-primary);
          color: white;
        }

        .nav-link.active:hover {
          background-color: var(--color-primary-dark);
        }

        .nav-icon {
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          flex: 1;
        }

        .nav-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background-color: white;
          border-radius: 2px 0 0 2px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .info-value {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .status-online {
          color: var(--color-success);
        }

        /* 收起状态 */
        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 12px;
        }

        .sidebar.collapsed .nav-label,
        .sidebar.collapsed .nav-indicator,
        .sidebar.collapsed .logo-text {
          display: none;
        }

        /* 滚动条样式 */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: ${collapsed ? '-60px' : '0'};
            z-index: 1000;
            box-shadow: ${collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.1)'};
          }

          .sidebar:not(.collapsed) {
            width: 280px;
          }
        }

        /* 主题变量 */
        .sidebar.light {
          --bg-secondary: #f8f9fa;
          --bg-hover: #e9ecef;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #868e96;
          --border-color: #dee2e6;
          --color-primary: #667eea;
          --color-primary-dark: #5a6fd8;
          --color-success: #28a745;
        }

        .sidebar.dark {
          --bg-secondary: #2d2d2d;
          --bg-hover: #404040;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #888888;
          --border-color: #404040;
          --color-primary: #667eea;
          --color-primary-dark: #5a6fd8;
          --color-success: #28a745;
        }
      `}</style>
    </div>
  );
};