import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell, systemPreferences } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { WindowManager } from './window-manager';
import { MenuManager } from './menu-manager';
import { TrayManager } from './tray-manager';
import { DatabaseManager } from './database-manager';
import { FileManager } from './file-manager';
import { NotificationManager } from './notification-manager';
import { SettingsManager } from './settings-manager';
import { APIManager } from './api-manager';
import { IPC_CHANNELS, AppSettings } from '@shared/types';

class ElectronApp {
  private windowManager: WindowManager;
  private menuManager: MenuManager;
  private trayManager: TrayManager;
  private databaseManager: DatabaseManager;
  private fileManager: FileManager;
  private notificationManager: NotificationManager;
  private settingsManager: SettingsManager;
  private apiManager: APIManager;
  private store: Store;

  constructor() {
    // 配置日志
    log.transports.file.level = 'info';
    log.transports.console.level = 'debug';
    
    // 初始化存储
    this.store = new Store();
    
    // 初始化管理器
    this.windowManager = new WindowManager();
    this.menuManager = new MenuManager();
    this.trayManager = new TrayManager();
    this.databaseManager = new DatabaseManager();
    this.fileManager = new FileManager();
    this.notificationManager = new NotificationManager();
    this.settingsManager = new SettingsManager(this.store);
    this.apiManager = new APIManager();

    this.initializeApp();
  }

  private initializeApp(): void {
    // 设置应用用户模型ID (Windows)
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.electron.advanced-demo');
    }

    // 应用事件监听
    app.whenReady().then(() => {
      this.onReady();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow();
      }
    });

    app.on('before-quit', (event) => {
      const settings = this.settingsManager.getSettings();
      if (settings.minimizeToTray && !app.isQuiting) {
        event.preventDefault();
        this.windowManager.hideAllWindows();
      }
    });

    // 安全设置
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });

      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
          event.preventDefault();
        }
      });
    });

    // 自动更新配置
    this.setupAutoUpdater();
    
    // IPC 通信设置
    this.setupIPC();
  }

  private async onReady(): Promise<void> {
    log.info('应用程序已准备就绪');

    // 初始化数据库
    await this.databaseManager.initialize();

    // 创建主窗口
    this.windowManager.createMainWindow();

    // 设置菜单
    this.menuManager.createApplicationMenu();

    // 创建系统托盘
    this.trayManager.createTray();

    // 请求通知权限 (macOS)
    if (process.platform === 'darwin') {
      await this.notificationManager.requestPermission();
    }

    // 检查更新
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdatesAndNotify();
    }

    // 显示欢迎通知
    this.notificationManager.showNotification({
      title: 'Electron Advanced Demo',
      body: '应用程序已成功启动！',
      icon: path.join(__dirname, '../assets/icon.png')
    });
  }

  private setupAutoUpdater(): void {
    autoUpdater.logger = log;
    
    autoUpdater.on('checking-for-update', () => {
      log.info('正在检查更新...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('发现新版本:', info.version);
      this.notificationManager.showNotification({
        title: '发现新版本',
        body: `版本 ${info.version} 可用，正在下载...`
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('当前已是最新版本:', info.version);
    });

    autoUpdater.on('error', (err) => {
      log.error('自动更新错误:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `下载速度: ${progressObj.bytesPerSecond}`;
      logMessage += ` - 已下载 ${progressObj.percent}%`;
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
      log.info(logMessage);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('更新下载完成:', info.version);
      this.notificationManager.showNotification({
        title: '更新已下载',
        body: '重启应用程序以应用更新'
      });
    });
  }

  private setupIPC(): void {
    // 窗口管理
    ipcMain.handle(IPC_CHANNELS.WINDOW_CREATE, async (event, config) => {
      return this.windowManager.createWindow(config);
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (event, windowId) => {
      return this.windowManager.closeWindow(windowId);
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, async (event, windowId) => {
      return this.windowManager.minimizeWindow(windowId);
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, async (event, windowId) => {
      return this.windowManager.maximizeWindow(windowId);
    });

    // 文件操作
    ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, async () => {
      return this.fileManager.openFileDialog();
    });

    ipcMain.handle(IPC_CHANNELS.FILE_SAVE_DIALOG, async () => {
      return this.fileManager.saveFileDialog();
    });

    ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, filePath) => {
      return this.fileManager.readFile(filePath);
    });

    ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (event, filePath, data) => {
      return this.fileManager.writeFile(filePath, data);
    });

    // 数据库操作
    ipcMain.handle(IPC_CHANNELS.DB_GET_ALL, async () => {
      return this.databaseManager.getAllRecords();
    });

    ipcMain.handle(IPC_CHANNELS.DB_CREATE, async (event, data) => {
      return this.databaseManager.createRecord(data);
    });

    ipcMain.handle(IPC_CHANNELS.DB_UPDATE, async (event, id, data) => {
      return this.databaseManager.updateRecord(id, data);
    });

    ipcMain.handle(IPC_CHANNELS.DB_DELETE, async (event, id) => {
      return this.databaseManager.deleteRecord(id);
    });

    // 系统操作
    ipcMain.handle(IPC_CHANNELS.SYSTEM_INFO, async () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node
      };
    });

    ipcMain.handle(IPC_CHANNELS.SYSTEM_NOTIFICATION, async (event, options) => {
      return this.notificationManager.showNotification(options);
    });

    // 设置管理
    ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
      return this.settingsManager.getSettings();
    });

    ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (event, settings) => {
      return this.settingsManager.setSettings(settings);
    });

    // API 请求
    ipcMain.handle(IPC_CHANNELS.API_REQUEST, async (event, config) => {
      return this.apiManager.makeRequest(config);
    });

    // 应用控制
    ipcMain.handle(IPC_CHANNELS.APP_QUIT, async () => {
      app.isQuiting = true;
      app.quit();
    });

    ipcMain.handle(IPC_CHANNELS.APP_RESTART, async () => {
      app.relaunch();
      app.exit();
    });

    ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, async () => {
      return app.getVersion();
    });

    // 更新操作
    ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async () => {
      return autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.handle(IPC_CHANNELS.UPDATE_DOWNLOAD, async () => {
      return autoUpdater.downloadUpdate();
    });

    ipcMain.handle(IPC_CHANNELS.UPDATE_INSTALL, async () => {
      return autoUpdater.quitAndInstall();
    });
  }
}

// 创建应用实例
new ElectronApp();

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  log.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('未处理的Promise拒绝:', reason);
});