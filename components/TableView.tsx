import React, { useState, useEffect } from 'react';
import { Employee, Table } from '../types.ts';
import { generateId } from '../utils.ts';
import { Users, Shuffle, Briefcase, RefreshCw } from 'lucide-react';

interface TableViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

const TableView: React.FC<TableViewProps> = ({ employees, setEmployees, tables, setTables }) => {
  const [tableSize, setTableSize] = useState(10);
  const [draggedEmpId, setDraggedEmpId] = useState<string | null>(null);

  // Stats
  const totalEmployees = employees.length;
  const assignedCount = employees.filter(e => e.tableId).length;
  const unassignedCount = totalEmployees - assignedCount;
  const requiredTables = Math.ceil(totalEmployees / tableSize);

  const handleAutoAssign = (mode: 'department' | 'random') => {
    if (!confirm('重新分配將會覆蓋目前的座位安排，確定執行？')) return;

    let empList = [...employees];
    
    // Sort logic
    if (mode === 'department') {
      empList.sort((a, b) => a.department.localeCompare(b.department));
    } else {
      // Random shuffle
      empList = empList.sort(() => Math.random() - 0.5);
    }

    // Create tables
    const numTables = Math.ceil(empList.length / tableSize);
    const newTables: Table[] = [];
    for (let i = 0; i < numTables; i++) {
      newTables.push({
        id: String(i + 1),
        name: `桌次 ${i + 1}`,
        capacity: tableSize
      });
    }

    // Assign IDs
    const updatedEmployees = empList.map((emp, index) => {
      const tableIndex = Math.floor(index / tableSize);
      return {
        ...emp,
        tableId: newTables[tableIndex]?.id
      };
    });

    setTables(newTables);
    setEmployees(updatedEmployees);
  };

  const handleClearTables = () => {
    if (!confirm('確定要清空所有桌次安排？')) return;
    setTables([]);
    setEmployees(prev => prev.map(e => ({ ...e, tableId: undefined })));
  };

  const handleMoveEmployee = (empId: string, newTableId: string) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, tableId: newTableId } : e));
  };

  // Group employees by table for rendering
  const employeesByTable: Record<string, Employee[]> = {};
  tables.forEach(t => {
    employeesByTable[t.id] = employees.filter(e => e.tableId === t.id);
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">智慧分桌系統</h2>
        
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3">
              <span className="text-slate-600 font-medium">每桌人數設定：</span>
              <select 
                value={tableSize} 
                onChange={(e) => setTableSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-party-gold"
              >
                {[6, 8, 10, 12].map(n => <option key={n} value={n}>{n} 人</option>)}
              </select>
            </div>
            
            <div className="text-sm text-slate-500">
              預計需要 <span className="font-bold text-party-red">{requiredTables}</span> 桌
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleAutoAssign('department')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
            >
              <Briefcase className="w-4 h-4" /> 部門優先分配
            </button>
            <button 
              onClick={() => handleAutoAssign('random')}
              className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition shadow-sm font-medium"
            >
              <Shuffle className="w-4 h-4" /> 隨機大亂鬥
            </button>
            <button 
              onClick={handleClearTables}
              className="flex items-center gap-2 bg-slate-200 text-slate-600 px-5 py-2.5 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" /> 重置
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex gap-4 text-sm">
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            已入座: {assignedCount}
          </div>
          <div className={`${unassignedCount > 0 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'} px-3 py-1 rounded-full border`}>
            未分配: {unassignedCount}
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map(table => {
          const tableEmps = employeesByTable[table.id] || [];
          const isOverCapacity = tableEmps.length > table.capacity;

          return (
            <div key={table.id} className="bg-white rounded-xl shadow border border-slate-200 flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-party-red text-white flex items-center justify-center text-sm shadow-sm">
                     {table.id}
                   </div>
                   {table.name}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isOverCapacity ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                  {tableEmps.length} / {table.capacity}
                </span>
              </div>
              
              <div className="p-4 flex-1 space-y-2">
                {tableEmps.length === 0 ? (
                  <div className="text-center text-slate-300 py-8 text-sm">空桌</div>
                ) : (
                  tableEmps.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded hover:shadow-sm transition-shadow group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-party-gold"></div>
                        <span className="font-medium text-slate-700 text-sm">{emp.name}</span>
                        <span className="text-xs text-slate-400">({emp.department})</span>
                      </div>
                      
                      {/* Quick Move Dropdown */}
                      <select 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs border border-slate-200 rounded p-1 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-300 w-20"
                        value={emp.tableId}
                        onChange={(e) => handleMoveEmployee(emp.id, e.target.value)}
                      >
                        {tables.map(t => <option key={t.id} value={t.id}>桌 {t.id}</option>)}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableView;