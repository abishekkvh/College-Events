import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Wifi, Battery, ChevronLeft, Search, Grid, RefreshCw, Monitor, Terminal, Settings } from 'lucide-react';
import { fileSystem, type FileNode } from './data';

// 👇 Your local assets 👇
import wallpaper from './assets/wallpaper.png';
import iconNotes from './assets/notes.png';
import iconZip from './assets/zip.png';

// --- Icon Mapping ---
const ICONS = {
  folder: "https://img.icons8.com/fluent/96/folder-invoices.png", 
  text: iconNotes,
  lock: iconZip,
};

// --- Types ---
type WindowData = {
  id: string;
  title: string;
  type: 'explorer' | 'notepad' | 'notes' | 'password';
  content?: FileNode | string;
  zIndex: number;
  minimized: boolean;
};

// --- Main App Component ---
export default function App() {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeZ, setActiveZ] = useState(10);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Persisted state for Notes App
  const [noteAnswers, setNoteAnswers] = useState<string[]>(Array(15).fill(""));

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 10000);
    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---
  const handleNoteUpdate = (index: number, value: string) => {
    const newAnswers = [...noteAnswers];
    newAnswers[index] = value;
    setNoteAnswers(newAnswers);
  };

  const openWindow = (id: string, title: string, type: WindowData['type'], content?: FileNode | string) => {
    const existing = windows.find(w => w.id === id);
    if (existing) {
      focusWindow(id);
      if (existing.minimized) toggleMinimize(id);
      return;
    }
    const newZ = activeZ + 1;
    setActiveZ(newZ);
    setWindows([...windows, { id, title, type, content, zIndex: newZ, minimized: false }]);
  };

  const closeWindow = (id: string) => setWindows(windows.filter(w => w.id !== id));
  
  const focusWindow = (id: string) => {
    const newZ = activeZ + 1;
    setActiveZ(newZ);
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  };

  // --- Context Menu Handlers ---
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent browser's default menu
    
    // Keep menu inside viewport bounds
    const menuWidth = 220;
    const menuHeight = 180;
    const x = e.pageX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.pageX;
    const y = e.pageY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.pageY;
    
    setContextMenu({ show: true, x, y });
  };

  const handleDesktopClick = () => {
    if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden text-slate-800 font-sans relative selection:bg-winBlue selection:text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={handleContextMenu}
      onClick={handleDesktopClick}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col gap-4 z-0">
        <DesktopIcon iconSrc={ICONS.lock} label="FinalTreasure.zip" onClick={() => openWindow('final', 'Password Required', 'password')} />
        <DesktopIcon iconSrc={ICONS.text} label="My Notes" onClick={() => openWindow('notes', 'My Notes', 'notes')} />
      </div>

      {/* The Hidden Folder */}
      <div 
        className="absolute top-10 right-20 flex flex-col items-center gap-1 w-24 opacity-[0.02] hover:opacity-20 cursor-pointer transition-opacity duration-500 group z-0"
        onDoubleClick={() => openWindow('explorer', 'File Explorer', 'explorer', fileSystem)}
      >
        <div className="p-3 rounded-xl border border-transparent group-hover:border-white/10 group-hover:bg-white/10 transition-all duration-200">
          <img src={ICONS.folder} alt="Secret Folder" className="w-12 h-12 pointer-events-none select-none" draggable={false} />
        </div>
        <span className="text-xs text-center font-medium text-white shadow-sm select-none">???</span>
      </div>

      {/* Render Windows */}
      {windows.map(win => !win.minimized && (
        <Window 
          key={win.id} 
          data={win} 
          onClose={() => closeWindow(win.id)} 
          onFocus={() => focusWindow(win.id)}
          onMinimize={() => toggleMinimize(win.id)}
          openWindow={openWindow}
          isActive={win.zIndex === activeZ}
          noteProps={{ answers: noteAnswers, onUpdate: handleNoteUpdate }}
        />
      ))}

      {/* Custom Right-Click Context Menu */}
      {contextMenu.show && (
        <div 
          className="absolute z-[99999] w-52 bg-white/60 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-xl p-1.5 flex flex-col text-sm font-medium text-slate-800 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg transition-colors text-left" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 text-blue-500" /> Refresh
          </button>
          <div className="w-full h-px bg-white/40 my-1"></div>
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg transition-colors text-left">
            <Monitor className="w-4 h-4 text-slate-500" /> Display settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg transition-colors text-left" onClick={() => openWindow('terminal', 'Windows Terminal', 'notepad', 'C:\\Users\\Guest> _')}>
            <Terminal className="w-4 h-4 text-slate-700" /> Open in Terminal
          </button>
          <div className="w-full h-px bg-white/40 my-1"></div>
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg transition-colors text-left" onClick={() => confetti({ particleCount: 100, spread: 70 })}>
            <Settings className="w-4 h-4 text-purple-500" /> Personalize
          </button>
        </div>
      )}

      {/* Windows 12 Floating Taskbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl px-2 py-2 backdrop-blur-3xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center gap-2 z-[9999]">
        
        {/* Start Button */}
        <button className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group mx-1">
          <Grid className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
        </button>
        
        {/* Search */}
        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-1.5 rounded-full transition-all duration-200 mx-1">
          <Search className="w-4 h-4 text-slate-200" />
          <span className="text-sm text-slate-200 pr-8">Search...</span>
        </button>

        <div className="w-px h-8 bg-white/20 mx-1 rounded-full"></div>
        
        {/* Open App Icons */}
        <div className="flex items-center gap-1">
          {windows.map(win => {
            const isActive = win.zIndex === activeZ && !win.minimized;
            return (
              <button 
                key={`tb-${win.id}`} 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing context menu if open
                  if (win.minimized) {
                    toggleMinimize(win.id);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
              >
                <img 
                  src={win.type === 'explorer' ? ICONS.folder : win.type === 'password' ? ICONS.lock : ICONS.text} 
                  alt="App Icon" 
                  className="w-6 h-6 pointer-events-none drop-shadow-sm" 
                  draggable={false}
                />
                {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>}
                {!isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-white/50 rounded-full"></div>}
              </button>
            )
          })}
        </div>
        
        <div className="w-px h-8 bg-white/20 mx-1 rounded-full"></div>
        
        {/* System Tray */}
        <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium text-white cursor-default">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

// --- Desktop Icon Component ---
function DesktopIcon({ iconSrc, label, onClick }: { iconSrc: string, label: string, onClick: () => void }) {
  return (
    <div onDoubleClick={onClick} className="flex flex-col items-center gap-1.5 w-24 cursor-pointer group">
      <div className="p-3 rounded-xl border border-transparent group-hover:border-white/10 group-hover:bg-white/10 group-hover:backdrop-blur-sm transition-all duration-200">
        <img src={iconSrc} alt={label} className="w-12 h-12 drop-shadow-md pointer-events-none select-none" draggable={false} />
      </div>
      <span className="text-xs text-center text-white font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] px-1 leading-tight select-none">
        {label}
      </span>
    </div>
  );
}

// --- Draggable Window Wrapper ---
function Window({ 
  data, 
  onClose, 
  onFocus, 
  onMinimize,
  openWindow,
  isActive,
  noteProps
}: { 
  data: WindowData, 
  onClose: () => void, 
  onFocus: () => void, 
  onMinimize: () => void,
  openWindow: (id: string, title: string, type: WindowData['type'], content?: FileNode | string) => void,
  isActive: boolean,
  noteProps: { answers: string[], onUpdate: (i: number, v: string) => void }
}) {
  const [pos, setPos] = useState(() => ({ x: window.innerWidth / 2 - 300 + Math.random() * 40, y: window.innerHeight / 2 - 200 + Math.random() * 40 }));
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    onFocus();
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  return (
    <div 
      className={`absolute flex flex-col rounded-xl overflow-hidden backdrop-blur-3xl transition-all duration-200 
        ${isActive ? 'bg-slate-50/80 shadow-[0_12px_48px_rgba(0,0,0,0.4)] border border-white/60' : 'bg-slate-50/60 shadow-2xl border border-white/30'}
      `}
      style={{ left: pos.x, top: pos.y, width: 600, height: 400, zIndex: data.zIndex }}
      onPointerDown={onFocus}
      onClick={(e) => e.stopPropagation()} // Prevent desktop clicks from triggering when clicking window
    >
      {/* Title Bar */}
      <div 
        className="flex justify-between items-center pl-4 pr-3 py-2 bg-white/40 border-b border-white/20 select-none cursor-default"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2">
          <img 
            src={data.type === 'explorer' ? ICONS.folder : data.type === 'password' ? ICONS.lock : ICONS.text} 
            className="w-4 h-4 pointer-events-none select-none" 
            alt="icon" 
            draggable={false}
          />
          <span className="text-xs font-semibold text-slate-700">{data.title}</span>
        </div>
        
        {/* Rounded Color Controls (macOS style) */}
        <div className="flex items-center gap-2 window-controls">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-3.5 h-3.5 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm transition-colors" />
          <button className="w-3.5 h-3.5 rounded-full bg-green-400 hover:bg-green-500 shadow-sm transition-colors" />
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3.5 h-3.5 rounded-full bg-red-400 hover:bg-red-500 shadow-sm transition-colors" />
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-auto p-4 bg-white/30 cursor-default">
        {data.type === 'explorer' && <FileExplorer node={data.content as FileNode} openWindow={openWindow} />}
        {data.type === 'notepad' && <div className="font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{data.content as string}</div>}
        {data.type === 'notes' && <NotesApp answers={noteProps.answers} onUpdate={noteProps.onUpdate} />}
        {data.type === 'password' && <PasswordApp />}
      </div>
    </div>
  );
}

// --- File Explorer Component ---
function FileExplorer({ 
  node, 
  openWindow 
}: { 
  node: FileNode, 
  openWindow: (id: string, title: string, type: WindowData['type'], content?: FileNode | string) => void 
}) {
  const [history, setHistory] = useState<FileNode[]>([node]);
  const currentFolder = history[history.length - 1];

  const navigateIn = (folder: FileNode) => setHistory([...history, folder]);
  const navigateOut = () => { if (history.length > 1) setHistory(history.slice(0, -1)); };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 bg-white/50 backdrop-blur-md border border-white/30 p-2 rounded-lg shadow-sm">
        <button onClick={navigateOut} disabled={history.length === 1} className="p-1.5 disabled:opacity-30 hover:bg-white/60 rounded-md transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="text-sm font-medium text-slate-700 flex-1 truncate px-2 border-l border-slate-300">
          {history.map(h => h.name).join(' / ')}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 auto-rows-min">
        {currentFolder.children?.map((child, idx) => (
          <div 
            key={idx} 
            onDoubleClick={() => child.isFolder ? navigateIn(child) : openWindow(`file-${child.name}`, child.name, 'notepad', child.content)}
            className="flex flex-col items-center gap-2 p-3 hover:bg-white/40 border border-transparent hover:border-white/40 rounded-xl cursor-pointer transition-all"
          >
            <img 
              src={child.isFolder ? ICONS.folder : ICONS.text} 
              alt={child.name} 
              className="w-12 h-12 pointer-events-none select-none drop-shadow-sm" 
              draggable={false}
            />
            <span className="text-xs text-center font-medium text-slate-800 truncate w-full px-1">{child.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Notes App Component ---
function NotesApp({ answers, onUpdate }: { answers: string[], onUpdate: (index: number, value: string) => void }) {
  return (
    <div className="h-full flex flex-col bg-yellow-100/80 backdrop-blur-md rounded-xl shadow-inner border border-yellow-200/60 overflow-hidden">
      <div className="bg-yellow-200/50 p-3 border-b border-yellow-300/50 flex justify-between items-center">
        <span className="font-bold text-yellow-800/80 text-sm tracking-wide uppercase">Clue Tracker</span>
        <span className="text-xs text-yellow-800/50">{answers.filter(a => a.length > 0).length} / 15 found</span>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-1">
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center group">
            <span className="w-8 text-right pr-2 font-mono text-sm font-bold text-yellow-700/60 select-none group-hover:text-yellow-800 transition-colors">
              {index + 1}.
            </span>
            <input 
              type="text" 
              value={answer}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder="Type answer here..."
              className="flex-1 bg-transparent border-b border-yellow-600/10 focus:border-yellow-600/50 px-2 py-1 text-sm font-medium text-slate-800 placeholder-yellow-800/30 focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Final Treasure Password App ---
function PasswordApp() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');

  const checkPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === 'YEN') {
      setStatus('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0078D4', '#FFF', '#FFD700'] });
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 animate-in fade-in zoom-in duration-500">
        <span className="text-7xl drop-shadow-lg">🏆</span>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">System Unlocked!</h2>
        <p className="font-medium text-slate-700">Congratulations! You successfully parsed the file system and solved the digital treasure hunt.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center space-y-6">
      <div className="bg-yellow-50/80 backdrop-blur-sm p-5 rounded-xl text-sm font-medium text-yellow-900 border border-yellow-200 shadow-sm">
        This archive is encrypted. Take the FIRST LETTER of each answer (clues 1-15) in order. They spell a SECRET QUESTION. Type the ANSWER to that question below.
      </div>
      <form onSubmit={checkPassword} className="w-full space-y-4">
        <input 
          type="text" 
          placeholder="Enter decryption key..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-md font-mono text-center shadow-inner transition-transform ${status === 'error' ? 'animate-[shake_0.2s_ease-in-out_0s_2] border-red-400 ring-2 ring-red-400' : 'border-slate-300'}`}
        />
        {status === 'error' && <p className="text-red-500 text-sm font-bold">Access Denied. Invalid Key.</p>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-colors">
          Decrypt
        </button>
      </form>
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}