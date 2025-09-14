// 共享类型定义
export interface WindowConfig {
  id: string;
  title: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  show?: boolean;
  webPreferences?: {
    nodeIntegration?: boolean;
    contextIsolation?: boolean;
    enableRemoteModule?: boolean;
    preload?: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoStart: boolean;
  minimizeToTray: boolean;
  notifications: boolean;
  autoUpdate: boolean;
}

export interface DatabaseRecord {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  urgency?: 'normal' | 'critical' | 'low';
}

export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'copy' | 'move';
  path: string;
  data?: any;
  destination?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// IPC 通道定义
export const IPC_CHANNELS = {
  // 窗口管理
  WINDOW_CREATE: 'window:create',
  WINDOW_CLOSE: 'window:close',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_RESTORE: 'window:restore',
  WINDOW_FOCUS: 'window:focus',
  
  // 文件操作
  FILE_OPEN_DIALOG: 'file:open-dialog',
  FILE_SAVE_DIALOG: 'file:save-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_DELETE: 'file:delete',
  
  // 数据库操作
  DB_GET_ALL: 'db:get-all',
  DB_GET_BY_ID: 'db:get-by-id',
  DB_CREATE: 'db:create',
  DB_UPDATE: 'db:update',
  DB_DELETE: 'db:delete',
  
  // 系统操作
  SYSTEM_INFO: 'system:info',
  SYSTEM_NOTIFICATION: 'system:notification',
  SYSTEM_TRAY_UPDATE: 'system:tray-update',
  
  // 设置管理
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  
  // 应用更新
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',
  
  // 外部API
  API_REQUEST: 'api:request',
  
  // 应用控制
  APP_QUIT: 'app:quit',
  APP_RESTART: 'app:restart',
  APP_GET_VERSION: 'app:get-version',
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];