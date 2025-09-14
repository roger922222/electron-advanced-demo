import { Notification, nativeImage, systemPreferences } from 'electron';
import path from 'path';
import log from 'electron-log';
import { NotificationOptions, APIResponse } from '@shared/types';

export class NotificationManager {
  private notificationQueue: NotificationOptions[] = [];
  private isProcessingQueue = false;
  private maxQueueSize = 10;

  constructor() {
    this.setupNotificationHandlers();
  }

  /**
   * 请求通知权限 (macOS)
   */
  public async requestPermission(): Promise<boolean> {
    if (process.platform === 'darwin') {
      try {
        const status = await systemPreferences.askForMediaAccess('microphone');
        log.info('通知权限状态:', status);
        return status;
      } catch (error) {
        log.error('请求通知权限失败:', error);
        return false;
      }
    }
    return true; // 其他平台默认有权限
  }

  /**
   * 显示通知
   */
  public showNotification(options: NotificationOptions): APIResponse<boolean> {
    try {
      // 检查是否支持通知
      if (!Notification.isSupported()) {
        return {
          success: false,
          error: '当前系统不支持通知'
        };
      }

      // 添加到队列
      if (this.notificationQueue.length >= this.maxQueueSize) {
        // 队列满了，移除最旧的通知
        this.notificationQueue.shift();
      }

      this.notificationQueue.push(options);
      
      // 处理队列
      this.processNotificationQueue();

      return {
        success: true,
        data: true,
        message: '通知已发送'
      };
    } catch (error) {
      log.error('显示通知失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 显示系统通知
   */
  public showSystemNotification(title: string, body: string, icon?: string): APIResponse<boolean> {
    return this.showNotification({
      title,
      body,
      icon: icon || this.getDefaultIcon(),
      silent: false,
      urgency: 'normal'
    });
  }

  /**
   * 显示成功通知
   */
  public showSuccessNotification(title: string, body: string): APIResponse<boolean> {
    return this.showNotification({
      title: `✅ ${title}`,
      body,
      icon: this.getSuccessIcon(),
      silent: false,
      urgency: 'normal'
    });
  }

  /**
   * 显示错误通知
   */
  public showErrorNotification(title: string, body: string): APIResponse<boolean> {
    return this.showNotification({
      title: `❌ ${title}`,
      body,
      icon: this.getErrorIcon(),
      silent: false,
      urgency: 'critical'
    });
  }

  /**
   * 显示警告通知
   */
  public showWarningNotification(title: string, body: string): APIResponse<boolean> {
    return this.showNotification({
      title: `⚠️ ${title}`,
      body,
      icon: this.getWarningIcon(),
      silent: false,
      urgency: 'normal'
    });
  }

  /**
   * 显示信息通知
   */
  public showInfoNotification(title: string, body: string): APIResponse<boolean> {
    return this.showNotification({
      title: `ℹ️ ${title}`,
      body,
      icon: this.getInfoIcon(),
      silent: false,
      urgency: 'low'
    });
  }

  /**
   * 显示进度通知
   */
  public showProgressNotification(title: string, progress: number, total: number): APIResponse<boolean> {
    const percentage = Math.round((progress / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    
    return this.showNotification({
      title,
      body: `${progressBar} ${percentage}% (${progress}/${total})`,
      icon: this.getDefaultIcon(),
      silent: true,
      urgency: 'low'
    });
  }

  /**
   * 处理通知队列
   */
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.notificationQueue.length > 0) {
      const options = this.notificationQueue.shift();
      if (options) {
        await this.createAndShowNotification(options);
        // 添加延迟以避免通知过于频繁
        await this.delay(500);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * 创建并显示通知
   */
  private async createAndShowNotification(options: NotificationOptions): Promise<void> {
    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon ? this.createIconFromPath(options.icon) : this.getDefaultIcon(),
        silent: options.silent || false,
        urgency: options.urgency || 'normal',
        timeoutType: 'default'
      });

      // 设置通知事件监听
      notification.on('show', () => {
        log.debug('通知已显示:', options.title);
      });

      notification.on('click', () => {
        log.info('通知被点击:', options.title);
        // 可以在这里添加点击处理逻辑
        this.handleNotificationClick(options);
      });

      notification.on('close', () => {
        log.debug('通知已关闭:', options.title);
      });

      notification.on('reply', (event, reply) => {
        log.info('通知回复:', reply);
        // 处理通知回复
        this.handleNotificationReply(options, reply);
      });

      notification.on('action', (event, index) => {
        log.info('通知动作:', index);
        // 处理通知动作
        this.handleNotificationAction(options, index);
      });

      // 显示通知
      notification.show();

      log.info('通知已创建并显示:', options.title);
    } catch (error) {
      log.error('创建通知失败:', error);
    }
  }

  /**
   * 处理通知点击
   */
  private handleNotificationClick(options: NotificationOptions): void {
    // 可以根据通知类型执行不同的操作
    log.info('处理通知点击:', options.title);
    
    // 例如：显示主窗口、打开特定页面等
    // 这里可以发送 IPC 消息到渲染进程
  }

  /**
   * 处理通知回复
   */
  private handleNotificationReply(options: NotificationOptions, reply: string): void {
    log.info('处理通知回复:', { title: options.title, reply });
    
    // 处理用户回复
    // 可以保存回复、发送到服务器等
  }

  /**
   * 处理通知动作
   */
  private handleNotificationAction(options: NotificationOptions, actionIndex: number): void {
    log.info('处理通知动作:', { title: options.title, actionIndex });
    
    // 根据动作索引执行相应操作
    switch (actionIndex) {
      case 0:
        // 第一个动作
        break;
      case 1:
        // 第二个动作
        break;
      default:
        break;
    }
  }

  /**
   * 从路径创建图标
   */
  private createIconFromPath(iconPath: string): nativeImage.NativeImage {
    try {
      return nativeImage.createFromPath(iconPath);
    } catch (error) {
      log.error('创建图标失败:', error);
      return this.getDefaultIcon();
    }
  }

  /**
   * 获取默认图标
   */
  private getDefaultIcon(): nativeImage.NativeImage {
    const iconPath = path.join(__dirname, '../assets/icons/notification-default.png');
    return nativeImage.createFromPath(iconPath);
  }

  /**
   * 获取成功图标
   */
  private getSuccessIcon(): nativeImage.NativeImage {
    const iconPath = path.join(__dirname, '../assets/icons/notification-success.png');
    return nativeImage.createFromPath(iconPath);
  }

  /**
   * 获取错误图标
   */
  private getErrorIcon(): nativeImage.NativeImage {
    const iconPath = path.join(__dirname, '../assets/icons/notification-error.png');
    return nativeImage.createFromPath(iconPath);
  }

  /**
   * 获取警告图标
   */
  private getWarningIcon(): nativeImage.NativeImage {
    const iconPath = path.join(__dirname, '../assets/icons/notification-warning.png');
    return nativeImage.createFromPath(iconPath);
  }

  /**
   * 获取信息图标
   */
  private getInfoIcon(): nativeImage.NativeImage {
    const iconPath = path.join(__dirname, '../assets/icons/notification-info.png');
    return nativeImage.createFromPath(iconPath);
  }

  /**
   * 创建进度条
   */
  private createProgressBar(percentage: number): string {
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    
    return `[${filled}${empty}]`;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 设置通知处理器
   */
  private setupNotificationHandlers(): void {
    // 监听系统通知设置变化
    if (process.platform === 'darwin') {
      // macOS 特定的通知设置
    } else if (process.platform === 'win32') {
      // Windows 特定的通知设置
    }
  }

  /**
   * 检查通知权限
   */
  public hasNotificationPermission(): boolean {
    if (process.platform === 'darwin') {
      // macOS 需要检查权限
      return systemPreferences.getMediaAccessStatus('microphone') === 'granted';
    }
    
    // 其他平台默认有权限
    return true;
  }

  /**
   * 获取通知设置
   */
  public getNotificationSettings(): any {
    return {
      supported: Notification.isSupported(),
      hasPermission: this.hasNotificationPermission(),
      queueSize: this.notificationQueue.length,
      maxQueueSize: this.maxQueueSize,
      isProcessing: this.isProcessingQueue
    };
  }

  /**
   * 清空通知队列
   */
  public clearNotificationQueue(): void {
    this.notificationQueue = [];
    log.info('通知队列已清空');
  }

  /**
   * 设置最大队列大小
   */
  public setMaxQueueSize(size: number): void {
    this.maxQueueSize = Math.max(1, Math.min(50, size));
    
    // 如果当前队列超过新的最大大小，截断队列
    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue = this.notificationQueue.slice(0, this.maxQueueSize);
    }
    
    log.info('最大队列大小已设置为:', this.maxQueueSize);
  }

  /**
   * 批量发送通知
   */
  public showBatchNotifications(notifications: NotificationOptions[]): APIResponse<boolean> {
    try {
      let addedCount = 0;
      
      for (const notification of notifications) {
        if (this.notificationQueue.length < this.maxQueueSize) {
          this.notificationQueue.push(notification);
          addedCount++;
        } else {
          break;
        }
      }

      this.processNotificationQueue();

      return {
        success: true,
        data: true,
        message: `已添加 ${addedCount} 个通知到队列`
      };
    } catch (error) {
      log.error('批量发送通知失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}