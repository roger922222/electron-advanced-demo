import { Menu, MenuItem, MenuItemConstructorOptions, app, shell, dialog, BrowserWindow } from 'electron';
import log from 'electron-log';

export class MenuManager {
  private applicationMenu: Menu | null = null;

  /**
   * 创建应用程序菜单
   */
  public createApplicationMenu(): void {
    const template = this.getMenuTemplate();
    this.applicationMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.applicationMenu);
    log.info('应用程序菜单已创建');
  }

  /**
   * 创建上下文菜单
   */
  public createContextMenu(options: {
    cut?: boolean;
    copy?: boolean;
    paste?: boolean;
    selectAll?: boolean;
    separator?: boolean;
    customItems?: MenuItemConstructorOptions[];
  }): Menu {
    const template: MenuItemConstructorOptions[] = [];

    if (options.cut) {
      template.push({
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      });
    }

    if (options.copy) {
      template.push({
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      });
    }

    if (options.paste) {
      template.push({
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      });
    }

    if (options.selectAll) {
      template.push({
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll'
      });
    }

    if (options.separator && template.length > 0) {
      template.push({ type: 'separator' });
    }

    if (options.customItems) {
      template.push(...options.customItems);
    }

    return Menu.buildFromTemplate(template);
  }

  /**
   * 获取菜单模板
   */
  private getMenuTemplate(): MenuItemConstructorOptions[] {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
      // 应用程序菜单 (macOS)
      ...(isMac ? [{
        label: app.getName(),
        submenu: [
          {
            label: `关于 ${app.getName()}`,
            click: () => this.showAboutDialog()
          },
          { type: 'separator' as const },
          {
            label: '偏好设置...',
            accelerator: 'Cmd+,',
            click: () => this.openSettings()
          },
          { type: 'separator' as const },
          {
            label: '服务',
            role: 'services' as const
          },
          { type: 'separator' as const },
          {
            label: `隐藏 ${app.getName()}`,
            accelerator: 'Cmd+H',
            role: 'hide' as const
          },
          {
            label: '隐藏其他',
            accelerator: 'Cmd+Alt+H',
            role: 'hideothers' as const
          },
          {
            label: '显示全部',
            role: 'unhide' as const
          },
          { type: 'separator' as const },
          {
            label: '退出',
            accelerator: 'Cmd+Q',
            click: () => app.quit()
          }
        ]
      }] : []),

      // 文件菜单
      {
        label: '文件',
        submenu: [
          {
            label: '新建',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.createNewDocument()
          },
          {
            label: '打开...',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.openFile()
          },
          { type: 'separator' },
          {
            label: '保存',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.saveFile()
          },
          {
            label: '另存为...',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.saveFileAs()
          },
          { type: 'separator' },
          {
            label: '导入数据',
            click: () => this.importData()
          },
          {
            label: '导出数据',
            click: () => this.exportData()
          },
          { type: 'separator' },
          ...(isMac ? [] : [
            {
              label: '偏好设置',
              accelerator: 'Ctrl+,',
              click: () => this.openSettings()
            },
            { type: 'separator' as const }
          ]),
          {
            label: isMac ? '关闭窗口' : '退出',
            accelerator: isMac ? 'Cmd+W' : 'Ctrl+Q',
            click: () => {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                if (isMac) {
                  focusedWindow.close();
                } else {
                  app.quit();
                }
              }
            }
          }
        ]
      },

      // 编辑菜单
      {
        label: '编辑',
        submenu: [
          {
            label: '撤销',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
          },
          {
            label: '重做',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
          },
          { type: 'separator' },
          {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
          },
          {
            label: '全选',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectAll'
          },
          { type: 'separator' },
          {
            label: '查找',
            accelerator: 'CmdOrCtrl+F',
            click: () => this.showFind()
          },
          {
            label: '替换',
            accelerator: 'CmdOrCtrl+H',
            click: () => this.showReplace()
          }
        ]
      },

      // 视图菜单
      {
        label: '视图',
        submenu: [
          {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R',
            click: (item, focusedWindow) => {
              if (focusedWindow) focusedWindow.reload();
            }
          },
          {
            label: '强制重新加载',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: (item, focusedWindow) => {
              if (focusedWindow) focusedWindow.webContents.reloadIgnoringCache();
            }
          },
          {
            label: '切换开发者工具',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
          },
          { type: 'separator' },
          {
            label: '实际大小',
            accelerator: 'CmdOrCtrl+0',
            click: (item, focusedWindow) => {
              if (focusedWindow) focusedWindow.webContents.zoomLevel = 0;
            }
          },
          {
            label: '放大',
            accelerator: 'CmdOrCtrl+Plus',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                const currentZoom = focusedWindow.webContents.zoomLevel;
                focusedWindow.webContents.zoomLevel = currentZoom + 0.5;
              }
            }
          },
          {
            label: '缩小',
            accelerator: 'CmdOrCtrl+-',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                const currentZoom = focusedWindow.webContents.zoomLevel;
                focusedWindow.webContents.zoomLevel = currentZoom - 0.5;
              }
            }
          },
          { type: 'separator' },
          {
            label: '切换全屏',
            accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          },
          {
            label: '主题',
            submenu: [
              {
                label: '浅色主题',
                type: 'radio',
                click: () => this.setTheme('light')
              },
              {
                label: '深色主题',
                type: 'radio',
                click: () => this.setTheme('dark')
              },
              {
                label: '跟随系统',
                type: 'radio',
                checked: true,
                click: () => this.setTheme('auto')
              }
            ]
          }
        ]
      },

      // 窗口菜单
      {
        label: '窗口',
        submenu: [
          {
            label: '最小化',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
          },
          {
            label: '关闭',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
          },
          { type: 'separator' },
          {
            label: '新建窗口',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: () => this.createNewWindow()
          },
          {
            label: '设置窗口',
            click: () => this.openSettings()
          },
          { type: 'separator' },
          {
            label: '置于前面',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop());
                item.checked = focusedWindow.isAlwaysOnTop();
              }
            },
            type: 'checkbox'
          }
        ]
      },

      // 帮助菜单
      {
        label: '帮助',
        submenu: [
          {
            label: '学习更多',
            click: () => shell.openExternal('https://electronjs.org')
          },
          {
            label: 'GitHub 仓库',
            click: () => shell.openExternal('https://github.com/electron/electron')
          },
          { type: 'separator' },
          {
            label: '键盘快捷键',
            click: () => this.showKeyboardShortcuts()
          },
          {
            label: '检查更新',
            click: () => this.checkForUpdates()
          },
          { type: 'separator' },
          ...(!isMac ? [{
            label: `关于 ${app.getName()}`,
            click: () => this.showAboutDialog()
          }] : [])
        ]
      }
    ];

    return template;
  }

  // 菜单项点击处理方法
  private createNewDocument(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'new-document' });
    }
  }

  private async openFile(): Promise<void> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: '所有文件', extensions: ['*'] },
        { name: '文本文件', extensions: ['txt', 'md'] },
        { name: 'JSON 文件', extensions: ['json'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.send('menu-action', { 
          action: 'open-file', 
          filePath: result.filePaths[0] 
        });
      }
    }
  }

  private saveFile(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'save-file' });
    }
  }

  private async saveFileAs(): Promise<void> {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: '文本文件', extensions: ['txt'] },
        { name: 'JSON 文件', extensions: ['json'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.send('menu-action', { 
          action: 'save-file-as', 
          filePath: result.filePath 
        });
      }
    }
  }

  private importData(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'import-data' });
    }
  }

  private exportData(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'export-data' });
    }
  }

  private openSettings(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'open-settings' });
    }
  }

  private showFind(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'show-find' });
    }
  }

  private showReplace(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'show-replace' });
    }
  }

  private setTheme(theme: 'light' | 'dark' | 'auto'): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'set-theme', theme });
    }
  }

  private createNewWindow(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'create-new-window' });
    }
  }

  private showKeyboardShortcuts(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'show-keyboard-shortcuts' });
    }
  }

  private checkForUpdates(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('menu-action', { action: 'check-updates' });
    }
  }

  private showAboutDialog(): void {
    dialog.showMessageBox({
      type: 'info',
      title: '关于',
      message: `${app.getName()}`,
      detail: `版本: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nChrome: ${process.versions.chrome}`,
      buttons: ['确定']
    });
  }

  /**
   * 更新菜单项状态
   */
  public updateMenuItemState(menuId: string, enabled: boolean): void {
    if (this.applicationMenu) {
      const menuItem = this.applicationMenu.getMenuItemById(menuId);
      if (menuItem) {
        menuItem.enabled = enabled;
      }
    }
  }

  /**
   * 获取应用程序菜单
   */
  public getApplicationMenu(): Menu | null {
    return this.applicationMenu;
  }
}