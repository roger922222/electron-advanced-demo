import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';

interface SystemStats {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
  uptime: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'file-manager',
    title: '文件管理',
    description: '浏览和管理文件',
    icon: '📁',
    path: '/file-manager',
    color: '#667eea'
  },
  {
    id: 'database',
    title: '数据库',
    description: '管理 SQLite 数据',
    icon: '🗄️',
    path: '/database',
    color: '#764ba2'
  },
  {
    id: 'api-tester',
    title: 'API 测试',
    description: '测试 HTTP 接口',
    icon: '🔌',
    path: '/api-tester',
    color: '#f093fb'
  },
  {
    id: 'system-info',
    title: '系统信息',
    description: '查看系统状态',
    icon: '💻',
    path: '/system-info',
    color: '#4facfe'
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const { showNotification } = useNotification();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 加载系统信息
  useEffect(() => {
    const loadSystemInfo = async () => {
      try {
        if (typeof window.electronAPI !== 'undefined') {
          const info = await window.electronAPI.system.getInfo();
          setSystemStats(info);
        } else {
          // 浏览器环境的模拟数据
          setSystemStats({
            platform: 'web',
            arch: 'unknown',
            nodeVersion: 'N/A',
            electronVersion: 'N/A',
            chromeVersion: navigator.userAgent,
            uptime: 0
          });
        }
      } catch (error) {
        console.error('加载系统信息失败:', error);
        showNotification('加载系统信息失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemInfo();
  }, [showNotification]);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 处理快速操作点击
  const handleQuickAction = (action: QuickAction) => {
    navigate(action.path);
    showNotification(`打开 ${action.title}`, 'info');
  };

  // 处理测试通知
  const handleTestNotification = () => {
    showNotification('测试通知', 'success', '这是一个测试通知消息');
  };

  // 格式化运行时间
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时 ${minutes}分钟`;
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>正在加载仪表板...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard ${actualTheme}`}>
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">欢迎使用 Electron Advanced Demo</h1>
          <p className="welcome-subtitle">
            这是一个展示 Electron 高级功能的综合性演示应用
          </p>
          <div className="current-time">
            <span className="time-icon">🕐</span>
            <span className="time-text">
              {currentTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">🖥️</div>
            <div className="stats-info">
              <div className="stats-label">平台</div>
              <div className="stats-value">{systemStats?.platform || 'Unknown'}</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">⚡</div>
            <div className="stats-info">
              <div className="stats-label">架构</div>
              <div className="stats-value">{systemStats?.arch || 'Unknown'}</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">🔧</div>
            <div className="stats-info">
              <div className="stats-label">Electron</div>
              <div className="stats-value">{systemStats?.electronVersion || 'N/A'}</div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">⏱️</div>
            <div className="stats-info">
              <div className="stats-label">运行时间</div>
              <div className="stats-value">
                {systemStats?.uptime ? formatUptime(systemStats.uptime) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">快速操作</h2>
          <div className="actions-grid">
            {quickActions.map(action => (
              <div
                key={action.id}
                className="action-card"
                onClick={() => handleQuickAction(action)}
                style={{ '--accent-color': action.color } as React.CSSProperties}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        <div className="feature-showcase">
          <h2 className="section-title">功能展示</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-icon">🔔</span>
                <h3>通知系统</h3>
              </div>
              <p className="feature-description">
                支持原生系统通知和应用内通知，提供多种通知类型和自定义选项。
              </p>
              <button 
                className="feature-button"
                onClick={handleTestNotification}
              >
                测试通知
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-icon">🎨</span>
                <h3>主题系统</h3>
              </div>
              <p className="feature-description">
                支持浅色、深色和自动主题切换，提供一致的用户体验。
              </p>
              <button 
                className="feature-button"
                onClick={() => navigate('/settings')}
              >
                主题设置
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <span className="feature-icon">🔒</span>
                <h3>安全架构</h3>
              </div>
              <p className="feature-description">
                采用安全的 Electron 配置，禁用 Node.js 集成，使用预加载脚本。
              </p>
              <button 
                className="feature-button"
                onClick={() => navigate('/system-info')}
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .welcome-section {
          text-align: center;
          padding: 32px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          border-radius: var(--border-radius-xl);
          color: white;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 16px;
        }

        .current-time {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1rem;
          opacity: 0.8;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stats-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .stats-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
        }

        .stats-icon {
          font-size: 2rem;
        }

        .stats-info {
          flex: 1;
        }

        .stats-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .stats-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .action-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--accent-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .action-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .action-card:hover::before {
          transform: scaleX(1);
        }

        .action-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .action-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .action-arrow {
          font-size: 1.5rem;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .action-card:hover .action-arrow {
          color: var(--accent-color);
          transform: translateX(4px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          box-shadow: var(--shadow);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .feature-button {
          background-color: var(--color-primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feature-button:hover {
          background-color: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .welcome-subtitle {
            font-size: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        /* 主题变量 */
        .dashboard.light {
          --bg-primary: #ffffff;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #868e96;
          --border-color: #dee2e6;
          --color-primary: #667eea;
          --color-primary-dark: #5a6fd8;
          --color-secondary: #764ba2;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
          --border-radius-xl: 1rem;
          --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
        }

        .dashboard.dark {
          --bg-primary: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #888888;
          --border-color: #404040;
          --color-primary: #667eea;
          --color-primary-dark: #5a6fd8;
          --color-secondary: #764ba2;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
          --border-radius-xl: 1rem;
          --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
};