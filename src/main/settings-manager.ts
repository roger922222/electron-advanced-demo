import Store from 'electron-store';
import { app, nativeTheme } from 'electron';
import log from 'electron-log';
import { AppSettings, APIResponse } from '@shared/types';

export class SettingsManager {
  private store: Store;
  private defaultSettings: AppSettings;

  constructor(store: Store) {
    this.store = store;
    
    // 默认设置
    this.defaultSettings = {
      theme: 'auto',
      language: 'zh-CN',
      autoStart: false,
      minimizeToTray: true,
      notifications: true,
      autoUpdate: true
    };

    this.initializeSettings();
  }

  /**
   * 初始化设置
   */
  private initializeSettings(): void {
    // 检查是否是首次运行
    if (!this.store.has('initialized')) {
      this.resetToDefaults();
      this.store.set('initialized', true);
      log.info('设置已初始化为默认值');
    }

    // 应用当前设置
    this.applySettings();
  }

  /**
   * 获取所有设置
   */
  public getSettings(): AppSettings {
    try {
      const settings: AppSettings = {
        theme: this.store.get('theme', this.defaultSettings.theme) as 'light' | 'dark' | 'auto',
        language: this.store.get('language', this.defaultSettings.language) as 'zh-CN' | 'en-US',
        autoStart: this.store.get('autoStart', this.defaultSettings.autoStart) as boolean,
        minimizeToTray: this.store.get('minimizeToTray', this.defaultSettings.minimizeToTray) as boolean,
        notifications: this.store.get('notifications', this.defaultSettings.notifications) as boolean,
        autoUpdate: this.store.get('autoUpdate', this.defaultSettings.autoUpdate) as boolean
      };

      return settings;
    } catch (error) {
      log.error('获取设置失败:', error);
      return this.defaultSettings;
    }
  }

  /**
   * 设置配置
   */
  public setSettings(newSettings: Partial<AppSettings>): APIResponse<AppSettings> {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };

