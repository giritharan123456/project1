import { useState, useRef, useCallback, useEffect } from 'react';
import { HiPencil, HiTrash, HiDownload, HiX } from 'react-icons/hi';
import Button from '../ui/Button';
import useRealtimeChannel from '../../hooks/useRealtimeChannel';
import toast from 'react-hot-toast';

const COLORS = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];
const TOOLS = [
  { id: 'pen', icon: HiPencil, label: 'Pen' },
  { id: 'eraser', icon: HiTrash, label: 'Eraser' },
];

export default function Whiteboard({ onClose }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ffffff');
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef(null);

  const { send } = useRealtimeChannel('whiteboard', (data) => {
    const canvas = canvasRef.current;
    if (!canvas || data.type !== 'draw') return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y);
    ctx.lineTo(data.to.x, data.to.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  });

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = useCallback((e) => {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    send({ type: 'draw', from: lastPos.current, to: pos, color: ctx.strokeStyle, width: ctx.lineWidth });
    lastPos.current = pos;
  }, [isDrawing, color, tool, brushSize, send]);

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    send({ type: 'clear' });
    toast.success('Whiteboard cleared');
  };

  const exportCanvas = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Whiteboard</span>
          <div className="flex items-center gap-1 ml-3">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-125' : 'border-gray-600'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTool(t.id)} className={`p-1.5 rounded-md text-xs transition-colors ${tool === t.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`} title={t.label}>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <input type="range" min={1} max={20} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-16 h-1" />
          <Button size="xs" variant="ghost" icon={HiDownload} onClick={exportCanvas} />
          <Button size="xs" variant="ghost" icon={HiTrash} onClick={clearCanvas} />
          <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={900}
          height={600}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
}