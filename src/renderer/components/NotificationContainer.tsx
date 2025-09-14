import React, { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const { actualTheme } = useTheme();

  // 自动移除过期通知
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timeElapsed = Date.now() - notification.timestamp.getTime();
        if (timeElapsed >= notification.duration) {
          removeNotification(notification.id);
        }
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`notification-container ${actualTheme}`}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            {notification.message && (
              <div className="notification-message">{notification.message}</div>
            )}
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}

      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          pointer-events: none;
        }

        .notification {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: slideIn 0.3s ease-out;
          pointer-events: auto;
          position: relative;
          overflow: hidden;
        }

        .notification:hover {
          transform: translateX(-4px);
          box-shadow: var(--shadow-xl);
        }

        .notification::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--accent-color);
        }

        .notification-success {
          --accent-color: var(--color-success);
          --icon-color: var(--color-success);
        }

        .notification-error {
          --accent-color: var(--color-danger);
          --icon-color: var(--color-danger);
        }

        .notification-warning {
          --accent-color: var(--color-warning);
          --icon-color: var(--color-warning);
        }

        .notification-info {
          --accent-color: var(--color-info);
          --icon-color: var(--color-info);
        }

        .notification-icon {
          font-size: 20px;
          color: var(--icon-color);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .notification-message {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          word-wrap: break-word;
        }

        .notification-close {
          width: 24px;
          height: 24px;
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
        }

        .notification-close:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .notification-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .notification {
            padding: 12px;
          }

          .notification-title {
            font-size: 13px;
          }

          .notification-message {
            font-size: 12px;
          }
        }

        /* 主题变量 */
        .notification-container.light {
          --bg-primary: #ffffff;
          --bg-hover: #f1f3f4;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #868e96;
          --border-color: #dee2e6;
          --color-success: #28a745;
          --color-danger: #dc3545;
          --color-warning: #ffc107;
          --color-info: #17a2b8;
          --border-radius-lg: 0.5rem;
          --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
          --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .notification-container.dark {
          --bg-primary: #2d2d2d;
          --bg-hover: #404040;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --text-muted: #888888;
          --border-color: #404040;
          --color-success: #28a745;
          --color-danger: #dc3545;
          --color-warning: #ffc107;
          --color-info: #17a2b8;
          --border-radius-lg: 0.5rem;
          --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
          --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
};

// 获取通知图标
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};