import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMicrophone, HiStop, HiX } from 'react-icons/hi';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

const COMMANDS = {
  'mute': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); toast.success('Voice: Mute toggled'); },
  'unmute': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); toast.success('Voice: Unmute toggled'); },
  'share screen': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' })); toast.success('Voice: Sharing screen'); },
  'stop sharing': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' })); toast.success('Voice: Stopped sharing'); },
  'raise hand': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })); toast.success('Voice: Hand raised'); },
  'lower hand': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })); toast.success('Voice: Hand lowered'); },
  'show chat': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' })); toast.success('Voice: Chat opened'); },
  'start recording': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' })); toast.success('Voice: Recording started'); },
  'stop recording': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' })); toast.success('Voice: Recording stopped'); },
  'toggle camera': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' })); toast.success('Voice: Camera toggled'); },
  'fullscreen': () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); toast.success('Voice: Fullscreen toggled'); },
};

const suggestions = Object.keys(COMMANDS);

export default function VoiceCommandsUI({ onClose }) {
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([]);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) {
        setTranscript(final);
        const lower = final.toLowerCase().trim();
        const matched = Object.entries(COMMANDS).find(([cmd]) => lower.includes(cmd));
        if (matched) {
          matched[1]();
          setHistory(prev => [{ command: matched[0], time: 'just now', status: 'executed' }, ...prev]);
        } else {
          setHistory(prev => [{ command: final, time: 'just now', status: 'failed' }, ...prev]);
        }
      }
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error('Speech recognition error');
    };
    return () => { try { recognition.abort(); } catch {} };
  }, []);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported in this browser'); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setListening(true);
        setTranscript('');
      } catch { toast.error('Failed to start speech recognition'); }
    }
  }, [listening]);

  return (
    <Card>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Voice Commands</h3>
          {onClose && (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <HiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center py-4">
          <button
            onClick={toggleListening}
            className="relative flex items-center justify-center"
          >
            {listening && (
              <>
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-16 h-16 rounded-full bg-primary-400/30"
                />
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute w-20 h-20 rounded-full bg-primary-400/20"
                />
                <motion.span
                  animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute w-24 h-24 rounded-full bg-primary-400/10"
                />
              </>
            )}
            <motion.div
              animate={listening ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {listening ? <HiStop className="w-6 h-6" /> : <HiMicrophone className="w-6 h-6" />}
            </motion.div>
          </button>

          {listening && (
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-1 h-6">
                {[0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 4 * height * 5, 4], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-primary-500 rounded-full"
                  />
                ))}
                <span className="ml-2 text-sm text-primary-600 dark:text-primary-400 font-medium">Listening...</span>
              </div>
              {transcript && <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Heard: "{transcript}"</p>}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Commands</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  const matched = COMMANDS[cmd];
                  if (matched) { matched(); setHistory(prev => [{ command: cmd, time: 'just now', status: 'executed' }, ...prev]); }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Command History</p>
          <div className="space-y-1">
            <AnimatePresence>
              {history.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      entry.status === 'executed' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-slate-300">{entry.command}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{entry.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No commands yet. Start speaking or click a command.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}