import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';
import log from 'electron-log';

export class TrayManager {
  private tray: Tray | null = null;
  private contextMenu: Menu | null = null;

  /**
   * 创建系统托盘
   */
  public createTray(): void {
    // 创建托盘图标
    const iconPath = this.getTrayIconPath();
    const trayIcon = nativeImage.createFromPath(iconPath);
    
    // 调整图标大小 (macOS 需要16x16像素)
    if (process.platform === 'darwin') {
      trayIcon.setTemplateImage(true);
    }
    
    this.tray = new Tray(trayIcon);
    
    // 设置工具提示
    this.tray.setToolTip('Electron Advanced Demo');
    
    // 创建上下文菜单
    this.createContextMenu();
    
    // 设置托盘事件监听
    this.setupTrayEvents();
    
    log.info('系统托盘已创建');
  }

  /**
   * 创建托盘上下文菜单
   */
  private createContextMenu(): void {
    this.contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => this.showMainWindow()
      },
      {
        label: '隐藏主窗口',
        click: () => this.hideMainWindow()
      },
      { type: 'separator' },
      {
        label: '新建窗口',
        click: () => this.createNewWindow()
      },
      {
        label: '设置',
        click: () => this.openSettings()
      },
      { type: 'separator' },
      {
        label: '功能',
        submenu: [
          {
            label: '数据管理',
            click: () => this.openDataManager()
          },
          {
            label: '文件操作',
            click: () => this.openFileManager()
          },
          {
            label: '系统信息',
            click: () => this.showSystemInfo()
          },
          { type: 'separator' },
          {
            label: '发送测试通知',
            click: () => this.sendTestNotification()
          }
        ]
      },
      { type: 'separator' },
      {
        label: '检查更新',
        click: () => this.checkForUpdates()
      },
      {
        label: '关于',
        click: () => this.showAbout()
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => this.quitApplication()
      }
    ]);

    if (this.tray) {
      this.tray.setContextMenu(this.contextMenu);
    }
  }

  /**
   * 设置托盘事件监听
   */
  private setupTrayEvents(): void {
    if (!this.tray) return;

    // 单击托盘图标 (Windows/Linux)
    this.tray.on('click', () => {
      this.toggleMainWindow();
    });

    // 双击托盘图标
    this.tray.on('double-click', () => {
      this.showMainWindow();
    });

    // 右键点击 (Windows)
    this.tray.on('right-click', () => {
      if (this.tray && this.contextMenu) {
        this.tray.popUpContextMenu(this.contextMenu);
      }
    });

    // 鼠标悬停
    this.tray.on('mouse-enter', () => {
      if (this.tray) {
        this.tray.setToolTip('Electron Advanced Demo - 点击显示/隐藏窗口');
      }
    });

    this.tray.on('mouse-leave', () => {
      if (this.tray) {
        this.tray.setToolTip('Electron Advanced Demo');
      }
    });
  }

  /**
   * 获取托盘图标路径
   */
  private getTrayIconPath(): string {
    const platform = process.platform;
    let iconName = 'tray-icon.png';

    if (platform === 'darwin') {
      iconName = 'tray-iconTemplate.png'; // macOS 使用模板图标
    } else if (platform === 'win32') {
      iconName = 'tray-icon.ico'; // Windows 使用 ICO 格式
    }

    return path.join(__dirname, '../assets/tray', iconName);
  }

  /**
   * 显示主窗口
   */
  private showMainWindow(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    } else {
      // 如果没有窗口，创建新的主窗口
      this.createNewWindow();
    }
  }

  /**
   * 隐藏主窗口
   */
  private hideMainWindow(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.hide();
    }
  }

  /**
   * 切换主窗口显示/隐藏
   */
  private toggleMainWindow(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        this.showMainWindow();
      }
    } else {
      this.createNewWindow();
    }
  }

  /**
   * 创建新窗口
   */
  private createNewWindow(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('tray-action', { action: 'create-new-window' });
    } else {
      // 如果没有焦点窗口，直接创建主窗口
      // 这里应该调用 WindowManager 的方法，但为了简化，我们发送事件
      log.info('从托盘创建新窗口');
    }
  }

  /**
   * 打开设置
   */
  private openSettings(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'open-settings' });
      this.showMainWindow();
    }
  }

  /**
   * 打开数据管理器
   */
  private openDataManager(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'open-data-manager' });
      this.showMainWindow();
    }
  }

  /**
   * 打开文件管理器
   */
  private openFileManager(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'open-file-manager' });
      this.showMainWindow();
    }
  }

  /**
   * 显示系统信息
   */
  private showSystemInfo(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'show-system-info' });
      this.showMainWindow();
    }
  }

  /**
   * 发送测试通知
   */
  private sendTestNotification(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'send-test-notification' });
    }
  }

  /**
   * 检查更新
   */
  private checkForUpdates(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'check-updates' });
    }
  }

  /**
   * 显示关于信息
   */
  private showAbout(): void {
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (mainWindow) {
      mainWindow.webContents.send('tray-action', { action: 'show-about' });
      this.showMainWindow();
    }
  }

  /**
   * 退出应用程序
   */
  private quitApplication(): void {
    app.isQuiting = true;
    app.quit();
  }

  /**
   * 更新托盘图标
   */
  public updateTrayIcon(iconPath?: string): void {
    if (!this.tray) return;

    const newIconPath = iconPath || this.getTrayIconPath();
    const newIcon = nativeImage.createFromPath(newIconPath);
    
    if (process.platform === 'darwin') {
      newIcon.setTemplateImage(true);
    }
    
    this.tray.setImage(newIcon);
  }

  /**
   * 更新托盘工具提示
   */
  public updateTrayTooltip(tooltip: string): void {
    if (this.tray) {
      this.tray.setToolTip(tooltip);
    }
  }

  /**
   * 显示托盘气泡通知 (Windows)
   */
  public displayBalloon(title: string, content: string, icon?: string): void {
    if (this.tray && process.platform === 'win32') {
      const balloonIcon = icon ? nativeImage.createFromPath(icon) : undefined;
      this.tray.displayBalloon({
        title,
        content,
        icon: balloonIcon
      });
    }
  }

  /**
   * 更新上下文菜单
   */
  public updateContextMenu(template: Electron.MenuItemConstructorOptions[]): void {
    this.contextMenu = Menu.buildFromTemplate(template);
    if (this.tray) {
      this.tray.setContextMenu(this.contextMenu);
    }
  }

  /**
   * 设置托盘高亮状态 (macOS)
   */
  public setHighlightMode(mode: 'always' | 'never' | 'selection'): void {
    if (this.tray && process.platform === 'darwin') {
      this.tray.setHighlightMode(mode);
    }
  }

  /**
   * 获取托盘实例
   */
  public getTray(): Tray | null {
    return this.tray;
  }

  /**
   * 销毁托盘
   */
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
      this.contextMenu = null;
      log.info('系统托盘已销毁');
    }
  }

  /**
   * 检查托盘是否被销毁
   */
  public isDestroyed(): boolean {
    return this.tray ? this.tray.isDestroyed() : true;
  }
}