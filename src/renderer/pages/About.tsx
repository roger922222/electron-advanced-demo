import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AppInfo {
  version: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
  platform: string;
  arch: string;
}

export const About: React.FC = () => {
  const { actualTheme } = useTheme();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        let info: AppInfo;

        if (typeof window.electronAPI !== 'undefined') {
          // Electron 环境
          const [version, systemInfo] = await Promise.all([
            window.electronAPI.app.getVersion(),
            window.electronAPI.system.getInfo()
          ]);

          info = {
            version,
            electronVersion: systemInfo.electronVersion,
            nodeVersion: systemInfo.nodeVersion,
            chromeVersion: systemInfo.chromeVersion,
            platform: systemInfo.platform,
            arch: systemInfo.arch
          };
        } else {
          // 浏览器环境
          info = {
            version: '1.0.0',
            electronVersion: 'N/A',
            nodeVersion: 'N/A',
            chromeVersion: navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'Unknown',
            platform: navigator.platform,
            arch: 'Unknown'
          };
        }

        setAppInfo(info);
      } catch (error) {
        console.error('加载应用信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppInfo();
  }, []);

  const features = [
    {
      icon: '🖥️',
      title: '跨平台支持',
      description: '支持 Windows、macOS 和 Linux 操作系统'
    },
    {
      icon: '⚡',
      title: '高性能',
      description: '基于 Chromium 和 Node.js 的高性能架构'
    },
    {
      icon: '🔒',
      title: '安全架构',
      description: '采用安全的 Electron 配置和最佳实践'
    },
    {
      icon: '🎨',
      title: '现代化 UI',
      description: '使用 React 和 TypeScript 构建的现代化界面'
    },
    {
      icon: '🔔',
      title: '原生集成',
      description: '系统通知、托盘、菜单等原生功能集成'
    },
    {
      icon: '🗄️',
      title: '数据管理',
      description: 'SQLite 数据库和文件系统操作支持'
    }
  ];

  const technologies = [
    { name: 'Electron', version: appInfo?.electronVersion || 'N/A', description: '跨平台桌面应用框架' },
    { name: 'React', version: '18.2.0', description: '用户界面库' },
    { name: 'TypeScript', version: '5.1.0', description: '类型安全的 JavaScript' },
    { name: 'Node.js', version: appInfo?.nodeVersion || 'N/A', description: 'JavaScript 运行时' },
    { name: 'Webpack', version: '5.88.0', description: '模块打包工具' },
    { name: 'SQLite', version: '3.x', description: '轻量级数据库' }
  ];

  if (isLoading) {
    return (
      <div className="about-loading">
        <div className="loading-spinner"></div>
        <p>正在加载应用信息...</p>
      </div>
    );
  }

  return (
    <div className={`about ${actualTheme}`}>
      <div className="about-header">
        <div className="app-logo">
          <span className="logo-icon">⚡</span>
        </div>
        <h1 className="app-title">Electron Advanced Demo</h1>
        <p className="app-version">版本 {appInfo?.version}</p>
        <p className="app-description">
          一个展示 Electron 高级功能和最佳实践的综合性演示应用程序
        </p>
      </div>

      <div className="about-content">
        <div className="info-section">
          <h2 className="section-title">应用信息</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">应用版本</span>
              <span className="info-value">{appInfo?.version}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Electron 版本</span>
              <span className="info-value">{appInfo?.electronVersion}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Node.js 版本</span>
              <span className="info-value">{appInfo?.nodeVersion}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Chrome 版本</span>
              <span className="info-value">{appInfo?.chromeVersion}</span>
            </div>
            <div className="info-item">
              <span className="info-label">操作系统</span>
              <span className="info-value">{appInfo?.platform}</span>
            </div>
            <div className="info-item">
              <span className="info-label">系统架构</span>
              <span className="info-value">{appInfo?.arch}</span>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2 className="section-title">主要功能</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-section">
          <h2 className="section-title">技术栈</h2>
          <div className="tech-grid">
            {technologies.map((tech, index) => (
              <div key={index} className="tech-item">
                <div className="tech-info">
                  <span className="tech-name">{tech.name}</span>
                  <span className="tech-version">{tech.version}</span>
                </div>
                <p className="tech-description">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="credits-section">
          <h2 className="section-title">开发信息</h2>
          <div className="credits-content">
            <div className="credit-item">
              <span className="credit-label">开发者</span>
              <span className="credit-value">罗杰 (luojie.rt)</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">开发时间</span>
              <span className="credit-value">2025年9月</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">许可证</span>
              <span className="credit-value">MIT License</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">项目地址</span>
              <span className="credit-value">
                <a href="#" onClick={() => console.log('打开项目地址')}>
                  GitHub Repository
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <p className="copyright">
            © 2025 Electron Advanced Demo. All rights reserved.
          </p>
          <p className="disclaimer">
            本应用仅用于演示 Electron 框架的功能和最佳实践。
          </p>
        </div>
      </div>

      <style jsx>{`
        .about {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
        }

        .about-loading {
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

        .about-header {
          text-align: center;
          padding: 40px 0;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          border-radius: var(--border-radius-xl);
          color: white;
          margin-bottom: 32px;
        }

        .app-logo {
          margin-bottom: 16px;
        }

        .logo-icon {
          font-size: 4rem;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .app-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .app-version {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 16px;
        }

        .app-description {
          font-size: 1rem;
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--color-primary);
          display: inline-block;
        }

        .info-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .info-value {
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .features-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .feature-card {
          text-align: center;
          padding: 20px;
          border-radius: var(--border-radius);
          background-color: var(--bg-secondary);
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .feature-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .feature-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .tech-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .tech-item {
          padding: 16px;
          border-radius: var(--border-radius);
          background-color: var(--bg-secondary);
          border-left: 4px solid var(--color-primary);
        }

        .tech-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .tech-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .tech-version {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .tech-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .credits-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .credits-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .credit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .credit-item:last-child {
          border-bottom: none;
        }

        .credit-label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .credit-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .credit-value a {
          color: var(--color-primary);
          text-decoration: none;
        }

        .credit-value a:hover {
          text-decoration: underline;
        }

        .footer-section {
          text-align: center;
          padding: 24px;
          border-top: 1px solid var(--border-color);
        }

        .copyright {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .disclaimer {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .about {
            padding: 16px;
          }

          .about-header {
            padding: 32px 20px;
          }

          .app-title {
            font-size: 2rem;
          }

          .logo-icon {
            font-size: 3rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .tech-grid {
            grid-template-columns: 1fr;
          }

          .credits-content {
            grid-template-columns: 1fr;
          }
        }

        /* 主题变量 */
        .about.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #868e96;
          --border-color: #dee2e6;
          --border-light: #f1f3f4;
          --color-primary: #667eea;
          --color-secondary: #764ba2;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
          --border-radius-xl: 1rem;
          --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .about.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #888888;
          --border-color: #404040;
          --border-light: #555555;
          --color-primary: #667eea;
          --color-secondary: #764ba2;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
          --border-radius-xl: 1rem;
          --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};