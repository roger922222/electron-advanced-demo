import React, { useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  useEffect(() => {
    // 模拟文件数据
    const mockFiles: FileInfo[] = [
      {
        name: 'document.txt',
        path: '/home/user/document.txt',
        size: 1024,
        type: 'text',
        lastModified: new Date('2025-09-10')
      },
      {
        name: 'image.png',
        path: '/home/user/image.png',
        size: 2048,
        type: 'image',
        lastModified: new Date('2025-09-09')
      }
    ];
    setFiles(mockFiles);
    setCurrentPath('/home/user');
  }, []);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
  };

  const handleOpenFile = async () => {
    if (selectedFile && window.electronAPI) {
      try {
        await window.electronAPI.openFile(selectedFile.path);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h2>文件管理器</h2>
        <div className="current-path">
          <span>当前路径: {currentPath}</span>
        </div>
      </div>

      <div className="file-manager-content">
        <div className="file-list">
          <div className="file-list-header">
            <div className="file-column">名称</div>
            <div className="file-column">大小</div>
            <div className="file-column">类型</div>
            <div className="file-column">修改时间</div>
          </div>
          
          {files.map((file, index) => (
            <div
              key={index}
              className={`file-item ${selectedFile?.name === file.name ? 'selected' : ''}`}
              onClick={() => handleFileSelect(file)}
              onDoubleClick={handleOpenFile}
            >
              <div className="file-column">{file.name}</div>
              <div className="file-column">{formatFileSize(file.size)}</div>
              <div className="file-column">{file.type}</div>
              <div className="file-column">{file.lastModified.toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {selectedFile && (
          <div className="file-details">
            <h3>文件详情</h3>
            <div className="detail-item">
              <label>名称:</label>
              <span>{selectedFile.name}</span>
            </div>
            <div className="detail-item">
              <label>路径:</label>
              <span>{selectedFile.path}</span>
            </div>
            <div className="detail-item">
              <label>大小:</label>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>
            <div className="detail-item">
              <label>类型:</label>
              <span>{selectedFile.type}</span>
            </div>
            <div className="detail-item">
              <label>修改时间:</label>
              <span>{selectedFile.lastModified.toLocaleString()}</span>
            </div>
            <div className="file-actions">
              <button onClick={handleOpenFile}>打开文件</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .file-manager {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .file-manager-header {
          margin-bottom: 20px;
        }

        .file-manager-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .current-path {
          color: #666;
          font-size: 14px;
        }

        .file-manager-content {
          flex: 1;
          display: flex;
          gap: 20px;
        }

        .file-list {
          flex: 2;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .file-list-header {
          display: flex;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
          font-weight: bold;
          padding: 10px;
        }

        .file-column {
          flex: 1;
          padding: 0 10px;
        }

        .file-item {
          display: flex;
          padding: 10px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .file-item:hover {
          background-color: #f9f9f9;
        }

        .file-item.selected {
          background-color: #e3f2fd;
        }

        .file-details {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          background: #fafafa;
        }

        .file-details h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .detail-item {
          display: flex;
          margin-bottom: 10px;
        }

        .detail-item label {
          font-weight: bold;
          min-width: 80px;
          color: #555;
        }

        .detail-item span {
          color: #333;
        }

        .file-actions {
          margin-top: 20px;
        }

        .file-actions button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .file-actions button:hover {
          background: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default FileManager;