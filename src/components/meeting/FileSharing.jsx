import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUpload, HiX, HiDocument, HiPhotograph, HiVideoCamera, HiMusicNote, HiDownload, HiTrash } from 'react-icons/hi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { saveFile, getFiles, deleteFile } from '../../utils/db';
import toast from 'react-hot-toast';

const fileIcons = { image: HiPhotograph, video: HiVideoCamera, audio: HiMusicNote, document: HiDocument };
const fileColors = { image: 'text-blue-400', video: 'text-violet-400', audio: 'text-amber-400', document: 'text-emerald-400' };

export default function FileSharing({ onClose }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    getFiles().then(f => { setFiles(f); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const handleFileSelect = (e) => {
    Array.from(e.target.files).forEach(uploadFile);
    e.target.value = '';
  };

  const uploadFile = async (f) => {
    try {
      const record = await saveFile(f);
      setFiles(prev => [...prev, record]);
      toast.success(`${f.name} uploaded`);
    } catch {
      toast.error(`Failed to upload ${f.name}`);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async (id, name) => {
    await deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success(`${name} deleted`);
  };

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file.data || new Blob([file.name]));
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">File Sharing</span>
          <Badge variant="primary" size="xs">{files.length}</Badge>
        </div>
        <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <HiUpload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Drop files here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">Files stored locally in IndexedDB</p>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {loading && <p className="text-sm text-gray-500 text-center">Loading files...</p>}

        <AnimatePresence>
          {files.map((file) => {
            const Icon = fileIcons[file.type] || HiDocument;
            const color = fileColors[file.type] || 'text-gray-400';
            return (
              <motion.div key={file.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 100 }} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                <div className={`p-2 rounded-lg bg-gray-700 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDownload(file)} className="p-1.5 text-gray-400 hover:text-white transition-colors"><HiDownload className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(file.id, file.name)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"><HiTrash className="w-4 h-4" /></button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!loading && files.length === 0 && (
          <div className="text-center py-8">
            <HiDocument className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No files shared yet</p>
          </div>
        )}
      </div>
    </div>
  );
}