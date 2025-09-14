import { dialog, shell, app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import log from 'electron-log';
import { FileOperation, APIResponse } from '@shared/types';

export class FileManager {
  private recentFiles: string[] = [];
  private maxRecentFiles = 10;

  constructor() {
    this.loadRecentFiles();
  }

  /**
   * 显示打开文件对话框
   */
  public async openFileDialog(options?: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Electron.FileFilter[];
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
  }): Promise<APIResponse<string[]>> {
    try {
      const result = await dialog.showOpenDialog({
        title: options?.title || '选择文件',
        defaultPath: options?.defaultPath || app.getPath('documents'),
        buttonLabel: options?.buttonLabel || '打开',
        filters: options?.filters || [
          { name: '所有文件', extensions: ['*'] },
          { name: '文本文件', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'css'] },
          { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
          { name: '文档文件', extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] }
        ],
        properties: options?.properties || ['openFile', 'multiSelections']
      });

      if (result.canceled) {
        return {
          success: false,
          error: '用户取消了文件选择'
        };
      }

      // 添加到最近文件列表
      result.filePaths.forEach(filePath => {
        this.addToRecentFiles(filePath);
      });

      log.info('文件选择完成:', result.filePaths);
      return {
        success: true,
        data: result.filePaths
      };
    } catch (error) {
      log.error('打开文件对话框失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 显示保存文件对话框
   */
  public async saveFileDialog(options?: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Electron.FileFilter[];
  }): Promise<APIResponse<string>> {
    try {
      const result = await dialog.showSaveDialog({
        title: options?.title || '保存文件',
        defaultPath: options?.defaultPath || path.join(app.getPath('documents'), 'untitled.txt'),
        buttonLabel: options?.buttonLabel || '保存',
        filters: options?.filters || [
          { name: '文本文件', extensions: ['txt'] },
          { name: 'JSON 文件', extensions: ['json'] },
          { name: 'Markdown 文件', extensions: ['md'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return {
          success: false,
          error: '用户取消了文件保存'
        };
      }

      log.info('保存路径选择完成:', result.filePath);
      return {
        success: true,
        data: result.filePath
      };
    } catch (error) {
      log.error('保存文件对话框失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 读取文件
   */
  public async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<APIResponse<string>> {
    try {
      // 检查文件是否存在
      await fs.access(filePath);

      const content = await fs.readFile(filePath, encoding);
      
      // 添加到最近文件列表
      this.addToRecentFiles(filePath);

      log.info('文件读取成功:', filePath);
      return {
        success: true,
        data: content
      };
    } catch (error) {
      log.error('读取文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 写入文件
   */
  public async writeFile(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<APIResponse<boolean>> {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, data, encoding);
      
      // 添加到最近文件列表
      this.addToRecentFiles(filePath);

      log.info('文件写入成功:', filePath);
      return {
        success: true,
        data: true,
        message: '文件保存成功'
      };
    } catch (error) {
      log.error('写入文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 删除文件
   */
  public async deleteFile(filePath: string): Promise<APIResponse<boolean>> {
    try {
      await fs.unlink(filePath);
      
      // 从最近文件列表中移除
      this.removeFromRecentFiles(filePath);

      log.info('文件删除成功:', filePath);
      return {
        success: true,
        data: true,
        message: '文件删除成功'
      };
    } catch (error) {
      log.error('删除文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 复制文件
   */
  public async copyFile(sourcePath: string, destinationPath: string): Promise<APIResponse<boolean>> {
    try {
      // 确保目标目录存在
      const dir = path.dirname(destinationPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.copyFile(sourcePath, destinationPath);

      log.info('文件复制成功:', { sourcePath, destinationPath });
      return {
        success: true,
        data: true,
        message: '文件复制成功'
      };
    } catch (error) {
      log.error('复制文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 移动文件
   */
  public async moveFile(sourcePath: string, destinationPath: string): Promise<APIResponse<boolean>> {
    try {
      // 确保目标目录存在
      const dir = path.dirname(destinationPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.rename(sourcePath, destinationPath);
      
      // 更新最近文件列表
      this.removeFromRecentFiles(sourcePath);
      this.addToRecentFiles(destinationPath);

      log.info('文件移动成功:', { sourcePath, destinationPath });
      return {
        success: true,
        data: true,
        message: '文件移动成功'
      };
    } catch (error) {
      log.error('移动文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取文件信息
   */
  public async getFileInfo(filePath: string): Promise<APIResponse<any>> {
    try {
      const stats = await fs.stat(filePath);
      const hash = await this.calculateFileHash(filePath);

      const fileInfo = {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        hash: hash
      };

      return {
        success: true,
        data: fileInfo
      };
    } catch (error) {
      log.error('获取文件信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 列出目录内容
   */
  public async listDirectory(dirPath: string): Promise<APIResponse<any[]>> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      const items = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          try {
            const stats = await fs.stat(fullPath);
            return {
              name: entry.name,
              path: fullPath,
              isFile: entry.isFile(),
              isDirectory: entry.isDirectory(),
              size: entry.isFile() ? stats.size : null,
              modified: stats.mtime
            };
          } catch (error) {
            return {
              name: entry.name,
              path: fullPath,
              isFile: entry.isFile(),
              isDirectory: entry.isDirectory(),
              size: null,
              modified: null,
              error: '无法访问'
            };
          }
        })
      );

      return {
        success: true,
        data: items
      };
    } catch (error) {
      log.error('列出目录内容失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 在文件管理器中显示文件
   */
  public async showInFileManager(filePath: string): Promise<APIResponse<boolean>> {
    try {
      shell.showItemInFolder(filePath);
      return {
        success: true,
        data: true,
        message: '已在文件管理器中显示'
      };
    } catch (error) {
      log.error('在文件管理器中显示失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 用默认程序打开文件
   */
  public async openWithDefaultApp(filePath: string): Promise<APIResponse<boolean>> {
    try {
      await shell.openPath(filePath);
      return {
        success: true,
        data: true,
        message: '已用默认程序打开'
      };
    } catch (error) {
      log.error('用默认程序打开失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 计算文件哈希
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      log.error('计算文件哈希失败:', error);
      return '';
    }
  }

  /**
   * 添加到最近文件列表
   */
  private addToRecentFiles(filePath: string): void {
    // 移除已存在的项目
    this.recentFiles = this.recentFiles.filter(file => file !== filePath);
    
    // 添加到开头
    this.recentFiles.unshift(filePath);
    
    // 限制列表长度
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
    }
    
    this.saveRecentFiles();
  }

  /**
   * 从最近文件列表中移除
   */
  private removeFromRecentFiles(filePath: string): void {
    this.recentFiles = this.recentFiles.filter(file => file !== filePath);
    this.saveRecentFiles();
  }

  /**
   * 获取最近文件列表
   */
  public getRecentFiles(): string[] {
    return [...this.recentFiles];
  }

  /**
   * 清空最近文件列表
   */
  public clearRecentFiles(): void {
    this.recentFiles = [];
    this.saveRecentFiles();
  }

  /**
   * 保存最近文件列表
   */
  private saveRecentFiles(): void {
    try {
      const userDataPath = app.getPath('userData');
      const recentFilesPath = path.join(userDataPath, 'recent-files.json');
      fs.writeFile(recentFilesPath, JSON.stringify(this.recentFiles, null, 2));
    } catch (error) {
      log.error('保存最近文件列表失败:', error);
    }
  }

  /**
   * 加载最近文件列表
   */
  private async loadRecentFiles(): Promise<void> {
    try {
      const userDataPath = app.getPath('userData');
      const recentFilesPath = path.join(userDataPath, 'recent-files.json');
      
      const data = await fs.readFile(recentFilesPath, 'utf8');
      this.recentFiles = JSON.parse(data);
      
      // 验证文件是否仍然存在
      const validFiles: string[] = [];
      for (const filePath of this.recentFiles) {
        try {
          await fs.access(filePath);
          validFiles.push(filePath);
        } catch {
          // 文件不存在，跳过
        }
      }
      
      this.recentFiles = validFiles;
      
      if (validFiles.length !== this.recentFiles.length) {
        this.saveRecentFiles();
      }
    } catch (error) {
      // 文件不存在或解析失败，使用空列表
      this.recentFiles = [];
    }
  }

  /**
   * 执行文件操作
   */
  public async executeFileOperation(operation: FileOperation): Promise<APIResponse<any>> {
    switch (operation.type) {
      case 'read':
        return this.readFile(operation.path);
      
      case 'write':
        return this.writeFile(operation.path, operation.data);
      
      case 'delete':
        return this.deleteFile(operation.path);
      
      case 'copy':
        if (!operation.destination) {
          return {
            success: false,
            error: '复制操作需要目标路径'
          };
        }
        return this.copyFile(operation.path, operation.destination);
      
      case 'move':
        if (!operation.destination) {
          return {
            success: false,
            error: '移动操作需要目标路径'
          };
        }
        return this.moveFile(operation.path, operation.destination);
      
      default:
        return {
          success: false,
          error: '不支持的文件操作类型'
        };
    }
  }
}