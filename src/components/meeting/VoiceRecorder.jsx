import { useState, useRef, useCallback } from 'react';
import { HiMicrophone, HiStop, HiTrash, HiCheck } from 'react-icons/hi';
import { saveFile } from '../../utils/db';
import toast from 'react-hot-toast';

export default function VoiceRecorder({ onSave }) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      toast.error('Microphone access denied');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  }, []);

  const saveRecording = useCallback(async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `voicenote-${Date.now()}.webm`, { type: 'audio/webm' });
    try {
      const record = await saveFile(file);
      toast.success('Voice note saved');
      setAudioBlob(null);
      onSave?.(record);
    } catch {
      toast.error('Failed to save voice note');
    }
  }, [audioBlob, onSave]);

  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
  }, []);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!recording && !audioBlob && (
        <button onClick={startRecording} className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors" title="Record voice note">
          <HiMicrophone className="w-4 h-4" />
        </button>
      )}
      {recording && (
        <div className="flex items-center gap-2 bg-red-600/20 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-mono">{formatDuration(duration)}</span>
          <button onClick={stopRecording} className="p-1 rounded hover:bg-red-600/30 transition-colors">
            <HiStop className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
      {audioBlob && !recording && (
        <div className="flex items-center gap-2 bg-emerald-600/20 rounded-lg px-3 py-1.5">
          <span className="text-xs text-emerald-400">{formatDuration(duration)} recorded</span>
          <button onClick={saveRecording} className="p-1 rounded hover:bg-emerald-600/30 transition-colors">
            <HiCheck className="w-4 h-4 text-emerald-400" />
          </button>
          <button onClick={discardRecording} className="p-1 rounded hover:bg-red-600/30 transition-colors">
            <HiTrash className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}