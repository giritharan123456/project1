import { useState, useEffect, useRef } from 'react';
import { HiX, HiMicrophone, HiStop } from 'react-icons/hi';
import Button from '../ui/Button';

const mockSentences = [
  "Welcome everyone to today's meeting.",
  "Let's start with the agenda for today.",
  "First, we'll discuss the Q3 roadmap.",
  "Sarah, could you share your screen?",
  "The timeline for the virtual background feature is mid-August.",
  "We've reduced latency by 34% with the WebRTC enhancements.",
  "Any questions about the rollout plan?",
  "Let me check on the budget allocation.",
  "The marketing team has prepared the launch strategy.",
  "We should prioritize the security audit findings.",
];

export default function Captions({ onClose }) {
  const [captions, setCaptions] = useState([]);
  const [active, setActive] = useState(true);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const captionsEndRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
      }
      if (finalText.trim()) {
        setCaptions(prev => [...prev.slice(-19), { id: Date.now(), text: finalText.trim(), time: new Date().toLocaleTimeString() }]);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setActive(false);
        setSupported(false);
      }
    };
    recognition.onend = () => {
      if (activeRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (active && recognitionRef.current) {
      try { recognitionRef.current.start(); } catch {}
    } else if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, [active]);

  useEffect(() => {
    if (!active || supported) return;
    const interval = setInterval(() => {
      const sentence = mockSentences[Math.floor(Math.random() * mockSentences.length)];
      setCaptions(prev => [...prev.slice(-19), { id: Date.now(), text: sentence, time: new Date().toLocaleTimeString() }]);
    }, 3000);
    return () => clearInterval(interval);
  }, [active, supported]);

  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [captions]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Live Captions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive(!active)}
            className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            title={active ? 'Stop captions' : 'Start captions'}
          >
            {active ? <HiStop className="w-4 h-4" /> : <HiMicrophone className="w-4 h-4" />}
          </button>
          <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!active && (
          <div className="text-center py-12">
            <HiMicrophone className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Captions paused</p>
            <button onClick={() => setActive(true)} className="text-xs text-primary-400 hover:underline mt-1">Resume</button>
          </div>
        )}
        {active && captions.map((cap) => (
          <div key={cap.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200">{cap.text}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cap.time}</p>
            </div>
          </div>
        ))}
        <div ref={captionsEndRef} />
      </div>
    </div>
  );
}
