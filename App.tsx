import React, { useState, useEffect } from 'react';
import EmployeeView from './components/EmployeeView.tsx';
import TableView from './components/TableView.tsx';
import LuckyDrawView from './components/LuckyDrawView.tsx';
import { Employee, Prize, Table, WinnerRecord, LOCAL_STORAGE_KEY, AppState } from './types.ts';
import { Users, Grid, Gift, PartyPopper } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'tables' | 'luckydraw'>('employees');

  // Global State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);

  // Load Initial State
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        setEmployees(parsed.employees || []);
        setTables(parsed.tables || []);
        setPrizes(parsed.prizes || []);
        setWinners(parsed.winners || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    } else {
        // Init some demo prizes
        setPrizes([
            { id: 'p1', name: '特獎: iPhone 15 Pro', count: 1 },
            { id: 'p2', name: '二獎: iPad Air', count: 3 },
            { id: 'p3', name: '三獎: 5000元 禮券', count: 10 },
        ]);
    }
  }, []);

  // Persistence
  useEffect(() => {
    const state: AppState = { employees, tables, prizes, winners };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [employees, tables, prizes, winners]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-party-red p-2 rounded-lg">
                    <PartyPopper className="w-6 h-6 text-party-gold" />
                </div>
                <h1 className="text-xl font-bold tracking-wide">
                    尾牙<span className="text-party-gold">饗宴</span>管理系統
                </h1>
            </div>
            
            <nav className="flex gap-1">
                <button 
                    onClick={() => setActiveTab('employees')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'employees' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Users className="w-4 h-4" /> 名單管理
                </button>
                <button 
                    onClick={() => setActiveTab('tables')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'tables' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Grid className="w-4 h-4" /> 桌次安排
                </button>
                <button 
                    onClick={() => setActiveTab('luckydraw')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'luckydraw' ? 'bg-party-red text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Gift className="w-4 h-4" /> 幸運抽獎
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'employees' && (
            <EmployeeView employees={employees} setEmployees={setEmployees} />
        )}
        {activeTab === 'tables' && (
            <TableView 
                employees={employees} 
                setEmployees={setEmployees} 
                tables={tables}
                setTables={setTables}
            />
        )}
        {activeTab === 'luckydraw' && (
            <LuckyDrawView 
                employees={employees}
                setEmployees={setEmployees}
                prizes={prizes}
                setPrizes={setPrizes}
                winners={winners}
                setWinners={setWinners}
            />
        )}
      </main>
      
      <footer className="bg-slate-100 border-t border-slate-200 py-4 text-center text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} Company Annual Party Manager. Built for HR Professionals.
      </footer>
    </div>
  );
};

export default App;