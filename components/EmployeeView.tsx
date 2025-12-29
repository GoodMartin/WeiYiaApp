import React, { useState, useRef } from 'react';
import { Employee } from '../types.ts';
import { generateId, parseCSV } from '../utils.ts';
import { Upload, Trash2, Plus, Search, FileDown } from 'lucide-react';

interface EmployeeViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ employees, setEmployees }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = parseCSV(content);
        const newEmployees = parsed.map(p => ({
          id: generateId(),
          staffId: p.staffId || generateId(),
          name: p.name || 'Unknown',
          department: p.department || 'General',
          title: p.title || 'Staff',
          gender: p.gender,
          isWinner: false,
          ...p
        } as Employee));

        setEmployees(prev => [...prev, ...newEmployees]);
        alert(`成功匯入 ${newEmployees.length} 筆資料`);
      } catch (err) {
        alert('檔案格式錯誤，請確認 CSV 格式');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這位同仁嗎？')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('警告：確定要清空所有名單嗎？此操作無法復原。')) {
      setEmployees([]);
    }
  };

  const handleSaveEmployee = () => {
    if (!editingEmployee.name || !editingEmployee.staffId) {
      alert('姓名與工號為必填');
      return;
    }

    if (editingEmployee.id) {
      // Edit
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...editingEmployee } as Employee : e));
    } else {
      // Add
      const newEmp: Employee = {
        id: generateId(),
        staffId: editingEmployee.staffId || '',
        name: editingEmployee.name || '',
        department: editingEmployee.department || 'General',
        title: editingEmployee.title || 'Staff',
        gender: editingEmployee.gender,
        isWinner: false
      };
      setEmployees(prev => [...prev, newEmp]);
    }
    setIsModalOpen(false);
    setEditingEmployee({});
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">員工名單管理</h2>
          <p className="text-slate-500 text-sm">目前總人數: {employees.length} 人</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="搜尋姓名/部門..." 
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-party-red focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => { setEditingEmployee({}); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> 新增
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" /> 匯入 CSV
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileUpload}
          />

           {employees.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> 清空
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">工號</th>
                <th className="px-6 py-3">姓名</th>
                <th className="px-6 py-3">部門</th>
                <th className="px-6 py-3">職稱</th>
                <th className="px-6 py-3">桌次</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    尚無資料，請匯入或新增員工
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{emp.staffId}</td>
                    <td className="px-6 py-4 font-bold">{emp.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">{emp.department}</span>
                    </td>
                    <td className="px-6 py-4">{emp.title}</td>
                    <td className="px-6 py-4">
                      {emp.tableId ? (
                        <span className="text-party-darkRed font-semibold">桌號 {emp.tableId}</span>
                      ) : (
                        <span className="text-slate-400">未分配</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        編輯
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingEmployee.id ? '編輯員工' : '新增員工'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">工號</label>
                <input 
                  type="text" 
                  value={editingEmployee.staffId || ''} 
                  onChange={e => setEditingEmployee(prev => ({...prev, staffId: e.target.value}))}
                  className="mt-1 w-full border border-slate-300 rounded-md p-2 focus:ring-party-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">姓名</label>
                <input 
                  type="text" 
                  value={editingEmployee.name || ''} 
                  onChange={e => setEditingEmployee(prev => ({...prev, name: e.target.value}))}
                  className="mt-1 w-full border border-slate-300 rounded-md p-2 focus:ring-party-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">部門</label>
                <input 
                  type="text" 
                  value={editingEmployee.department || ''} 
                  onChange={e => setEditingEmployee(prev => ({...prev, department: e.target.value}))}
                  className="mt-1 w-full border border-slate-300 rounded-md p-2 focus:ring-party-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">職稱</label>
                <input 
                  type="text" 
                  value={editingEmployee.title || ''} 
                  onChange={e => setEditingEmployee(prev => ({...prev, title: e.target.value}))}
                  className="mt-1 w-full border border-slate-300 rounded-md p-2 focus:ring-party-red focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleSaveEmployee}
                className="px-4 py-2 bg-party-red text-white hover:bg-party-darkRed rounded-lg"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;