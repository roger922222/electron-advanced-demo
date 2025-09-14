import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, WindowConfig, NotificationOptions, FileOperation, AppSettings, APIResponse } from '@shared/types';

// 定义暴露给渲染进程的API接口
interface ElectronAPI {
  // 窗口管理
  window: {
    create: (config: WindowConfig) => Promise<any>;
    close: (windowId: string) => Promise<boolean>;
    minimize: (windowId: string) => Promise<boolean>;
    maximize: (windowId: string) => Promise<boolean>;
    restore: (windowId: string) => Promise<boolean>;
    focus: (windowId: string) => Promise<boolean>;
  };

  // 文件操作
  file: {
    openDialog: () => Promise<APIResponse<string[]>>;
    saveDialog: () => Promise<APIResponse<string>>;
    read: (filePath: string) => Promise<APIResponse<string>>;
    write: (filePath: string, data: string) => Promise<APIResponse<boolean>>;
    delete: (filePath: string) => Promise<APIResponse<boolean>>;
    executeOperation: (operation: FileOperation) => Promise<APIResponse<any>>;
  };

  // 数据库操作
  database: {
    getAll: () => Promise<APIResponse<any[]>>;
    getById: (id: number) => Promise<APIResponse<any>>;
    create: (data: any) => Promise<APIResponse<any>>;
    update: (id: number, data: any) => Promise<APIResponse<any>>;
    delete: (id: number) => Promise<APIResponse<boolean>>;
  };

  // 系统操作
  system: {
    getInfo: () => Promise<any>;
    showNotification: (options: NotificationOptions) => Promise<APIResponse<boolean>>;
    updateTray: (options: any) => Promise<void>;
  };

  // 设置管理
  settings: {
    get: () => Promise<AppSettings>;
    set: (settings: Partial<AppSettings>) => Promise<APIResponse<AppSettings>>;
    reset: () => Promise<APIResponse<AppSettings>>;
  };

  // API请求
  api: {
    request: (config: any) => Promise<APIResponse<any>>;
  };

  // 应用控制
  app: {
    quit: () => Promise<void>;
    restart: () => Promise<void>;
    getVersion: () => Promise<string>;
  };

  // 更新管理
  updater: {
    check: () => Promise<any>;
    download: () => Promise<any>;
    install: () => Promise<any>;
  };

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
  once: (channel: string, callback: (...args: any[]) => void) => void;

  // 发送事件
  send: (channel: string, ...args: any[]) => void;
}

// 实现API
const electronAPI: ElectronAPI = {
  // 窗口管理
  window: {
    create: (config: WindowConfig) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CREATE, config),
    close: (windowId: string) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE, windowId),
    minimize: (windowId: string) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE, windowId),
    maximize: (windowId: string) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE, windowId),
    restore: (windowId: string) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_RESTORE, windowId),
    focus: (windowId: string) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_FOCUS, windowId),
  },

  // 文件操作
  file: {
    openDialog: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_DIALOG),
    saveDialog: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_DIALOG),
    read: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath),
    write: (filePath: string, data: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, filePath, data),
    delete: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, filePath),
    executeOperation: (operation: FileOperation) => ipcRenderer.invoke('file:execute-operation', operation),
  },

  // 数据库操作
  database: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_ALL),
    getById: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_BY_ID, id),
    create: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.DB_CREATE, data),
    update: (id: number, data: any) => ipcRenderer.invoke(IPC_CHANNELS.DB_UPDATE, id, data),
    delete: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DB_DELETE, id),
  },

  // 系统操作
  system: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_INFO),
    showNotification: (options: NotificationOptions) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_NOTIFICATION, options),
    updateTray: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_TRAY_UPDATE, options),
  },

  // 设置管理
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings: Partial<AppSettings>) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
  },

  // API请求
  api: {
    request: (config: any) => ipcRenderer.invoke(IPC_CHANNELS.API_REQUEST, config),
  },

  // 应用控制
  app: {
    quit: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),
    restart: () => ipcRenderer.invoke(IPC_CHANNELS.APP_RESTART),
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  },

  // 更新管理
  updater: {
    check: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
    download: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_DOWNLOAD),
    install: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_INSTALL),
  },

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    // 验证通道名称以确保安全
    const validChannels = [
      'menu-action',
      'tray-action',
      'theme-changed',
      'settings-changed',
      'update-available',
      'update-downloaded',
      'notification-clicked',
      'window-focus',
      'window-blur',
      'app-ready',
      'file-dropped'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    } else {
      console.warn(`尝试监听未授权的通道: ${channel}`);
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  },

  once: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'menu-action',
      'tray-action',
      'theme-changed',
      'settings-changed',
      'update-available',
      'update-downloaded',
      'notification-clicked',
      'window-focus',
      'window-blur',
      'app-ready',
      'file-dropped'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, callback);
    } else {
      console.warn(`尝试监听未授权的通道: ${channel}`);
    }
  },

  // 发送事件
  send: (channel: string, ...args: any[]) => {
    const validChannels = [
      'renderer-ready',
      'window-action',
      'user-action',
      'app-event'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`尝试发送到未授权的通道: ${channel}`);
    }
  }
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 暴露一些常用的工具函数
contextBridge.exposeInMainWorld('electronUtils', {
  // 平台检测
  platform: process.platform,
  
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // 环境变量
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // 路径工具
  path: {
    join: (...paths: string[]) => {
      // 简单的路径连接实现
      return paths.join('/').replace(/\/+/g, '/');
    },
    
    basename: (path: string) => {
      return path.split('/').pop() || '';
    },
    
    dirname: (path: string) => {
      const parts = path.split('/');
      parts.pop();
      return parts.join('/') || '/';
    },
    
    extname: (path: string) => {
      const basename = path.split('/').pop() || '';
      const dotIndex = basename.lastIndexOf('.');
      return dotIndex > 0 ? basename.substring(dotIndex) : '';
    }
  },

  // 格式化工具
  format: {
    fileSize: (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    date: (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    duration: (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
      } else if (minutes > 0) {
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
      } else {
        return `${seconds}s`;
      }
    }
  },

  // 验证工具
  validate: {
    email: (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    
    url: (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    
    filePath: (path: string) => {
      // 简单的文件路径验证
      return path.length > 0 && !path.includes('..') && !path.startsWith('/');
    }
  },

  // 调试工具
  debug: {
    log: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Renderer Debug]', ...args);
      }
    },
    
    error: (...args: any[]) => {
      console.error('[Renderer Error]', ...args);
    },
    
    warn: (...args: any[]) => {
      console.warn('[Renderer Warning]', ...args);
    }
  }
});

// 在窗口加载完成后通知主进程
window.addEventListener('DOMContentLoaded', () => {
  electronAPI.send('renderer-ready');
});

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('渲染进程错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});

// 类型声明（用于TypeScript）
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electronUtils: any;
  }
}