import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPlus, HiTrash, HiPencil, HiCheck, HiDocumentText } from 'react-icons/hi';
import Button from '../ui/Button';

const STORAGE_KEY = 'connectly-meeting-notes';

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: 1, text: 'Review Q3 roadmap priorities', done: false },
    { id: 2, text: 'Discuss virtual background timeline (mid-August)', done: false },
    { id: 3, text: 'Address security audit findings', done: false },
  ];
}

export default function MeetingNotes({ onClose }) {
  const [notes, setNotes] = useState(loadNotes);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), text: newNote.trim(), done: false }]);
    setNewNote('');
  };

  const toggleDone = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, done: !n.done } : n));
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: editText.trim() } : n));
    setEditingId(null);
  };

  const exportNotes = () => {
    const text = notes.map(n => `${n.done ? '[x]' : '[ ]'} ${n.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <HiDocumentText className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium text-white">Meeting Notes</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="secondary" onClick={exportNotes}>Export</Button>
          <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 100 }} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${note.done ? 'bg-gray-800/50' : 'bg-gray-800'}`}>
              <button onClick={() => toggleDone(note.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${note.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-primary-500'}`}>
                {note.done && <HiCheck className="w-3 h-3 text-white" />}
              </button>
              {editingId === note.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(note.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-2 py-1 border border-primary-500 focus:outline-none"
                />
              ) : (
                <span className={`flex-1 text-sm ${note.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{note.text}</span>
              )}
              <div className="flex items-center gap-1">
                {editingId === note.id ? (
                  <button onClick={() => saveEdit(note.id)} className="p-1 text-emerald-400 hover:text-emerald-300"><HiCheck className="w-4 h-4" /></button>
                ) : (
                  <button onClick={() => startEdit(note)} className="p-1 text-gray-400 hover:text-white"><HiPencil className="w-3.5 h-3.5" /></button>
                )}
                <button onClick={() => deleteNote(note.id)} className="p-1 text-gray-400 hover:text-red-400"><HiTrash className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
            placeholder="Add a note..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-primary-500 placeholder-gray-500"
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <HiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}