import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FileManager } from './pages/FileManager';
import { DatabaseManager } from './pages/DatabaseManager';
import { Settings } from './pages/Settings';
import { SystemInfo } from './pages/SystemInfo';
import { APITester } from './pages/APITester';
import { About } from './pages/About';
import { useTheme } from './contexts/ThemeContext';
import { useSettings } from './contexts/SettingsContext';
import { useNotification } from './contexts/NotificationContext';
import './styles/App.css';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState<string>('');
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 检查 Electron API 是否可用
        if (typeof window.electronAPI === 'undefined') {
          console.warn('Electron API 不可用');
          setIsLoading(false);
          return;
        }

        // 获取应用版本
        const version = await window.electronAPI.app.getVersion();
        setAppVersion(version);

        // 获取系统信息
        const sysInfo = await window.electronAPI.system.getInfo();
        setSystemInfo(sysInfo);

        // 加载设置
        const appSettings = await window.electronAPI.settings.get();
        updateSettings(appSettings);

        // 应用主题
        setTheme(appSettings.theme);

        // 设置事件监听器
        setupEventListeners();

        console.log('应用初始化完成');
        setIsLoading(false);

        // 显示欢迎通知
        showNotification('欢迎使用 Electron Advanced Demo！', 'success');
      } catch (error) {
        console.error('应用初始化失败:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 设置事件监听器
  const setupEventListeners = () => {
    if (typeof window.electronAPI === 'undefined') return;

    // 监听菜单动作
    window.electronAPI.on('menu-action', (action: any) => {
      handleMenuAction(action);
    });

    // 监听托盘动作
    window.electronAPI.on('tray-action', (action: any) => {
      handleTrayAction(action);
    });

    // 监听主题变化
    window.electronAPI.on('theme-changed', (isDark: boolean) => {
      setTheme(isDark ? 'dark' : 'light');
    });

    // 监听设置变化
    window.electronAPI.on('settings-changed', (newSettings: any) => {
      updateSettings(newSettings);
    });

    // 监听更新事件
    window.electronAPI.on('update-available', (info: any) => {
      showNotification(`发现新版本 ${info.version}`, 'info');
    });

    window.electronAPI.on('update-downloaded', () => {
      showNotification('更新已下载，重启应用以应用更新', 'success');
    });

    // 监听文件拖拽
    window.electronAPI.on('file-dropped', (files: string[]) => {
      handleFilesDrop(files);
    });

    // 监听窗口焦点变化
    window.electronAPI.on('window-focus', () => {
      document.body.classList.add('window-focused');
    });

    window.electronAPI.on('window-blur', () => {
      document.body.classList.remove('window-focused');
    });
  };

  // 处理菜单动作
  const handleMenuAction = (action: any) => {
    switch (action.action) {
      case 'new-document':
        navigate('/file-manager');
        showNotification('创建新文档', 'info');
        break;
      
      case 'open-file':
        navigate('/file-manager');
        if (action.filePath) {
          showNotification(`打开文件: ${action.filePath}`, 'info');
        }
        break;
      
      case 'save-file':
        showNotification('保存文件', 'info');
        break;
      
      case 'open-settings':
        navigate('/settings');
        break;
      
      case 'show-about':
        navigate('/about');
        break;
      
      case 'set-theme':
        setTheme(action.theme);
        break;
      
      case 'check-updates':
        handleCheckUpdates();
        break;
      
      case 'show-system-info':
        navigate('/system-info');
        break;
      
      default:
        console.log('未处理的菜单动作:', action);
    }
  };

  // 处理托盘动作
  const handleTrayAction = (action: any) => {
    switch (action.action) {
      case 'open-settings':
        navigate('/settings');
        break;
      
      case 'open-data-manager':
        navigate('/database');
        break;
      
      case 'open-file-manager':
        navigate('/file-manager');
        break;
      
      case 'show-system-info':
        navigate('/system-info');
        break;
      
      case 'send-test-notification':
        showNotification('这是一个测试通知', 'info');
        break;
      
      case 'check-updates':
        handleCheckUpdates();
        break;
      
      case 'show-about':
        navigate('/about');
        break;
      
      default:
        console.log('未处理的托盘动作:', action);
    }
  };

  // 处理文件拖拽
  const handleFilesDrop = (files: string[]) => {
    console.log('拖拽的文件:', files);
    navigate('/file-manager', { state: { droppedFiles: files } });
    showNotification(`拖拽了 ${files.length} 个文件`, 'info');
  };

  // 检查更新
  const handleCheckUpdates = async () => {
    try {
      if (typeof window.electronAPI === 'undefined') return;
      
      showNotification('正在检查更新...', 'info');
      const result = await window.electronAPI.updater.check();
      
      if (result) {
        showNotification('正在下载更新...', 'info');
      } else {
        showNotification('当前已是最新版本', 'success');
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      showNotification('检查更新失败', 'error');
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在初始化应用...</div>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/file-manager" element={<FileManager />} />
          <Route path="/database" element={<DatabaseManager />} />
          <Route path="/api-tester" element={<APITester />} />
          <Route path="/system-info" element={<SystemInfo />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={
            <div className="page-not-found">
              <h2>页面未找到</h2>
              <p>请检查 URL 是否正确</p>
              <button onClick={() => navigate('/')}>返回首页</button>
            </div>
          } />
        </Routes>
      </Layout>
      
      {/* 应用信息 */}
      <div className="app-info">
        <span>v{appVersion}</span>
        {systemInfo && (
          <span>{systemInfo.platform}</span>
        )}
      </div>
    </div>
  );
};

export default App;