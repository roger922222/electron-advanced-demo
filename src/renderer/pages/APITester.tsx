import React, { useState, useEffect } from 'react';

interface APIRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp: Date;
}

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  responseTime: number;
}

interface RequestHistory {
  request: APIRequest;
  response?: APIResponse;
  error?: string;
}

export const APITester: React.FC = () => {
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState<string>('');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  useEffect(() => {
    // 从本地存储加载历史记录
    const savedHistory = localStorage.getItem('api-tester-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          request: {
            ...item.request,
            timestamp: new Date(item.request.timestamp)
          }
        })));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  const saveToHistory = (request: APIRequest, response?: APIResponse, error?: string) => {
    const historyItem: RequestHistory = { request, response, error };
    const newHistory = [historyItem, ...history.slice(0, 49)]; // 保持最多50条记录
    setHistory(newHistory);
    
    // 保存到本地存储
    localStorage.setItem('api-tester-history', JSON.stringify(newHistory));
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setError('');

    const request: APIRequest = {
      id: Date.now().toString(),
      method,
      url,
      headers: {},
      body,
      timestamp: new Date()
    };

    try {
      // 解析 headers
      if (headers.trim()) {
        request.headers = JSON.parse(headers);
      }
    } catch (e) {
      setError('Headers 格式错误，请使用有效的 JSON 格式');
      setLoading(false);
      return;
    }

    const startTime = Date.now();

    try {
      // 如果有 Electron API，使用它来发送请求
      if (window.electronAPI && window.electronAPI.sendHttpRequest) {
        const result = await window.electronAPI.sendHttpRequest({
          method,
          url,
          headers: request.headers,
          body: method !== 'GET' ? body : undefined
        });
        
        const responseTime = Date.now() - startTime;
        const apiResponse: APIResponse = {
          status: result.status,
          statusText: result.statusText,
          headers: result.headers || {},
          data: JSON.stringify(result.data, null, 2),
          responseTime
        };
        
        setResponse(apiResponse);
        saveToHistory(request, apiResponse);
      } else {
        // 后备方案：使用 fetch API
        const fetchOptions: RequestInit = {
          method,
          headers: request.headers,
        };

        if (method !== 'GET' && body) {
          fetchOptions.body = body;
        }

        const fetchResponse = await fetch(url, fetchOptions);
        const responseData = await fetchResponse.text();
        const responseTime = Date.now() - startTime;

        const apiResponse: APIResponse = {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: Object.fromEntries(fetchResponse.headers.entries()),
          data: responseData,
          responseTime
        };

        setResponse(apiResponse);
        saveToHistory(request, apiResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败';
      setError(errorMessage);
      saveToHistory(request, undefined, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (historyItem: RequestHistory) => {
    const { request } = historyItem;
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(JSON.stringify(request.headers, null, 2));
    setBody(request.body);
    setResponse(historyItem.response || null);
    setError(historyItem.error || '');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('api-tester-history');
  };

  const formatResponseData = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  return (
    <div className="api-tester">
      <div className="api-tester-header">
        <h2>API 测试器</h2>
        <button onClick={clearHistory} className="clear-history-button">
          清空历史
        </button>
      </div>

      <div className="api-tester-content">
        <div className="request-panel">
          <h3>请求配置</h3>
          
          <div className="request-line">
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="method-select"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入 API URL"
              className="url-input"
            />
            
            <button 
              onClick={sendRequest} 
              disabled={loading || !url}
              className="send-button"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>

          <div className="request-details">
            <div className="headers-section">
              <label>Headers (JSON 格式):</label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                className="headers-textarea"
                rows={4}
              />
            </div>

            {method !== 'GET' && (
              <div className="body-section">
                <label>Request Body:</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="请输入请求体内容"
                  className="body-textarea"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>

        <div className="response-panel">
          <h3>响应结果</h3>
          
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>发送请求中...</span>
            </div>
          )}

          {error && (
            <div className="error-response">
              <h4>错误信息</h4>
              <pre>{error}</pre>
            </div>
          )}

          {response && (
            <div className="success-response">
              <div className="response-meta">
                <span className={`status-code status-${Math.floor(response.status / 100)}xx`}>
                  {response.status} {response.statusText}
                </span>
                <span className="response-time">
                  响应时间: {response.responseTime}ms
                </span>
              </div>

              <div className="response-headers">
                <h4>Response Headers</h4>
                <pre>{JSON.stringify(response.headers, null, 2)}</pre>
              </div>

              <div className="response-body">
                <h4>Response Body</h4>
                <pre>{formatResponseData(response.data)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="history-panel">
          <h3>请求历史</h3>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="no-history">暂无历史记录</div>
            ) : (
              history.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="history-method">{item.request.method}</div>
                  <div className="history-url">{item.request.url}</div>
                  <div className="history-time">
                    {item.request.timestamp.toLocaleTimeString()}
                  </div>
                  <div className={`history-status ${item.error ? 'error' : 'success'}`}>
                    {item.error ? 'ERROR' : item.response?.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .api-tester {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .api-tester-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .api-tester-header h2 {
          margin: 0;
          color: #333;
        }

        .clear-history-button {
          background: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .clear-history-button:hover {
          background: #d32f2f;
        }

        .api-tester-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 300px;
          gap: 20px;
          min-height: 0;
        }

        .request-panel,
        .response-panel,
        .history-panel {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .request-panel h3,
        .response-panel h3,
        .history-panel h3 {
          margin: 0 0 15px 0;
          color: #333;
          border-bottom: 2px solid #2196f3;
          padding-bottom: 8px;
        }

        .request-line {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .method-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          min-width: 80px;
        }

        .url-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .send-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 80px;
        }

        .send-button:hover:not(:disabled) {
          background: #45a049;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .request-details {
          flex: 1;
        }

        .headers-section,
        .body-section {
          margin-bottom: 20px;
        }

        .headers-section label,
        .body-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #555;
        }

        .headers-textarea,
        .body-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          resize: vertical;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px;
          color: #666;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-response,
        .success-response {
          flex: 1;
          overflow: auto;
        }

        .error-response h4,
        .success-response h4 {
          margin: 15px 0 8px 0;
          color: #333;
        }

        .error-response pre,
        .success-response pre {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          font-size: 12px;
          line-height: 1.4;
        }

        .response-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .status-code {
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-2xx {
          background: #4caf50;
          color: white;
        }

        .status-3xx {
          background: #ff9800;
          color: white;
        }

        .status-4xx,
        .status-5xx {
          background: #f44336;
          color: white;
        }

        .response-time {
          color: #666;
          font-size: 14px;
        }

        .history-list {
          flex: 1;
          overflow: auto;
        }

        .no-history {
          text-align: center;
          color: #666;
          padding: 20px;
        }

        .history-item {
          padding: 12px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .history-item:hover {
          background-color: #f5f5f5;
        }

        .history-method {
          font-weight: bold;
          color: #2196f3;
          margin-bottom: 4px;
        }

        .history-url {
          font-size: 12px;
          color: #333;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .history-time {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }

        .history-status {
          font-size: 11px;
          font-weight: bold;
        }

        .history-status.success {
          color: #4caf50;
        }

        .history-status.error {
          color: #f44336;
        }

        @media (max-width: 1200px) {
          .api-tester-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
        }
      `}</style>
    </div>
  );
};