import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 发送错误报告到主进程
    if (typeof window.electronAPI !== 'undefined') {
      window.electronAPI.system.showNotification({
        title: '应用程序错误',
        body: `发生了一个错误: ${error.message}`,
        urgency: 'critical'
      }).catch(console.error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRestart = async () => {
    if (typeof window.electronAPI !== 'undefined') {
      try {
        await window.electronAPI.app.restart();
      } catch (error) {
        console.error('重启应用失败:', error);
        this.handleReload();
      }
    } else {
      this.handleReload();
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>应用程序遇到了错误</h1>
            <p className="error-message">
              很抱歉，应用程序遇到了一个意外错误。
            </p>
            
            {this.state.error && (
              <div className="error-details">
                <h3>错误详情:</h3>
                <pre className="error-stack">
                  {this.state.error.name}: {this.state.error.message}
                </pre>
                
                {this.state.errorInfo && (
                  <details className="error-component-stack">
                    <summary>组件堆栈</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
                
                {this.state.error.stack && (
                  <details className="error-full-stack">
                    <summary>完整堆栈</summary>
                    <pre>{this.state.error.stack}</pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                重试
              </button>
              <button 
                className="btn btn-secondary"
                onClick={this.handleReload}
              >
                重新加载页面
              </button>
              <button 
                className="btn btn-danger"
                onClick={this.handleRestart}
              >
                重启应用
              </button>
            </div>
            
            <div className="error-help">
              <p>如果问题持续存在，请尝试以下操作：</p>
              <ul>
                <li>检查网络连接</li>
                <li>清除应用数据并重启</li>
                <li>联系技术支持</li>
              </ul>
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .error-container {
              max-width: 600px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              text-align: center;
            }
            
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
              font-weight: 600;
            }
            
            .error-message {
              margin-bottom: 2rem;
              font-size: 1.1rem;
              opacity: 0.9;
            }
            
            .error-details {
              text-align: left;
              margin-bottom: 2rem;
              background: rgba(0, 0, 0, 0.2);
              padding: 1rem;
              border-radius: 8px;
            }
            
            .error-details h3 {
              margin-bottom: 0.5rem;
              font-size: 1.2rem;
            }
            
            .error-stack {
              background: rgba(0, 0, 0, 0.3);
              padding: 0.5rem;
              border-radius: 4px;
              font-size: 0.9rem;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            details {
              margin-top: 1rem;
            }
            
            summary {
              cursor: pointer;
              font-weight: 500;
              margin-bottom: 0.5rem;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
              flex-wrap: wrap;
            }
            
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 6px;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .btn-primary {
              background: #4CAF50;
              color: white;
            }
            
            .btn-primary:hover {
              background: #45a049;
              transform: translateY(-1px);
            }
            
            .btn-secondary {
              background: #2196F3;
              color: white;
            }
            
            .btn-secondary:hover {
              background: #1976D2;
              transform: translateY(-1px);
            }
            
            .btn-danger {
              background: #f44336;
              color: white;
            }
            
            .btn-danger:hover {
              background: #d32f2f;
              transform: translateY(-1px);
            }
            
            .error-help {
              text-align: left;
              background: rgba(0, 0, 0, 0.2);
              padding: 1rem;
              border-radius: 8px;
              font-size: 0.9rem;
            }
            
            .error-help ul {
              margin-top: 0.5rem;
              padding-left: 1.5rem;
            }
            
            .error-help li {
              margin-bottom: 0.25rem;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;