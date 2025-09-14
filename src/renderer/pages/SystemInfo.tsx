import React, { useState, useEffect } from 'react';

interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  uptime: number;
}

export const SystemInfo: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystemInfo = async () => {
      try {
        // 模拟系统信息数据
        const mockSystemInfo: SystemInfo = {
          platform: window.electronUtils.platform || 'unknown',
          arch: 'x64',
          nodeVersion: '20.11.0',
          electronVersion: '30.0.0',
          chromeVersion: '124.0.6367.243',
          memory: {
            total: 16 * 1024 * 1024 * 1024, // 16GB
            used: 8 * 1024 * 1024 * 1024,   // 8GB
            free: 8 * 1024 * 1024 * 1024    // 8GB
          },
          cpu: {
            model: 'Intel Core i7-9750H',
            cores: 8,
            usage: 25.5
          },
          uptime: 86400 // 1 day in seconds
        };

        // 如果有 Electron API，可以获取真实的系统信息
        if (window.electronAPI && window.electronAPI.getSystemInfo) {
          const realSystemInfo = await window.electronAPI.getSystemInfo();
          setSystemInfo(realSystemInfo);
        } else {
          setSystemInfo(mockSystemInfo);
        }
      } catch (error) {
        console.error('Failed to load system info:', error);
        // 使用模拟数据作为后备
        setSystemInfo({
          platform: 'unknown',
          arch: 'unknown',
          nodeVersion: 'unknown',
          electronVersion: 'unknown',
          chromeVersion: 'unknown',
          memory: { total: 0, used: 0, free: 0 },
          cpu: { model: 'unknown', cores: 0, usage: 0 },
          uptime: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadSystemInfo();

    // 定期更新系统信息
    const interval = setInterval(loadSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  const getPlatformName = (platform: string): string => {
    switch (platform) {
      case 'win32': return 'Windows';
      case 'darwin': return 'macOS';
      case 'linux': return 'Linux';
      default: return platform;
    }
  };

  if (loading) {
    return (
      <div className="system-info loading">
        <div className="loading-spinner">加载系统信息中...</div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="system-info error">
        <div className="error-message">无法获取系统信息</div>
      </div>
    );
  }

  const memoryUsagePercent = (systemInfo.memory.used / systemInfo.memory.total) * 100;

  return (
    <div className="system-info">
      <div className="system-info-header">
        <h2>系统信息</h2>
        <div className="refresh-info">
          <span>每5秒自动刷新</span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>基本信息</h3>
          <div className="info-item">
            <label>操作系统:</label>
            <span>{getPlatformName(systemInfo.platform)}</span>
          </div>
          <div className="info-item">
            <label>系统架构:</label>
            <span>{systemInfo.arch}</span>
          </div>
          <div className="info-item">
            <label>系统运行时间:</label>
            <span>{formatUptime(systemInfo.uptime)}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>运行环境</h3>
          <div className="info-item">
            <label>Node.js 版本:</label>
            <span>{systemInfo.nodeVersion}</span>
          </div>
          <div className="info-item">
            <label>Electron 版本:</label>
            <span>{systemInfo.electronVersion}</span>
          </div>
          <div className="info-item">
            <label>Chrome 版本:</label>
            <span>{systemInfo.chromeVersion}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>CPU 信息</h3>
          <div className="info-item">
            <label>处理器型号:</label>
            <span>{systemInfo.cpu.model}</span>
          </div>
          <div className="info-item">
            <label>核心数量:</label>
            <span>{systemInfo.cpu.cores} 核</span>
          </div>
          <div className="info-item">
            <label>CPU 使用率:</label>
            <span className="cpu-usage">{systemInfo.cpu.usage.toFixed(1)}%</span>
          </div>
          <div className="usage-bar">
            <div 
              className="usage-fill cpu-fill" 
              style={{ width: `${systemInfo.cpu.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="info-card">
          <h3>内存信息</h3>
          <div className="info-item">
            <label>总内存:</label>
            <span>{formatBytes(systemInfo.memory.total)}</span>
          </div>
          <div className="info-item">
            <label>已使用:</label>
            <span>{formatBytes(systemInfo.memory.used)}</span>
          </div>
          <div className="info-item">
            <label>可用内存:</label>
            <span>{formatBytes(systemInfo.memory.free)}</span>
          </div>
          <div className="info-item">
            <label>使用率:</label>
            <span className="memory-usage">{memoryUsagePercent.toFixed(1)}%</span>
          </div>
          <div className="usage-bar">
            <div 
              className="usage-fill memory-fill" 
              style={{ width: `${memoryUsagePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .system-info {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .system-info.loading,
        .system-info.error {
          justify-content: center;
          align-items: center;
        }

        .loading-spinner,
        .error-message {
          font-size: 18px;
          color: #666;
        }

        .system-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .system-info-header h2 {
          margin: 0;
          color: #333;
        }

        .refresh-info {
          color: #666;
          font-size: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          flex: 1;
        }

        .info-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .info-card h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
          border-bottom: 2px solid #2196f3;
          padding-bottom: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px 0;
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-item label {
          font-weight: bold;
          color: #555;
          min-width: 120px;
        }

        .info-item span {
          color: #333;
          text-align: right;
        }

        .cpu-usage {
          color: #ff9800 !important;
          font-weight: bold;
        }

        .memory-usage {
          color: #4caf50 !important;
          font-weight: bold;
        }

        .usage-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .usage-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .cpu-fill {
          background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
        }

        .memory-fill {
          background: linear-gradient(90deg, #4caf50, #2196f3);
        }

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .info-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .info-item span {
            text-align: left;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
};