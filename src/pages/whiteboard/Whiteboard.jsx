import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiPencilAlt, HiTrash, HiDownload, HiFolder, HiSave, HiLink } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#ffffff',
];

const BRUSH_SIZES = [2, 4, 8, 16];

const BOARD_STORAGE_KEY = 'connectly-whiteboards';

const TEMPLATES = [
  { id: 'brainstorm', name: 'Brainstorm' },
  { id: 'retro', name: 'Retrospective' },
  { id: 'swot', name: 'SWOT Analysis' },
  { id: 'action', name: 'Action Items' },
];

function loadBoards() {
  try {
    const stored = localStorage.getItem(BOARD_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveBoardRecord(board) {
  const boards = loadBoards();
  const next = [board, ...boards.filter((b) => b.id !== board.id)];
  try {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const startPoint = useRef(null);
  const lastPoint = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { createInstantMeeting, users } = useApp();
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [boards, setBoards] = useState(loadBoards);
  const [showBoardsModal, setShowBoardsModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [activeBoardId, setActiveBoardId] = useState(null);
  const participants = users.slice(0, 3).map((u, i) => ({
    name: u.name,
    color: ['#6366f1', '#ec4899', '#22c55e'][i % 3],
  }));

  const drawSticker = useCallback((ctx, x, y, w, h, label, fill) => {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.restore();
  }, []);

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const applyTemplate = useCallback((templateId) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const W = canvasRef.current.width;
    const H = canvasRef.current.height;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#334155';

    if (templateId === 'brainstorm') {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 90, 0, Math.PI * 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.fillText('Idea', W / 2, H / 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#cbd5e1';
      const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff', '#ffe4e6'];
      const labels = ['Idea 1', 'Idea 2', 'Idea 3', 'Idea 4', 'Idea 5'];
      for (let i = 0; i < 5; i += 1) {
        const angle = (i / 5) * Math.PI * 2;
        const x = W / 2 + Math.cos(angle) * 260;
        const y = H / 2 + Math.sin(angle) * 210;
        ctx.beginPath();
        ctx.moveTo(W / 2, H / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
        drawSticker(ctx, x - 65, y - 40, 130, 80, labels[i], colors[i]);
      }
    } else if (templateId === 'retro') {
      const colW = (W - 120) / 3;
      ['Went Well', 'To Improve', 'Action Items'].forEach((title, i) => {
        const x = 40 + i * (colW + 20);
        ctx.strokeRect(x, 60, colW, H - 120);
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText(title, x + colW / 2, 110);
        ctx.font = 'bold 14px system-ui';
        const colors = ['#dcfce7', '#fee2e2', '#dbeafe'];
        drawSticker(ctx, x + 20, 150, colW - 40, 90, '+ note', colors[i]);
        drawSticker(ctx, x + 20, 260, colW - 40, 90, '+ note', colors[i]);
      });
    } else if (templateId === 'swot') {
      const quadrants = [
        { label: 'Strengths', fill: '#dcfce7' },
        { label: 'Weaknesses', fill: '#fee2e2' },
        { label: 'Opportunities', fill: '#dbeafe' },
        { label: 'Threats', fill: '#fef9c3' },
      ];
      quadrants.forEach((q, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 60 + col * ((W - 160) / 2);
        const y = 90 + row * ((H - 200) / 2);
        ctx.fillStyle = q.fill;
        ctx.fillRect(x, y, (W - 160) / 2, (H - 200) / 2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, (W - 160) / 2, (H - 200) / 2);
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText(q.label, x + (W - 160) / 4, y + 40);
      });
    } else if (templateId === 'action') {
      ['Assignee', 'Due', 'Owner'].forEach((title, i) => {
        const x = 40 + i * ((W - 80) / 3);
        ctx.strokeRect(x, 80, (W - 120) / 3, H - 160);
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText(title, x + (W - 120) / 6, 130);
        ctx.font = 'bold 14px system-ui';
        drawSticker(ctx, x + 20, 170, (W - 160) / 3, 90, 'Task…', '#dbeafe');
        drawSticker(ctx, x + 20, 290, (W - 160) / 3, 90, 'Task…', '#dcfce7');
      });
    }

    saveToHistory();
    toast.success('Template applied to canvas');
  }, [drawSticker, saveToHistory]);

  const loadBoardImage = useCallback((board) => {
    if (!board?.dataUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      saveToHistory();
    };
    img.src = board.dataUrl;
  }, [saveToHistory]);

  useEffect(() => {
    const boardId = searchParams.get('board');
    if (!boardId) return;
    const board = loadBoards().find((b) => b.id === boardId);
    if (board) {
      loadBoardImage(board);
      setActiveBoardId(board.id);
      toast.success(`Loaded shared board "${board.name}"`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    setHistoryIndex((prev) => prev - 1);
    const img = new Image();
    img.onload = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = history[historyIndex - 1];
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex((prev) => prev + 1);
    const img = new Image();
    img.onload = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = history[historyIndex + 1];
  }, [history, historyIndex]);

  const clear = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveToHistory();
    toast.success('Canvas cleared');
  }, [saveToHistory]);

  const save = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success('Whiteboard saved as PNG');
  }, []);

  const saveCurrentBoard = () => {
    if (!canvasRef.current) return;
    const id = activeBoardId || `board-${Date.now()}`;
    const board = {
      id,
      name: boardName.trim() || 'Untitled Board',
      dataUrl: canvasRef.current.toDataURL(),
      createdAt: new Date().toISOString(),
      savedBy: user?.name || 'Unknown',
    };
    setBoards(saveBoardRecord(board));
    setActiveBoardId(id);
    setBoardName('');
    setShowBoardsModal(false);
    toast.success(`Board "${board.name}" saved`);
  };

  const shareBoard = async (board) => {
    const url = `${window.location.origin}/app/whiteboard?board=${board.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Board share link copied');
    } catch {
      toast.error('Could not copy board link');
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    startPoint.current = { x, y };
    lastPoint.current = { x, y };
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const { x, y } = getCoords(e);

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      lastPoint.current = { x, y };
    }
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext('2d');
      const { x, y } = getCoords(e);
      if (tool === 'line' || tool === 'rect') {
        const start = startPoint.current || { x, y };
        const end = lastPoint.current || { x, y };
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        } else {
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
      }
      saveToHistory();
    }
  };

  const handleStartMeeting = () => {
    const meeting = createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' });
    toast.success('Meeting started from whiteboard');
    if (meeting) navigate(`/app/meeting/room/${meeting.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Whiteboard - AdzConnect</title>
        <meta name="description" content="Collaborative whiteboard for visual brainstorming and meeting planning." />
      </Helmet>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Whiteboard</h2>
            <Badge variant="success" size="sm" dot>Live</Badge>
            <span className="text-xs text-gray-500 dark:text-slate-400">{participants.length} collaborators online</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} aria-label="Undo">Undo</Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} aria-label="Redo">Redo</Button>
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <Button variant="ghost" size="sm" icon={HiTrash} onClick={clear}>Clear</Button>
            <Button variant="outline" size="sm" icon={HiDownload} onClick={save}>Save</Button>
            <Button variant="outline" size="sm" icon={HiSave} onClick={() => { setBoardName(boards.find((b) => b.id === activeBoardId)?.name || ''); setShowBoardsModal(true); }}>Save Board</Button>
            <Button variant="outline" size="sm" icon={HiFolder} onClick={() => setShowBoardsModal(true)}>Boards</Button>
            <Button variant="primary" size="sm" onClick={handleStartMeeting}>Start Meeting</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {['pen', 'line', 'rect', 'eraser'].map((t) => (
              <button key={t} onClick={() => setTool(t)}
                className={`p-2 rounded-md transition-colors ${tool === t ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              >
                {t === 'pen' && <HiPencilAlt className="w-4 h-4" />}
                {t === 'line' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" /></svg>}
                {t === 'rect' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeWidth={2} /></svg>}
                {t === 'eraser' && <HiTrash className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c === '#ffffff' ? '#f3f4f6' : c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {BRUSH_SIZES.map((s) => (
              <button key={s} onClick={() => setBrushSize(s)}
                className={`rounded-full border transition-colors ${brushSize === s ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700'}`}
                style={{ width: Math.max(s, 8), height: Math.max(s, 8) }}
              />
            ))}
          </div>

          <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">Brush: {brushSize}px</span>

          <select
            value=""
            onChange={(e) => { if (e.target.value) applyTemplate(e.target.value); }}
            className="ml-auto text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1.5 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            title="Apply a board template"
          >
            <option value="">Templates</option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-slate-800">
          <canvas
            ref={canvasRef} width={1200} height={700}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {participants.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-gray-100 dark:border-slate-700">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: p.color }}>{p.name.charAt(0)}</div>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{p.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 shrink-0">
          <span>Click and drag to draw. Tools: Pen, Eraser, Line, Shape. Templates & shared boards available above.</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Connected</span>
            <span>{participants.length} online</span>
          </span>
        </div>
      </div>

      {/* Boards Modal */}
      <Modal
        isOpen={showBoardsModal}
        onClose={() => setShowBoardsModal(false)}
        title="Shared Boards"
        size="sm"
        footer={
          <Button variant="primary" icon={HiSave} onClick={saveCurrentBoard}>Save Current Board</Button>
        }
      >
        <div className="space-y-4">
          <Input
            label="Board Name"
            placeholder="e.g. Q3 Brainstorm"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Saved Boards</label>
            {boards.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No saved boards yet. Draw something and save it, or open one via a share link.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {boards.map((b) => (
                  <div key={b.id} className={`flex items-center gap-3 p-2 rounded-xl border transition-colors ${activeBoardId === b.id ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={b.dataUrl} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate">by {b.savedBy}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="xs" variant="ghost" icon={HiLink} onClick={() => shareBoard(b)} title="Copy share link" />
                      <Button size="xs" variant="primary" onClick={() => { loadBoardImage(b); setActiveBoardId(b.id); }}>Open</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}