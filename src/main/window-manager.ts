import { BrowserWindow, screen, nativeTheme } from 'electron';
import path from 'path';
import log from 'electron-log';
import { WindowConfig } from '@shared/types';

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.setupThemeListener();
  }

  /**
   * 创建主窗口
   */
  public createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    const mainWindowConfig: WindowConfig = {
      id: 'main',
      title: 'Electron Advanced Demo - 主窗口',
      width: Math.min(1200, width - 100),
      height: Math.min(800, height - 100),
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload/preload.js')
      }
    };

    this.mainWindow = this.createWindow(mainWindowConfig);
    
    // 窗口准备显示时才显示，避免闪烁
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // 开发环境下打开开发者工具
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // 窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.windows.delete('main');
      this.mainWindow = null;
    });

    // 加载页面
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../renderer/index.html')}`;
    
    this.mainWindow.loadURL(url);

    log.info('主窗口已创建');
    return this.mainWindow;
  }

  /**
   * 创建通用窗口
   */
  public createWindow(config: WindowConfig): BrowserWindow {
    // 检查窗口是否已存在
    if (this.windows.has(config.id)) {
      const existingWindow = this.windows.get(config.id);
      if (existingWindow && !existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      }
    }

    const window = new BrowserWindow({
      width: config.width,
      height: config.height,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      title: config.title,
      show: config.show ?? true,
      resizable: config.resizable ?? true,
      maximizable: config.maximizable ?? true,
      minimizable: config.minimizable ?? true,
      center: true,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: config.webPreferences?.nodeIntegration ?? false,
        contextIsolation: config.webPreferences?.contextIsolation ?? true,
        enableRemoteModule: config.webPreferences?.enableRemoteModule ?? false,
        preload: config.webPreferences?.preload ?? path.join(__dirname, '../preload/preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    });

    // 设置窗口图标
    if (process.platform !== 'darwin') {
      window.setIcon(path.join(__dirname, '../assets/icon.png'));
    }

    // 存储窗口引用
    this.windows.set(config.id, window);

    // 窗口事件监听
    window.on('closed', () => {
      this.windows.delete(config.id);
      log.info(`窗口 ${config.id} 已关闭`);
    });

    window.on('focus', () => {
      log.debug(`窗口 ${config.id} 获得焦点`);
    });

    window.on('blur', () => {
      log.debug(`窗口 ${config.id} 失去焦点`);
    });

    // 防止窗口导航到外部链接
    window.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
        event.preventDefault();
      }
    });

    log.info(`窗口 ${config.id} 已创建`);
    return window;
  }

  /**
   * 创建设置窗口
   */
  public createSettingsWindow(): BrowserWindow {
    const settingsConfig: WindowConfig = {
      id: 'settings',
      title: 'Electron Advanced Demo - 设置',
      width: 600,
      height: 500,
      minWidth: 500,
      minHeight: 400,
      resizable: true,
      maximizable: false,
      show: false
    };

    const settingsWindow = this.createWindow(settingsConfig);
    
    settingsWindow.once('ready-to-show', () => {
      settingsWindow.show();
    });

    // 加载设置页面
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev 
      ? 'http://localhost:3000#/settings' 
      : `file://${path.join(__dirname, '../renderer/index.html#/settings')}`;
    
    settingsWindow.loadURL(url);

    return settingsWindow;
  }

  /**
   * 创建关于窗口
   */
  public createAboutWindow(): BrowserWindow {
    const aboutConfig: WindowConfig = {
      id: 'about',
      title: 'Electron Advanced Demo - 关于',
      width: 400,
      height: 300,
      minWidth: 400,
      minHeight: 300,
      resizable: false,
      maximizable: false,
      show: false
    };

    const aboutWindow = this.createWindow(aboutConfig);
    
    aboutWindow.once('ready-to-show', () => {
      aboutWindow.show();
    });

    // 加载关于页面
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev 
      ? 'http://localhost:3000#/about' 
      : `file://${path.join(__dirname, '../renderer/index.html#/about')}`;
    
    aboutWindow.loadURL(url);

    return aboutWindow;
  }

  /**
   * 获取窗口
   */
  public getWindow(id: string): BrowserWindow | undefined {
    return this.windows.get(id);
  }

  /**
   * 获取主窗口
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * 关闭窗口
   */
  public closeWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      window.close();
      return true;
    }
    return false;
  }

  /**
   * 最小化窗口
   */
  public minimizeWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      window.minimize();
      return true;
    }
    return false;
  }

  /**
   * 最大化窗口
   */
  public maximizeWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      return true;
    }
    return false;
  }

  /**
   * 恢复窗口
   */
  public restoreWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      window.restore();
      return true;
    }
    return false;
  }

  /**
   * 聚焦窗口
   */
  public focusWindow(id: string): boolean {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      window.focus();
      return true;
    }
    return false;
  }

  /**
   * 隐藏所有窗口
   */
  public hideAllWindows(): void {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.hide();
      }
    });
  }

  /**
   * 显示所有窗口
   */
  public showAllWindows(): void {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.show();
      }
    });
  }

  /**
   * 获取所有窗口信息
   */
  public getAllWindowsInfo(): Array<{id: string, title: string, isVisible: boolean, isFocused: boolean}> {
    const windowsInfo: Array<{id: string, title: string, isVisible: boolean, isFocused: boolean}> = [];
    
    this.windows.forEach((window, id) => {
      if (!window.isDestroyed()) {
        windowsInfo.push({
          id,
          title: window.getTitle(),
          isVisible: window.isVisible(),
          isFocused: window.isFocused()
        });
      }
    });

    return windowsInfo;
  }

  /**
   * 设置主题监听器
   */
  private setupThemeListener(): void {
    nativeTheme.on('updated', () => {
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      log.info(`系统主题已更改为: ${isDarkMode ? '深色' : '浅色'}`);
      
      // 通知所有窗口主题变化
      this.windows.forEach((window) => {
        if (!window.isDestroyed()) {
          window.webContents.send('theme-changed', isDarkMode);
        }
      });
    });
  }

  /**
   * 清理所有窗口
   */
  public cleanup(): void {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    });
    this.windows.clear();
    this.mainWindow = null;
  }
}