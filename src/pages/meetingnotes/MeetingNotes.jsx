import { useState, useEffect } from 'react';
import { HiSave, HiPlus, HiDownload, HiPencilAlt, HiSparkles } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NOTES_KEY = 'connectly-standalone-notes';

function stripHtml(html) {
  return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '');
}

function generateAiSummary(note) {
  const text = stripHtml(note?.body || '');
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/^[\s*•\-–—]+\s*/, '').trim())
    .filter((l) => l.length > 8);
  if (lines.length === 0) return ['This note has no content to summarize. Write a few key points and try again.'];
  const bullets = lines.slice(0, 5);
  if (lines.length > 5) bullets.push(`+${lines.length - 5} more key points`);
  return bullets;
}

function loadNotes() {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: 1, title: 'Q3 Planning Notes', body: '<p>Key decisions made during Q3 planning session.</p><ul><li>Revenue target set at $2.4M</li><li>Product launch date finalized for Aug 15</li><li>Hiring 2 senior engineers</li></ul>', lastUpdated: '2h ago', author: 'Sarah C.' },
    { id: 2, title: 'Design Review Notes', body: '<p>Feedback from design review meeting.</p><ul><li>New color palette approved</li><li>Typography scale updated</li><li>Component library v3.0 to be merged</li></ul>', lastUpdated: '5h ago', author: 'Alex K.' },
    { id: 3, title: 'Sprint Retrospective', body: '<p>Action items from sprint retrospective.</p><ul><li>Improve test coverage to 85%</li><li>Reduce build time by 30%</li><li>Implement CI notification system</li></ul>', lastUpdated: '1d ago', author: 'Mike J.' },
  ];
}

export default function MeetingNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState(loadNotes);

  useEffect(() => { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }, [notes]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [aiSummary, setAiSummary] = useState(null);

  const createNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
    setNewTitle('');
    setNewBody('');
    setAiSummary(null);
  };

  const startEdit = (note) => {
    if (!note) return;
    setSelectedNote(note);
    setNewTitle(note.title);
    setNewBody(stripHtml(note.body));
    setIsEditing(true);
    setAiSummary(null);
  };

  const saveNote = (id) => {
    const body = stripHtml(isEditing ? newBody : selectedNote?.body);
    const title = stripHtml(isEditing ? newTitle : selectedNote?.title) || 'Untitled Note';
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        const updated = notes.map(n => n.id === id ? { ...n, body, title, lastUpdated: 'Just now' } : n);
        setNotes(updated);
        setSelectedNote({ ...note, body, title, lastUpdated: 'Just now' });
        setIsEditing(false);
        toast.success('Note saved successfully');
      }
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        title,
        body,
        lastUpdated: 'Just now',
        author: user?.name || 'Me',
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsEditing(false);
      setAiSummary(null);
      toast.success('Note created successfully');
    }
  };

  const exportNote = (note) => {
    if (!note) {
      toast.error('Save the note before exporting');
      return;
    }
    const blob = new Blob([stripHtml(note.body)], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `${note.title.replace(/\s+/g, '-')}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success('Note exported as TXT');
  };

  const shareNote = async (note) => {
    if (!note) {
      toast.error('Save the note before sharing');
      return;
    }
    const shareData = {
      title: `Meeting Notes: ${note.title}`,
      text: `Meeting Notes: ${note.title}\n${stripHtml(note.body)}`,
      url: `${window.location.origin}/app/meeting-notes`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Note link copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareData.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {}
      document.body.removeChild(ta);
      if (copied) {
        toast.success('Note link copied to clipboard');
      } else {
        toast.error('Could not copy the note link');
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Meeting Notes</h2>
          <Button variant="primary" fullWidth icon={HiPlus} onClick={createNewNote}>New Note</Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} onClick={() => { setSelectedNote(note); setIsEditing(false); setAiSummary(null); }}
              className={`p-4 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-colors ${selectedNote?.id === note.id ? 'bg-white dark:bg-slate-700/50 border-l-4 border-l-primary-500' : ''}`}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 whitespace-pre-wrap">{stripHtml(note.body)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">{note.lastUpdated}</span>
                <Badge variant="info" size="sm">{note.author}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote || isEditing ? (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700">
              <input type="text"
                value={isEditing ? newTitle : selectedNote?.title || ''}
                onChange={(e) => isEditing ? setNewTitle(e.target.value) : null}
                className="text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                placeholder="Untitled Note" />
              <div className="flex items-center gap-2">
                {selectedNote && !isEditing && (
                  <Button variant="ghost" size="sm" icon={HiPencilAlt} onClick={() => startEdit(selectedNote)}>Edit</Button>
                )}
                {selectedNote && !isEditing && (
                  <Button variant="ghost" size="sm" icon={HiSparkles} onClick={() => { setAiSummary(generateAiSummary(selectedNote)); }}>AI Summary</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => shareNote(selectedNote)}>Share</Button>
                <Button variant="ghost" size="sm" icon={HiDownload} onClick={() => exportNote(selectedNote)}>Export</Button>
                <Button variant="ghost" size="sm" icon={HiSave} onClick={() => saveNote(selectedNote?.id)}>Save</Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Start writing your meeting notes here...&#10;&#10;Keep it plain text. Use blank lines to separate paragraphs."
                  className="w-full h-full min-h-[400px] border-none outline-none bg-transparent text-gray-900 dark:text-white resize-none text-sm leading-relaxed font-mono" />
              ) : (
                <>
                  <div className="max-w-3xl mx-auto text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{stripHtml(selectedNote?.body)}</div>
                  {aiSummary && (
                    <div className="mt-6 rounded-2xl border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-500/10 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <HiSparkles className="w-4 h-4 text-violet-500" />
                        <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI Summary</h4>
                      </div>
                      <ul className="space-y-2">
                        {aiSummary.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>Last updated: {isEditing ? 'Just now' : selectedNote?.lastUpdated}</span>
              <span>By: {isEditing ? user?.name : selectedNote?.author}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-slate-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <h3 className="text-lg font-medium text-gray-500 dark:text-slate-400">Select a note or create a new one</h3>
              <p className="text-sm mt-1">Meeting notes, action items, and decisions are captured here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}