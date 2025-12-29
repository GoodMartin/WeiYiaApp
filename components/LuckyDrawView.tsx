import React, { useState, useEffect, useRef } from 'react';
import { Employee, Prize, WinnerRecord } from '../types.ts';
import { generateId, downloadCSV } from '../utils.ts';
import { Gift, Play, Settings, RotateCcw, Download, Trophy } from 'lucide-react';

interface LuckyDrawViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  prizes: Prize[];
  setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>;
  winners: WinnerRecord[];
  setWinners: React.Dispatch<React.SetStateAction<WinnerRecord[]>>;
}

const LuckyDrawView: React.FC<LuckyDrawViewProps> = ({ 
  employees, setEmployees, prizes, setPrizes, winners, setWinners 
}) => {
  const [currentPrizeId, setCurrentPrizeId] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [displayNames, setDisplayNames] = useState<string[]>(['準備抽獎', 'Good Luck']);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Settings
  const [allowRepeatWin, setAllowRepeatWin] = useState(false);
  const [drawCount, setDrawCount] = useState(1); // How many to draw at once

  const animationRef = useRef<number>(0);

  // Ensure current prize is selected
  useEffect(() => {
    if (prizes.length > 0 && !currentPrizeId) {
      setCurrentPrizeId(prizes[0].id);
    }
  }, [prizes]);

  // Rolling Animation Logic
  const startRolling = () => {
    const selectedPrize = prizes.find(p => p.id === currentPrizeId);
    if (!selectedPrize) {
      alert('請先選擇或新增獎項');
      return;
    }

    // Filter eligible
    const eligible = employees.filter(e => allowRepeatWin || !e.isWinner);
    if (eligible.length < drawCount) {
      alert(`符合資格人數不足！剩餘 ${eligible.length} 人，欲抽出 ${drawCount} 人。`);
      return;
    }

    setIsRolling(true);
    setShowConfetti(false);

    const updateDisplay = () => {
      const randomNames = Array.from({ length: drawCount }).map(() => {
        const r = Math.floor(Math.random() * eligible.length);
        return eligible[r].name;
      });
      setDisplayNames(randomNames);
      animationRef.current = requestAnimationFrame(updateDisplay);
    };

    animationRef.current = requestAnimationFrame(updateDisplay);

    // Stop after random time (3-5s)
    setTimeout(() => {
        stopRolling(eligible, selectedPrize);
    }, 3000);
  };

  const stopRolling = (eligiblePool: Employee[], prize: Prize) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Actual Logic to pick winners
    const roundWinners: Employee[] = [];
    const pool = [...eligiblePool];

    for(let i=0; i<drawCount; i++) {
        if(pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        roundWinners.push(pool[idx]);
        pool.splice(idx, 1); // remove to avoid duplicate in same batch
    }

    setDisplayNames(roundWinners.map(w => w.name)); // Final display
    setIsRolling(false);
    setShowConfetti(true);

    // Update Data
    const timestamp = Date.now();
    const newWinnerRecords: WinnerRecord[] = roundWinners.map(w => ({
        id: generateId(),
        employeeId: w.id,
        prizeId: prize.id,
        timestamp
    }));

    setWinners(prev => [...prev, ...newWinnerRecords]);
    
    // Mark employees as winners
    setEmployees(prev => prev.map(e => {
        const isWin = roundWinners.find(rw => rw.id === e.id);
        if (isWin) {
            return { ...e, isWinner: true, prizeWon: prize.name };
        }
        return e;
    }));
  };

  const handleAddPrize = () => {
    const name = prompt('請輸入獎項名稱 (例: 頭獎)');
    if (name) {
      const countStr = prompt('獎項數量', '1');
      const count = parseInt(countStr || '1', 10);
      setPrizes(prev => [...prev, { id: generateId(), name, count }]);
    }
  };

  const handleExportWinners = () => {
    const header = '獎項,工號,姓名,部門,抽獎時間\n';
    const rows = winners.map(w => {
      const emp = employees.find(e => e.id === w.employeeId);
      const prz = prizes.find(p => p.id === w.prizeId);
      const time = new Date(w.timestamp).toLocaleTimeString();
      return `${prz?.name || '未知'},${emp?.staffId},${emp?.name},${emp?.department},${time}`;
    }).join('\n');
    downloadCSV('中獎名單.csv', header + rows);
  };

  const handleResetDraw = () => {
      if(confirm('確定重置所有抽獎紀錄？所有中獎標記將被移除。')) {
          setWinners([]);
          setEmployees(prev => prev.map(e => ({...e, isWinner: false, prizeWon: undefined})));
          setShowConfetti(false);
          setDisplayNames(['準備抽獎']);
      }
  }

  const currentPrizeWinners = winners.filter(w => w.prizeId === currentPrizeId);
  const currentPrizeObj = prizes.find(p => p.id === currentPrizeId);
  const remainingCount = currentPrizeObj ? Math.max(0, currentPrizeObj.count - currentPrizeWinners.length) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left: Control Panel */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 overflow-y-auto">
        <div>
           <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
               <Settings className="w-5 h-5 text-slate-500" /> 設定與獎項
           </h3>
           
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">選擇獎項</label>
                <div className="flex gap-2">
                    <select 
                        value={currentPrizeId} 
                        onChange={(e) => setCurrentPrizeId(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg p-2 bg-slate-50"
                    >
                        {prizes.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (共 {p.count} 名)</option>
                        ))}
                    </select>
                    <button onClick={handleAddPrize} className="bg-slate-800 text-white px-3 rounded-lg hover:bg-slate-700">+</button>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">單次抽出人數</label>
                 <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={drawCount} 
                    onChange={(e) => setDrawCount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                 />
              </div>

              <div className="flex items-center gap-2 mt-2">
                 <input 
                    type="checkbox" 
                    id="repeat" 
                    checked={allowRepeatWin} 
                    onChange={e => setAllowRepeatWin(e.target.checked)}
                    className="w-4 h-4 text-party-red focus:ring-party-red border-gray-300 rounded"
                 />
                 <label htmlFor="repeat" className="text-sm text-slate-600">允許重複中獎</label>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col gap-2">
                  <button 
                    onClick={handleExportWinners} 
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                      <Download className="w-4 h-4" /> 下載中獎名單
                  </button>
                  <button 
                    onClick={handleResetDraw} 
                    className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 text-sm font-medium"
                  >
                      <RotateCcw className="w-4 h-4" /> 重置所有紀錄
                  </button>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">本獎項得主 ({currentPrizeWinners.length}/{currentPrizeObj?.count || 0})</h4>
            <ul className="space-y-1">
                {currentPrizeWinners.slice().reverse().map((w, idx) => {
                    const emp = employees.find(e => e.id === w.employeeId);
                    return (
                        <li key={w.id} className="text-sm p-2 bg-red-50 text-red-800 rounded flex justify-between">
                            <span>{emp?.name}</span>
                            <span className="text-xs text-red-400 self-center">{emp?.department}</span>
                        </li>
                    )
                })}
                {currentPrizeWinners.length === 0 && <li className="text-slate-400 text-sm italic">尚未抽出</li>}
            </ul>
        </div>
      </div>

      {/* Right: Main Animation Stage */}
      <div className="lg:col-span-2 bg-gradient-to-br from-party-red to-party-darkRed rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-party-gold opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10 text-center w-full max-w-2xl">
            <h2 className="text-party-champagne text-3xl font-bold mb-2 uppercase tracking-widest drop-shadow-md">
                {currentPrizeObj?.name || '請選擇獎項'}
            </h2>
            <p className="text-white/80 mb-8 font-medium">尚有名額: {remainingCount} 位</p>

            {/* Rolling Box */}
            <div className="bg-white rounded-2xl p-8 shadow-inner min-h-[300px] flex flex-col items-center justify-center mb-10 border-4 border-party-gold relative">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        {/* CSS Confetti simulation using simplified dots */}
                        {[...Array(20)].map((_,i) => (
                             <div key={i} className="absolute w-2 h-2 rounded-full animate-bounce-short"
                                  style={{
                                      backgroundColor: ['#FFD700', '#D32F2F', '#4CAF50', '#2196F3'][i%4],
                                      left: `${Math.random()*100}%`,
                                      top: `${Math.random()*50}%`,
                                      animationDelay: `${Math.random()}s`,
                                      animationDuration: `${1 + Math.random()}s`
                                  }}
                             />
                        ))}
                    </div>
                )}
                
                <div className="flex flex-wrap justify-center gap-4">
                    {displayNames.map((name, i) => (
                        <div key={i} className={`
                             transition-all duration-300 font-black text-slate-800 text-center
                             ${isRolling ? 'text-4xl opacity-50 blur-[1px]' : 'text-5xl md:text-6xl text-party-red scale-110 drop-shadow-lg'}
                        `}>
                            {name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Big Button */}
            <button
                onClick={startRolling}
                disabled={isRolling || remainingCount === 0}
                className={`
                    group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white transition-all duration-200 
                    ${isRolling || remainingCount === 0 ? 'bg-slate-500 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.5)] transform hover:scale-105'}
                    rounded-full
                `}
            >
                {isRolling ? (
                    <span className="flex items-center gap-3">
                        <span className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                        抽獎中...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Play className="w-6 h-6 fill-current" />
                        開始抽獎
                    </span>
                )}
            </button>
            
            {remainingCount === 0 && !isRolling && (
                <p className="mt-4 text-party-gold font-bold bg-black/20 inline-block px-4 py-1 rounded-full">
                    本獎項名額已滿
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawView;