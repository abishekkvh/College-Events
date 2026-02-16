import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Wifi, Battery, ChevronLeft, Grid, RefreshCw, Settings } from 'lucide-react';
import { fileSystem, type FileNode } from './data';

// --- Local Assets ---
import wallpaper from './assets/wallpaper.png';
import iconNotes from './assets/notes.png';
import iconZip from './assets/zip.png';

const ICONS = {
  folder: "https://img.icons8.com/fluent/96/folder-invoices.png", 
  text: iconNotes,
  lock: iconZip,
};

type WindowData = {
  id: string;
  title: string;
  type: 'explorer' | 'notepad' | 'notes' | 'password';
  content?: FileNode | string;
  zIndex: number;
  minimized: boolean;
};

export default function App() {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeZ, setActiveZ] = useState(10);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [noteAnswers, setNoteAnswers] = useState<string[]>(Array(15).fill(""));
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 10000);
    return () => clearInterval(timer);
  }, []);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = e.pageX + 220 > window.innerWidth ? window.innerWidth - 230 : e.pageX;
    const y = e.pageY + 180 > window.innerHeight ? window.innerHeight - 190 : e.pageY;
    setContextMenu({ show: true, x, y });
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden text-slate-800 font-sans relative select-none bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={handleContextMenu}
      onClick={() => contextMenu.show && setContextMenu({ ...contextMenu, show: false })}
    >
      <div className="absolute top-4 left-4 flex flex-col gap-4 z-0">
        <DesktopIcon iconSrc={ICONS.lock} label="FinalTreasure.zip" onClick={() => openWindow('final', 'Password Required', 'password')} />
        <DesktopIcon iconSrc={ICONS.text} label="My Notes" onClick={() => openWindow('notes', 'My Notes', 'notes')} />
      </div>

      <div 
        className="absolute top-10 right-20 flex flex-col items-center gap-1 w-24 opacity-[0.01] hover:opacity-10 transition-opacity duration-700 group z-0"
        onDoubleClick={() => openWindow('explorer', 'File Explorer', 'explorer', fileSystem)}
      >
        <div className="p-3 rounded-xl border border-transparent group-hover:border-white/5 transition-all duration-200">
          <img src={ICONS.folder} alt="Secret" className="w-12 h-12 pointer-events-none select-none" draggable={false} />
        </div>
        <span className="text-[10px] text-center font-medium text-white/20">???</span>
      </div>

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

      {contextMenu.show && (
        <div 
          className="absolute z-[99999] w-52 bg-white/60 backdrop-blur-3xl border border-white/40 shadow-xl rounded-xl p-1.5 flex flex-col text-sm font-medium animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg text-left" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 text-blue-500" /> Refresh
          </button>
          <div className="w-full h-px bg-white/40 my-1" />
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-lg text-left" onClick={() => confetti({ particleCount: 100, spread: 70 })}>
            <Settings className="w-4 h-4 text-purple-500" /> Personalize
          </button>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl px-2 py-2 backdrop-blur-3xl bg-white/10 border border-white/20 shadow-2xl flex items-center gap-2 z-[9999]">
        <button className="p-2 hover:bg-white/20 rounded-xl transition-all group mx-1">
          <Grid className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
        </button>
        <div className="w-px h-8 bg-white/20 mx-1 rounded-full" />
        <div className="flex items-center gap-1">
          {windows.map(win => {
            const isActive = win.zIndex === activeZ && !win.minimized;
            return (
              <button 
                key={`tb-${win.id}`} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (win.minimized) {
                    toggleMinimize(win.id);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`relative p-2.5 rounded-xl transition-all ${isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
              >
                <img src={win.type === 'explorer' ? ICONS.folder : win.type === 'password' ? ICONS.lock : ICONS.text} alt="icon" className="w-6 h-6" />
                {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-400 rounded-full shadow-lg" />}
              </button>
            )
          })}
        </div>
        <div className="w-px h-8 bg-white/20 mx-1 rounded-full" />
        <div className="flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-white">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ iconSrc, label, onClick }: { iconSrc: string, label: string, onClick: () => void }) {
  return (
    <div onDoubleClick={onClick} className="flex flex-col items-center gap-1.5 w-24 group cursor-default">
      <div className="p-3 rounded-xl border border-transparent group-hover:border-white/10 group-hover:bg-white/10 group-hover:backdrop-blur-sm transition-all duration-200">
        <img src={iconSrc} alt={label} className="w-12 h-12 drop-shadow-md pointer-events-none" draggable={false} />
      </div>
      <span className="text-xs text-center text-white font-semibold drop-shadow-md px-1 select-none">{label}</span>
    </div>
  );
}

function Window({ data, onClose, onFocus, onMinimize, openWindow, isActive, noteProps }: { 
  data: WindowData, 
  onClose: () => void, 
  onFocus: () => void, 
  onMinimize: () => void,
  openWindow: (id: string, title: string, type: WindowData['type'], content?: FileNode | string) => void,
  isActive: boolean,
  noteProps: { answers: string[], onUpdate: (i: number, v: string) => void }
}) {
  const [pos, setPos] = useState(() => {
    if (data.type === 'notes') return { x: window.innerWidth - 320, y: 20 };
    return { x: window.innerWidth / 2 - 300 + Math.random() * 20, y: window.innerHeight / 2 - 200 + Math.random() * 20 };
  });

  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onFocus();
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setPos({ 
      x: dragRef.current.initialX + (e.clientX - dragRef.current.startX), 
      y: dragRef.current.initialY + (e.clientY - dragRef.current.startY) 
    });
  };

  return (
    <div 
      className={`absolute flex flex-col rounded-xl overflow-hidden backdrop-blur-3xl transition-shadow duration-200 ${isActive ? 'bg-slate-50/80 shadow-2xl border border-white/60' : 'bg-slate-50/60 shadow-lg border border-white/30'}`}
      style={{ left: pos.x, top: pos.y, width: data.type === 'notes' ? 300 : 600, height: 400, zIndex: data.zIndex }}
      onPointerDown={onFocus}
    >
      <div 
        className="flex justify-between items-center pl-4 pr-3 py-2 bg-white/40 border-b border-white/20 cursor-default" 
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={() => dragRef.current = null}
      >
        <div className="flex items-center gap-2">
          <img src={data.type === 'explorer' ? ICONS.folder : data.type === 'password' ? ICONS.lock : ICONS.text} className="w-4 h-4" alt="icon" />
          <span className="text-xs font-semibold text-slate-700">{data.title}</span>
        </div>
        <div className="flex items-center gap-2 window-controls">
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm" />
          <button className="w-3 h-3 rounded-full bg-green-400 shadow-sm opacity-50 cursor-not-allowed" />
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 shadow-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-white/30">
        {data.type === 'explorer' && <FileExplorer node={data.content as FileNode} openWindow={openWindow} />}
        {data.type === 'notepad' && <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">{data.content as string}</div>}
        {data.type === 'notes' && <NotesApp answers={noteProps.answers} onUpdate={noteProps.onUpdate} />}
        {data.type === 'password' && <PasswordApp />}
      </div>
    </div>
  );
}

// (Remaining Components: FileExplorer, NotesApp, PasswordApp)
function FileExplorer({ node, openWindow }: { 
  node: FileNode, 
  openWindow: (id: string, title: string, type: WindowData['type'], content?: FileNode | string) => void 
}) {
  const [history, setHistory] = useState<FileNode[]>([node]);
  const currentFolder = history[history.length - 1];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 bg-white/50 backdrop-blur-md border border-white/30 p-2 rounded-lg shadow-sm">
        <button onClick={() => history.length > 1 && setHistory(history.slice(0, -1))} disabled={history.length === 1} className="p-1.5 disabled:opacity-30 hover:bg-white/60 rounded-md transition-colors">
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
            onDoubleClick={() => child.isFolder ? setHistory([...history, child]) : openWindow(`file-${child.name}`, child.name, 'notepad', child.content)}
            className="flex flex-col items-center gap-2 p-3 hover:bg-white/40 border border-transparent hover:border-white/40 rounded-xl cursor-default transition-all"
          >
            <img src={child.isFolder ? ICONS.folder : ICONS.text} alt={child.name} className="w-12 h-12 drop-shadow-sm" />
            <span className="text-xs text-center font-medium truncate w-full">{child.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesApp({ answers, onUpdate }: { answers: string[], onUpdate: (index: number, value: string) => void }) {
  return (
    <div className="h-full flex flex-col bg-yellow-100/80 rounded-xl border border-yellow-200/60 overflow-hidden">
      <div className="bg-yellow-200/50 p-2 border-b border-yellow-300/50 text-center"><span className="text-xs font-bold text-yellow-800 uppercase italic tracking-tighter">Clue Tracker</span></div>
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {answers.map((ans, i) => (
          <div key={i} className="flex items-center group">
            <span className="w-6 text-right pr-2 font-mono text-[10px] font-bold text-yellow-700/60">{i + 1}.</span>
            <input type="text" value={ans} onChange={(e) => onUpdate(i, e.target.value)} placeholder="..." className="flex-1 bg-transparent border-b border-yellow-600/10 focus:border-yellow-600/50 px-2 py-0.5 text-xs focus:outline-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordApp() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === 'YEN') {
      setStatus('success');
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 600);
    }
  };
  if (status === 'success') return <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2 animate-in fade-in zoom-in"><span className="text-6xl">💎</span><h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">SUCCESS!</h2><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gyan Mitra '26 Champion</p></div>;
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto space-y-4">
      <div className="bg-blue-50/80 p-4 rounded-xl text-[10px] font-bold text-blue-900 border border-blue-100 leading-relaxed shadow-sm uppercase italic">Decryption Protocol: Combine the first letter of Clues 1-15 to form a question. Type the answer to that question below.</div>
      <form onSubmit={check} className="w-full space-y-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="KEY_PHRASE" className={`w-full px-4 py-3 border rounded-xl bg-white/60 font-mono text-center shadow-inner transition-all ${status === 'error' ? 'animate-shake border-red-400 ring-2 ring-red-100' : 'border-slate-200'}`} />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-lg uppercase tracking-tighter">Decrypt Archive</button>
      </form>
    </div>
  );
}