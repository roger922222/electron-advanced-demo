import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';
import { DatabaseRecord, APIResponse } from '@shared/types';

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // 设置数据库路径
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'app-database.db');
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      
      // 启用 WAL 模式以提高性能
      this.db.pragma('journal_mode = WAL');
      
      // 创建表结构
      this.createTables();
      
      // 插入初始数据
      this.insertInitialData();
      
      log.info(`数据库已初始化: ${this.dbPath}`);
    } catch (error) {
      log.error('数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建数据库表
   */
  private createTables(): void {
    if (!this.db) throw new Error('数据库未初始化');

    // 用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 设置表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 文件记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        type TEXT,
        hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
    `);

    log.info('数据库表结构已创建');
  }

  /**
   * 插入初始数据
   */
  private insertInitialData(): void {
    if (!this.db) return;

    // 检查是否已有数据
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (userCount.count === 0) {
      // 插入示例用户
      const insertUser = this.db.prepare(`
        INSERT INTO users (name, email, avatar) 
        VALUES (?, ?, ?)
      `);

      const users = [
        ['张三', 'zhangsan@example.com', 'https://via.placeholder.com/64'],
        ['李四', 'lisi@example.com', 'https://via.placeholder.com/64'],
        ['王五', 'wangwu@example.com', 'https://via.placeholder.com/64']
      ];

      const insertMany = this.db.transaction((users) => {
        for (const user of users) {
          insertUser.run(...user);
        }
      });

      insertMany(users);
      log.info('已插入初始用户数据');
    }

    // 插入默认设置
    const settingCount = this.db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
    
    if (settingCount.count === 0) {
      const insertSetting = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, type) 
        VALUES (?, ?, ?)
      `);

      const settings = [
        ['theme', 'auto', 'string'],
        ['language', 'zh-CN', 'string'],
        ['autoStart', 'false', 'boolean'],
        ['minimizeToTray', 'true', 'boolean'],
        ['notifications', 'true', 'boolean'],
        ['autoUpdate', 'true', 'boolean']
      ];

      const insertManySettings = this.db.transaction((settings) => {
        for (const setting of settings) {
          insertSetting.run(...setting);
        }
      });

      insertManySettings(settings);
      log.info('已插入默认设置');
    }
  }

  /**
   * 获取所有用户记录
   */
  public getAllRecords(): APIResponse<DatabaseRecord[]> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const stmt = this.db.prepare(`
        SELECT 
          id, 
          name, 
          email, 
          created_at as createdAt, 
          updated_at as updatedAt 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      const records = stmt.all() as DatabaseRecord[];
      
      return {
        success: true,
        data: records
      };
    } catch (error) {
      log.error('获取用户记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 根据ID获取记录
   */
  public getRecordById(id: number): APIResponse<DatabaseRecord | null> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const stmt = this.db.prepare(`
        SELECT 
          id, 
          name, 
          email, 
          created_at as createdAt, 
          updated_at as updatedAt 
        FROM users 
        WHERE id = ?
      `);
      
      const record = stmt.get(id) as DatabaseRecord | undefined;
      
      return {
        success: true,
        data: record || null
      };
    } catch (error) {
      log.error('获取用户记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 创建新记录
   */
  public createRecord(data: Omit<DatabaseRecord, 'id' | 'createdAt' | 'updatedAt'>): APIResponse<DatabaseRecord> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const stmt = this.db.prepare(`
        INSERT INTO users (name, email) 
        VALUES (?, ?)
      `);
      
      const result = stmt.run(data.name, data.email);
      
      // 获取新创建的记录
      const newRecord = this.getRecordById(result.lastInsertRowid as number);
      
      if (newRecord.success && newRecord.data) {
        log.info('用户记录已创建:', newRecord.data);
        return {
          success: true,
          data: newRecord.data
        };
      } else {
        throw new Error('无法获取新创建的记录');
      }
    } catch (error) {
      log.error('创建用户记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 更新记录
   */
  public updateRecord(id: number, data: Partial<Omit<DatabaseRecord, 'id' | 'createdAt' | 'updatedAt'>>): APIResponse<DatabaseRecord> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const updateFields: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        values.push(data.name);
      }
      
      if (data.email !== undefined) {
        updateFields.push('email = ?');
        values.push(data.email);
      }

      if (updateFields.length === 0) {
        throw new Error('没有提供要更新的字段');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        throw new Error('记录不存在或未发生更改');
      }

      // 获取更新后的记录
      const updatedRecord = this.getRecordById(id);
      
      if (updatedRecord.success && updatedRecord.data) {
        log.info('用户记录已更新:', updatedRecord.data);
        return {
          success: true,
          data: updatedRecord.data
        };
      } else {
        throw new Error('无法获取更新后的记录');
      }
    } catch (error) {
      log.error('更新用户记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 删除记录
   */
  public deleteRecord(id: number): APIResponse<boolean> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('记录不存在');
      }

      log.info('用户记录已删除:', id);
      return {
        success: true,
        data: true
      };
    } catch (error) {
      log.error('删除用户记录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取设置
   */
  public getSetting(key: string): APIResponse<any> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const stmt = this.db.prepare('SELECT value, type FROM settings WHERE key = ?');
      const result = stmt.get(key) as { value: string; type: string } | undefined;
      
      if (!result) {
        return {
          success: false,
          error: '设置不存在'
        };
      }

      let parsedValue: any = result.value;
      
      // 根据类型解析值
      switch (result.type) {
        case 'boolean':
          parsedValue = result.value === 'true';
          break;
        case 'number':
          parsedValue = parseFloat(result.value);
          break;
        case 'json':
          parsedValue = JSON.parse(result.value);
          break;
      }

      return {
        success: true,
        data: parsedValue
      };
    } catch (error) {
      log.error('获取设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 设置配置
   */
  public setSetting(key: string, value: any): APIResponse<boolean> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      let stringValue: string;
      let type: string = 'string';

      if (typeof value === 'boolean') {
        stringValue = value.toString();
        type = 'boolean';
      } else if (typeof value === 'number') {
        stringValue = value.toString();
        type = 'number';
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
        type = 'json';
      } else {
        stringValue = String(value);
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, type, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(key, stringValue, type);

      log.info('设置已更新:', { key, value, type });
      return {
        success: true,
        data: true
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
   * 记录日志到数据库
   */
  public logToDatabase(level: string, message: string, data?: any): void {
    try {
      if (!this.db) return;

      const stmt = this.db.prepare(`
        INSERT INTO logs (level, message, data) 
        VALUES (?, ?, ?)
      `);
      
      const dataString = data ? JSON.stringify(data) : null;
      stmt.run(level, message, dataString);
    } catch (error) {
      log.error('写入数据库日志失败:', error);
    }
  }

  /**
   * 获取数据库统计信息
   */
  public getStatistics(): APIResponse<any> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const fileCount = this.db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number };
      const logCount = this.db.prepare('SELECT COUNT(*) as count FROM logs').get() as { count: number };
      const settingCount = this.db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };

      return {
        success: true,
        data: {
          users: userCount.count,
          files: fileCount.count,
          logs: logCount.count,
          settings: settingCount.count,
          databasePath: this.dbPath
        }
      };
    } catch (error) {
      log.error('获取数据库统计信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 备份数据库
   */
  public async backupDatabase(backupPath: string): Promise<APIResponse<string>> {
    try {
      if (!this.db) throw new Error('数据库未初始化');

      await this.db.backup(backupPath);
      
      log.info('数据库备份完成:', backupPath);
      return {
        success: true,
        data: backupPath,
        message: '数据库备份完成'
      };
    } catch (error) {
      log.error('数据库备份失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      log.info('数据库连接已关闭');
    }
  }

  /**
   * 获取数据库实例
   */
  public getDatabase(): Database.Database | null {
    return this.db;
  }
}