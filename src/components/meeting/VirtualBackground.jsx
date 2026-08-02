import { useRef, useEffect, useCallback, useState } from 'react';
import { HiPhotograph, HiEyeOff, HiDesktopComputer } from 'react-icons/hi';

const BACKGROUND_IMAGES = {
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&q=80',
  coastal: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&q=80',
};

const backgrounds = [
  { id: 'none', label: 'None', icon: HiEyeOff },
  { id: 'blur', label: 'Blur', icon: HiPhotograph },
  { id: 'office', label: 'Office', icon: HiDesktopComputer },
  { id: 'coastal', label: 'Coastal', icon: HiPhotograph },
];

export default function VirtualBackground({ stream, background, onProcessedStream, onBackgroundChange, overlay = false }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const imgCacheRef = useRef({});
  const [localBg, setLocalBg] = useState(background || 'none');

  const activeBg = onBackgroundChange ? background : localBg;

  const selectBg = useCallback((id) => {
    if (onBackgroundChange) onBackgroundChange(id);
    else setLocalBg(id);
  }, [onBackgroundChange]);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { animFrameRef.current = requestAnimationFrame(processFrame); return; }
    if (video.readyState < 2) { animFrameRef.current = requestAnimationFrame(processFrame); return; }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const bg = activeBg;

    if (bg === 'none') {
      ctx.clearRect(0, 0, w, h);
    } else if (bg === 'blur') {
      ctx.drawImage(video, 0, 0, w, h);
      ctx.filter = 'blur(16px)';
      ctx.drawImage(video, 0, 0, w, h);
      ctx.filter = 'none';
    } else {
      const imgSrc = BACKGROUND_IMAGES[bg];
      if (imgSrc) {
        if (!imgCacheRef.current[bg]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imgSrc;
          imgCacheRef.current[bg] = img;
        }
        const img = imgCacheRef.current[bg];
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, w, h);
          ctx.globalAlpha = 0.3;
          ctx.drawImage(video, 0, 0, w, h);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(video, 0, 0, w, h);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [activeBg]);

  useEffect(() => {
    if (stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [stream, processFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onProcessedStream) return;
    const outStream = canvas.captureStream(30);
    onProcessedStream(outStream);
  }, [activeBg, onProcessedStream]);

  if (overlay) {
    return (
      <>
        <video ref={videoRef} className="hidden" muted playsInline />
        <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {backgrounds.map(bg => {
          const Icon = bg.icon;
          const active = activeBg === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => selectBg(bg.id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${active ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-primary-400' : 'text-gray-400'}`} />
              <span className={`text-xs ${active ? 'text-primary-400' : 'text-gray-400'}`}>{bg.label}</span>
            </button>
          );
        })}
      </div>
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="w-full rounded-lg border border-gray-700" width={320} height={240} />
    </div>
  );
}