      // 验证设置值
      const validationResult = this.validateSettings(updatedSettings);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `设置验证失败: ${validationResult.errors.join(', ')}`
        };
      }

      // 保存设置
      Object.entries(updatedSettings).forEach(([key, value]) => {
        this.store.set(key, value);
      });

      // 应用设置
      this.applySettings();

      log.info('设置已更新:', updatedSettings);
      return {
        success: true,
        data: updatedSettings,
        message: '设置保存成功'
      };
    } catch (error) {
      log.error('设置配置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取单个设置
   */
  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key, this.defaultSettings[key]) as AppSettings[K];
  }

  /**
   * 设置单个配置
   */
  public setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): APIResponse<boolean> {
    try {
      // 验证单个设置
      const tempSettings = { ...this.getSettings(), [key]: value };
      const validationResult = this.validateSettings(tempSettings);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `设置验证失败: ${validationResult.errors.join(', ')}`
        };
      }

      this.store.set(key, value);
      this.applySettings();

      log.info('单个设置已更新:', { key, value });
      return {
        success: true,
        data: true,
        message: '设置保存成功'
      };
    } catch (error) {
      log.error('设置单个配置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 重置为默认设置
   */
  public resetToDefaults(): APIResponse<AppSettings> {
    try {
      Object.entries(this.defaultSettings).forEach(([key, value]) => {
        this.store.set(key, value);
      });

      this.applySettings();

      log.info('设置已重置为默认值');
      return {
        success: true,
        data: this.defaultSettings,
        message: '设置已重置为默认值'
      };
    } catch (error) {
      log.error('重置设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 导出设置
   */
  public exportSettings(): APIResponse<string> {
    try {
      const settings = this.getSettings();
      const exportData = {
        version: app.getVersion(),
        timestamp: new Date().toISOString(),
        settings: settings
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      return {
        success: true,
        data: jsonString,
        message: '设置导出成功'
      };
    } catch (error) {
      log.error('导出设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 导入设置
   */
  public importSettings(jsonString: string): APIResponse<AppSettings> {
    try {
      const importData = JSON.parse(jsonString);
      
      if (!importData.settings) {
        throw new Error('无效的设置文件格式');
      }

      const validationResult = this.validateSettings(importData.settings);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `导入的设置无效: ${validationResult.errors.join(', ')}`
        };
      }

      // 导入设置
      Object.entries(importData.settings).forEach(([key, value]) => {
        if (key in this.defaultSettings) {
          this.store.set(key, value);
        }
      });

      this.applySettings();

      const newSettings = this.getSettings();
      log.info('设置导入成功:', newSettings);
      
      return {
        success: true,
        data: newSettings,
        message: '设置导入成功'
      };
    } catch (error) {
      log.error('导入设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '设置文件格式错误'
      };
    }
  }

  /**
   * 验证设置
   */
  private validateSettings(settings: AppSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证主题
    if (!['light', 'dark', 'auto'].includes(settings.theme)) {
      errors.push('主题设置无效');
    }

    // 验证语言
    if (!['zh-CN', 'en-US'].includes(settings.language)) {
      errors.push('语言设置无效');
    }

    // 验证布尔值
    if (typeof settings.autoStart !== 'boolean') {
      errors.push('自动启动设置必须是布尔值');
    }

    if (typeof settings.minimizeToTray !== 'boolean') {
      errors.push('最小化到托盘设置必须是布尔值');
    }

    if (typeof settings.notifications !== 'boolean') {
      errors.push('通知设置必须是布尔值');
    }

    if (typeof settings.autoUpdate !== 'boolean') {
      errors.push('自动更新设置必须是布尔值');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 应用设置
   */
  private applySettings(): void {
    const settings = this.getSettings();

    // 应用主题设置
    this.applyThemeSettings(settings.theme);

    // 应用自动启动设置
    this.applyAutoStartSettings(settings.autoStart);

    // 其他设置的应用逻辑可以在这里添加
    log.debug('设置已应用:', settings);
  }

  /**
   * 应用主题设置
   */
  private applyThemeSettings(theme: 'light' | 'dark' | 'auto'): void {
    try {
      switch (theme) {
        case 'light':
          nativeTheme.themeSource = 'light';
          break;
        case 'dark':
          nativeTheme.themeSource = 'dark';
          break;
        case 'auto':
          nativeTheme.themeSource = 'system';
          break;
      }
      log.debug('主题已应用:', theme);
    } catch (error) {
      log.error('应用主题设置失败:', error);
    }
  }

  /**
   * 应用自动启动设置
   */
  private applyAutoStartSettings(autoStart: boolean): void {
    try {
      if (process.platform === 'darwin' || process.platform === 'win32' || process.platform === 'linux') {
        app.setLoginItemSettings({
          openAtLogin: autoStart,
          openAsHidden: true
        });
        log.debug('自动启动设置已应用:', autoStart);
      }
    } catch (error) {
      log.error('应用自动启动设置失败:', error);
    }
  }

  /**
   * 获取设置存储路径
   */
  public getStorePath(): string {
    return this.store.path;
  }

  /**
   * 获取设置存储大小
   */
  public getStoreSize(): number {
    return this.store.size;
  }

  /**
   * 清空所有设置
   */
  public clearAllSettings(): APIResponse<boolean> {
    try {
      this.store.clear();
      this.resetToDefaults();
      
      log.info('所有设置已清空并重置');
      return {
        success: true,
        data: true,
        message: '所有设置已清空并重置为默认值'
      };
    } catch (error) {
      log.error('清空设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 监听设置变化
   */
  public onSettingsChange(callback: (newSettings: AppSettings, oldSettings: AppSettings) => void): void {
    let oldSettings = this.getSettings();

    this.store.onDidAnyChange(() => {
      const newSettings = this.getSettings();
      callback(newSettings, oldSettings);
      oldSettings = newSettings;
    });
  }

  /**
   * 获取设置统计信息
   */
  public getSettingsInfo(): any {
    return {
      storePath: this.getStorePath(),
      storeSize: this.getStoreSize(),
      initialized: this.store.get('initialized', false),
      settingsCount: Object.keys(this.getSettings()).length,
      defaultSettingsCount: Object.keys(this.defaultSettings).length
    };
  }

  /**
   * 备份设置
   */
  public backupSettings(): APIResponse<any> {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
        settings: this.getSettings(),
        storeInfo: this.getSettingsInfo()
      };

      return {
        success: true,
        data: backup,
        message: '设置备份成功'
      };
    } catch (error) {
      log.error('备份设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 恢复设置
   */
  public restoreSettings(backup: any): APIResponse<AppSettings> {
    try {
      if (!backup.settings) {
        throw new Error('无效的备份数据');
      }

      const validationResult = this.validateSettings(backup.settings);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `备份数据无效: ${validationResult.errors.join(', ')}`
        };
      }

      // 恢复设置
      Object.entries(backup.settings).forEach(([key, value]) => {
        if (key in this.defaultSettings) {
          this.store.set(key, value);
        }
      });

      this.applySettings();

      const restoredSettings = this.getSettings();
      log.info('设置恢复成功:', restoredSettings);

      return {
        success: true,
        data: restoredSettings,
        message: '设置恢复成功'
      };
    } catch (error) {
      log.error('恢复设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}