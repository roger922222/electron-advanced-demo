import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import log from 'electron-log';
import { APIResponse } from '@shared/types';

interface APIRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

export class APIManager {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = 'https://jsonplaceholder.typicode.com'; // 示例API
    this.defaultTimeout = 10000; // 10秒超时

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Electron-Advanced-Demo/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        log.debug('API请求:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          params: config.params,
          data: config.data
        });

        // 添加请求时间戳
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => {
        log.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        
        log.debug('API响应:', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          dataSize: JSON.stringify(response.data).length
        });

        return response;
      },
      (error) => {
        const duration = error.config?.metadata?.startTime 
          ? Date.now() - error.config.metadata.startTime 
          : 0;

        log.error('API响应错误:', {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          duration: `${duration}ms`
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用API请求方法
   */
  public async makeRequest(config: APIRequestConfig): Promise<APIResponse<any>> {
    try {
      const axiosConfig: AxiosRequestConfig = {
        url: config.url,
        method: config.method || 'GET',
        data: config.data,
        params: config.params,
        headers: config.headers,
        timeout: config.timeout || this.defaultTimeout
      };

      const response: AxiosResponse = await this.axiosInstance.request(axiosConfig);

      return {
        success: true,
        data: response.data,
        message: `请求成功 (${response.status})`
      };
    } catch (error: any) {
      log.error('API请求失败:', error);

      let errorMessage = '请求失败';
      let statusCode = 0;

      if (error.response) {
        // 服务器响应了错误状态码
        statusCode = error.response.status;
        errorMessage = `服务器错误 (${statusCode}): ${error.response.statusText}`;
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络错误: 无法连接到服务器';
      } else {
        // 请求配置错误
        errorMessage = `请求配置错误: ${error.message}`;
      }

      return {
        success: false,
        error: errorMessage,
        data: {
          statusCode,
          originalError: error.message
        }
      };
    }
  }

  /**
   * GET 请求
   */
  public async get(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APIResponse<any>> {
    return this.makeRequest({
      url,
      method: 'GET',
      params,
      headers
    });
  }

  /**
   * POST 请求
   */
  public async post(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<any>> {
    return this.makeRequest({
      url,
      method: 'POST',
      data,
      headers
    });
  }

  /**
   * PUT 请求
   */
  public async put(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<any>> {
    return this.makeRequest({
      url,
      method: 'PUT',
      data,
      headers
    });
  }

  /**
   * DELETE 请求
   */
  public async delete(url: string, headers?: Record<string, string>): Promise<APIResponse<any>> {
    return this.makeRequest({
      url,
      method: 'DELETE',
      headers
    });
  }

  /**
   * PATCH 请求
   */
  public async patch(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<any>> {
    return this.makeRequest({
      url,
      method: 'PATCH',
      data,
      headers
    });
  }

  /**
   * 获取用户列表 (示例API)
   */
  public async getUsers(): Promise<APIResponse<any[]>> {
    return this.get('/users');
  }

  /**
   * 获取用户详情 (示例API)
   */
  public async getUser(id: number): Promise<APIResponse<any>> {
    return this.get(`/users/${id}`);
  }

  /**
   * 创建用户 (示例API)
   */
  public async createUser(userData: any): Promise<APIResponse<any>> {
    return this.post('/users', userData);
  }

  /**
   * 更新用户 (示例API)
   */
  public async updateUser(id: number, userData: any): Promise<APIResponse<any>> {
    return this.put(`/users/${id}`, userData);
  }

  /**
   * 删除用户 (示例API)
   */
  public async deleteUser(id: number): Promise<APIResponse<any>> {
    return this.delete(`/users/${id}`);
  }

  /**
   * 获取文章列表 (示例API)
   */
  public async getPosts(): Promise<APIResponse<any[]>> {
    return this.get('/posts');
  }

  /**
   * 获取文章详情 (示例API)
   */
  public async getPost(id: number): Promise<APIResponse<any>> {
    return this.get(`/posts/${id}`);
  }

  /**
   * 获取评论列表 (示例API)
   */
  public async getComments(postId?: number): Promise<APIResponse<any[]>> {
    const url = postId ? `/posts/${postId}/comments` : '/comments';
    return this.get(url);
  }

  /**
   * 获取相册列表 (示例API)
   */
  public async getAlbums(): Promise<APIResponse<any[]>> {
    return this.get('/albums');
  }

  /**
   * 获取照片列表 (示例API)
   */
  public async getPhotos(albumId?: number): Promise<APIResponse<any[]>> {
    const url = albumId ? `/albums/${albumId}/photos` : '/photos';
    return this.get(url);
  }

  /**
   * 获取待办事项列表 (示例API)
   */
  public async getTodos(): Promise<APIResponse<any[]>> {
    return this.get('/todos');
  }

  /**
   * 测试网络连接
   */
  public async testConnection(): Promise<APIResponse<boolean>> {
    try {
      const response = await this.get('/users/1');
      return {
        success: true,
        data: true,
        message: '网络连接正常'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: '网络连接失败'
      };
    }
  }

  /**
   * 设置基础URL
   */
  public setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
    log.info('API基础URL已更新:', baseURL);
  }

  /**
   * 设置默认超时时间
   */
  public setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
    this.axiosInstance.defaults.timeout = timeout;
    log.info('API超时时间已更新:', timeout);
  }

  /**
   * 设置默认请求头
   */
  public setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
    log.info('API默认请求头已更新:', headers);
  }

  /**
   * 添加认证令牌
   */
  public setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    log.info('API认证令牌已设置');
  }

  /**
   * 移除认证令牌
   */
  public removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
    log.info('API认证令牌已移除');
  }

  /**
   * 获取API配置信息
   */
  public getConfig(): any {
    return {
      baseURL: this.baseURL,
      timeout: this.defaultTimeout,
      headers: this.axiosInstance.defaults.headers.common
    };
  }

  /**
   * 批量请求
   */
  public async batchRequests(requests: APIRequestConfig[]): Promise<APIResponse<any[]>> {
    try {
      const promises = requests.map(config => this.makeRequest(config));
      const results = await Promise.allSettled(promises);

      const successResults: any[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successResults.push(result.value);
        } else {
          errors.push(`请求 ${index + 1} 失败: ${result.reason}`);
        }
      });

      if (errors.length > 0) {
        log.warn('批量请求部分失败:', errors);
      }

      return {
        success: true,
        data: successResults,
        message: `批量请求完成: ${successResults.length}/${requests.length} 成功`
      };
    } catch (error) {
      log.error('批量请求失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量请求失败'
      };
    }
  }

  /**
   * 下载文件
   */
  public async downloadFile(url: string, onProgress?: (progress: number) => void): Promise<APIResponse<ArrayBuffer>> {
    try {
      const response = await this.axiosInstance.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        data: response.data,
        message: '文件下载成功'
      };
    } catch (error) {
      log.error('文件下载失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文件下载失败'
      };
    }
  }

  /**
   * 上传文件
   */
  public async uploadFile(url: string, file: Buffer, filename: string, onProgress?: (progress: number) => void): Promise<APIResponse<any>> {
    try {
      const formData = new FormData();
      const blob = new Blob([file]);
      formData.append('file', blob, filename);

      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        data: response.data,
        message: '文件上传成功'
      };
    } catch (error) {
      log.error('文件上传失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文件上传失败'
      };
    }
  }
}