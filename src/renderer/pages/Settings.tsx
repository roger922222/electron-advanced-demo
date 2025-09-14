import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';

export const Settings: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { settings, updateSettings, resetSettings, isLoading } = useSettings();
  const { showNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  // 处理设置更新
  const handleSettingChange = async (key: keyof typeof settings, value: any) => {
    try {
      setIsSaving(true);
      await updateSettings({ [key]: value });
      showNotification('设置已保存', 'success');
    } catch (error) {
      console.error('保存设置失败:', error);
      showNotification('保存设置失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理主题更改
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    handleSettingChange('theme', newTheme);
  };

  // 重置所有设置
  const handleResetSettings = async () => {
    if (window.confirm('确定要重置所有设置吗？此操作无法撤销。')) {
      try {
        await resetSettings();
        showNotification('设置已重置', 'success');
      } catch (error) {
        console.error('重置设置失败:', error);
        showNotification('重置设置失败', 'error');
      }
    }
  };

  // 测试通知
  const handleTestNotification = () => {
    showNotification('测试通知', 'info', '这是一个测试通知消息');
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>正在加载设置...</p>
      </div>
    );
  }

  return (
    <div className={`settings ${actualTheme}`}>
      <div className="settings-header">
        <h1>应用设置</h1>
        <p>配置您的应用偏好设置</p>
      </div>

      <div className="settings-content">
        {/* 外观设置 */}
        <div className="settings-section">
          <h2 className="section-title">外观</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">主题</label>
                <p className="setting-description">选择应用的外观主题</p>
              </div>
              <div className="setting-control">
                <div className="theme-options">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <span className="theme-icon">☀️</span>
                    <span>浅色</span>
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <span className="theme-icon">🌙</span>
                    <span>深色</span>
                  </button>
                  <button
                    className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    <span className="theme-icon">🔄</span>
                    <span>自动</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">语言</label>
                <p className="setting-description">选择界面语言</p>
              </div>
              <div className="setting-control">
                <select
                  className="form-select"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="zh-CN">中文（简体）</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 行为设置 */}
        <div className="settings-section">
          <h2 className="section-title">行为</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">开机自启动</label>
                <p className="setting-description">系统启动时自动启动应用</p>
              </div>
              <div className="setting-control">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.autoStart}
                    onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">最小化到系统托盘</label>
                <p className="setting-description">关闭窗口时最小化到系统托盘而不是退出</p>
              </div>
              <div className="setting-control">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.minimizeToTray}
                    onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="settings-section">
          <h2 className="section-title">通知</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">启用通知</label>
                <p className="setting-description">允许应用发送系统通知</p>
              </div>
              <div className="setting-control">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">测试通知</label>
                <p className="setting-description">发送一个测试通知</p>
              </div>
              <div className="setting-control">
                <button
                  className="btn btn-secondary"
                  onClick={handleTestNotification}
                  disabled={!settings.notifications}
                >
                  发送测试通知
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 更新设置 */}
        <div className="settings-section">
          <h2 className="section-title">更新</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">自动更新</label>
                <p className="setting-description">自动检查和下载应用更新</p>
              </div>
              <div className="setting-control">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.autoUpdate}
                    onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="settings-actions">
          <button
            className="btn btn-danger"
            onClick={handleResetSettings}
            disabled={isSaving}
          >
            重置所有设置
          </button>
          
          {isSaving && (
            <div className="saving-indicator">
              <div className="saving-spinner"></div>
              <span>保存中...</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .settings-loading {
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

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .settings-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          padding: 20px 24px;
          margin: 0;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .settings-group {
          padding: 0;
        }

        .setting-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
          margin-right: 24px;
        }

        .setting-label {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
          display: block;
        }

        .setting-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .setting-control {
          flex-shrink: 0;
        }

        .theme-options {
          display: flex;
          gap: 8px;
        }

        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 70px;
        }

        .theme-option:hover {
          border-color: var(--color-primary);
          color: var(--text-primary);
        }

        .theme-option.active {
          border-color: var(--color-primary);
          background-color: var(--color-primary);
          color: white;
        }

        .theme-icon {
          font-size: 1.25rem;
        }

        .form-select {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
          min-width: 150px;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: 0.3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--color-primary);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: var(--bg-hover);
        }

        .btn-danger {
          background-color: var(--color-danger);
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
        }

        .settings-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }

        .saving-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .saving-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .settings {
            padding: 16px;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .setting-info {
            margin-right: 0;
          }

          .theme-options {
            width: 100%;
            justify-content: space-between;
          }

          .theme-option {
            flex: 1;
          }
        }

        /* 主题变量 */
        .settings.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --bg-hover: #e9ecef;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --border-color: #dee2e6;
          --border-light: #f1f3f4;
          --color-primary: #667eea;
          --color-danger: #dc3545;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
        }

        .settings.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --bg-hover: #404040;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: #404040;
          --border-light: #555555;
          --color-primary: #667eea;
          --color-danger: #dc3545;
          --border-radius: 0.375rem;
          --border-radius-lg: 0.5rem;
        }
      `}</style>
    </div>
  );
};