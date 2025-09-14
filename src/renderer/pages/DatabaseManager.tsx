import React, { useState, useEffect } from 'react';

interface DatabaseRecord {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

export const DatabaseManager: React.FC = () => {
  const [records, setRecords] = useState<DatabaseRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', age: '' });

  useEffect(() => {
    // 模拟数据库数据
    const mockRecords: DatabaseRecord[] = [
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        createdAt: new Date('2025-09-01')
      },
      {
        id: 2,
        name: '李四',
        email: 'lisi@example.com',
        age: 30,
        createdAt: new Date('2025-09-05')
      },
      {
        id: 3,
        name: '王五',
        email: 'wangwu@example.com',
        age: 28,
        createdAt: new Date('2025-09-08')
      }
    ];
    setRecords(mockRecords);
  }, []);

  const handleRecordSelect = (record: DatabaseRecord) => {
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      email: record.email,
      age: record.age.toString()
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedRecord && window.electronAPI) {
      try {
        const updatedRecord = {
          ...selectedRecord,
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age)
        };
        
        // 这里应该调用 Electron API 来更新数据库
        // await window.electronAPI.updateRecord(updatedRecord);
        
        // 更新本地状态
        setRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
        setSelectedRecord(updatedRecord);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update record:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedRecord && window.electronAPI && confirm('确定要删除这条记录吗？')) {
      try {
        // 这里应该调用 Electron API 来删除记录
        // await window.electronAPI.deleteRecord(selectedRecord.id);
        
        // 更新本地状态
        setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
        setSelectedRecord(null);
        setFormData({ name: '', email: '', age: '' });
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedRecord(null);
    setFormData({ name: '', email: '', age: '' });
    setIsEditing(true);
  };

  const handleCreateNew = async () => {
    if (window.electronAPI) {
      try {
        const newRecord = {
          id: Math.max(...records.map(r => r.id)) + 1,
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          createdAt: new Date()
        };
        
        // 这里应该调用 Electron API 来创建记录
        // await window.electronAPI.createRecord(newRecord);
        
        // 更新本地状态
        setRecords(prev => [...prev, newRecord]);
        setSelectedRecord(newRecord);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to create record:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="database-manager">
      <div className="database-header">
        <h2>数据库管理</h2>
        <button onClick={handleAddNew} className="add-button">
          添加新记录
        </button>
      </div>

      <div className="database-content">
        <div className="records-list">
          <h3>记录列表</h3>
          <div className="records-table">
            <div className="table-header">
              <div className="table-column">ID</div>
              <div className="table-column">姓名</div>
              <div className="table-column">邮箱</div>
              <div className="table-column">年龄</div>
              <div className="table-column">创建时间</div>
            </div>
            
            {records.map((record) => (
              <div
                key={record.id}
                className={`table-row ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                onClick={() => handleRecordSelect(record)}
              >
                <div className="table-column">{record.id}</div>
                <div className="table-column">{record.name}</div>
                <div className="table-column">{record.email}</div>
                <div className="table-column">{record.age}</div>
                <div className="table-column">{record.createdAt.toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="record-details">
          <h3>{selectedRecord ? '记录详情' : '新建记录'}</h3>
          
          {(selectedRecord || isEditing) && (
            <div className="form">
              <div className="form-group">
                <label>姓名:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label>邮箱:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label>年龄:</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-actions">
                {isEditing ? (
                  <>
                    <button 
                      onClick={selectedRecord ? handleSave : handleCreateNew}
                      className="save-button"
                    >
                      {selectedRecord ? '保存' : '创建'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="cancel-button"
                    >
                      取消
                    </button>
                  </>
                ) : selectedRecord ? (
                  <>
                    <button onClick={handleEdit} className="edit-button">
                      编辑
                    </button>
                    <button onClick={handleDelete} className="delete-button">
                      删除
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .database-manager {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .database-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .database-header h2 {
          margin: 0;
          color: #333;
        }

        .add-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-button:hover {
          background: #45a049;
        }

        .database-content {
          flex: 1;
          display: flex;
          gap: 20px;
        }

        .records-list {
          flex: 2;
        }

        .records-list h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .records-table {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .table-header {
          display: flex;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
          font-weight: bold;
        }

        .table-column {
          flex: 1;
          padding: 12px;
          border-right: 1px solid #ddd;
        }

        .table-column:last-child {
          border-right: none;
        }

        .table-row {
          display: flex;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f9f9f9;
        }

        .table-row.selected {
          background-color: #e3f2fd;
        }

        .record-details {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          background: #fafafa;
        }

        .record-details h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          color: #666;
        }

        .form-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .form-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-button {
          background: #2196f3;
          color: white;
        }

        .save-button:hover {
          background: #1976d2;
        }

        .edit-button {
          background: #ff9800;
          color: white;
        }

        .edit-button:hover {
          background: #f57c00;
        }

        .delete-button {
          background: #f44336;
          color: white;
        }

        .delete-button:hover {
          background: #d32f2f;
        }

        .cancel-button {
          background: #9e9e9e;
          color: white;
        }

        .cancel-button:hover {
          background: #757575;
        }
      `}</style>
    </div>
  );
};