import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import {
  HiSearch, HiUpload, HiDownload, HiTrash, HiDotsVertical,
  HiDocument, HiPhotograph, HiVideoCamera, HiMicrophone,
  HiStar, HiShare, HiPencil, HiFolder,
  HiViewGrid, HiViewList, HiFilter,
  HiDocumentText, HiPresentationChartBar, HiTable,
  HiArchive, HiExternalLink, HiCheck,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const TABS = ['All Files', 'My Files', 'Shared with Me', 'Meeting Files', 'Favorites', 'Recent'];

const FILE_CATEGORIES = ['All', 'Documents', 'Images', 'Videos', 'Audio', 'Archives'];

const mockFiles = [
  { id: 1, name: 'Q3_Roadmap.pdf', type: 'pdf', size: '2.4 MB', date: 'Jul 30', dateRank: 1, uploader: 'Sarah Chen', uploaderInitials: 'SC', starred: true },
  { id: 2, name: 'Meeting_Notes_Jul29.docx', type: 'doc', size: '156 KB', date: 'Jul 29', dateRank: 2, uploader: 'Alex Morgan', uploaderInitials: 'AM', starred: false, meeting: true },
  { id: 3, name: 'Design_Mockups_v3.fig', type: 'fig', size: '12 MB', date: 'Jul 28', dateRank: 3, uploader: 'Jennifer Lee', uploaderInitials: 'JL', starred: false },
  { id: 4, name: 'Presentation_Q2.pptx', type: 'pptx', size: '5.1 MB', date: 'Jul 27', dateRank: 4, uploader: 'Emily Rodriguez', uploaderInitials: 'ER', starred: true },
  { id: 5, name: 'Budget_2026.xlsx', type: 'xlsx', size: '890 KB', date: 'Jul 26', dateRank: 5, uploader: 'David Kim', uploaderInitials: 'DK', starred: false },
  { id: 6, name: 'Team_Photo.png', type: 'img', size: '3.2 MB', date: 'Jul 25', dateRank: 6, uploader: 'James Wilson', uploaderInitials: 'JW', starred: false },
  { id: 7, name: 'Architecture_Diagram.drawio', type: 'drawio', size: '412 KB', date: 'Jul 24', dateRank: 7, uploader: 'Lisa Thompson', uploaderInitials: 'LT', starred: true, meeting: true },
  { id: 8, name: 'Sales_Report_July.pdf', type: 'pdf', size: '1.8 MB', date: 'Jul 23', dateRank: 8, uploader: 'Robert Taylor', uploaderInitials: 'RT', starred: false },
];

function getFileIcon(type) {
  switch (type) {
    case 'pdf': return HiDocumentText;
    case 'doc': return HiDocument;
    case 'pptx': return HiPresentationChartBar;
    case 'xlsx': return HiTable;
    case 'img': return HiPhotograph;
    case 'video': return HiVideoCamera;
    case 'audio': return HiMicrophone;
    case 'fig':
    case 'drawio': return HiArchive;
    default: return HiDocument;
  }
}

function getFileColor(type) {
  switch (type) {
    case 'pdf': return 'text-red-500 dark:text-red-400';
    case 'doc': return 'text-blue-500 dark:text-blue-400';
    case 'pptx': return 'text-orange-500 dark:text-orange-400';
    case 'xlsx': return 'text-emerald-500 dark:text-emerald-400';
    case 'img': return 'text-violet-500 dark:text-violet-400';
    case 'video': return 'text-rose-500 dark:text-rose-400';
    case 'audio': return 'text-amber-500 dark:text-amber-400';
    case 'fig':
    case 'drawio': return 'text-cyan-500 dark:text-cyan-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
}

export default function FilesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [files, setFiles] = useState(mockFiles);
  const [showMoreMenu, setShowMoreMenu] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const typeFromName = (name) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['ppt', 'pptx'].includes(ext)) return 'pptx';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xlsx';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'img';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (['fig', 'drawio'].includes(ext)) return 'drawio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    return 'doc';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      if (accepted.length === 0) return;
      const uploaderName = user?.name || 'You';
      const readFile = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      Promise.all(accepted.map(async (file) => {
        const dataUrl = await readFile(file);
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          type: typeFromName(file.name),
          size: file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
          date: 'Today',
          uploader: uploaderName,
          uploaderInitials: uploaderName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          starred: false,
          dateRank: 0,
          meeting: false,
          dataUrl,
        };
      })).then((uploaded) => {
        setFiles((prev) => [...uploaded, ...prev]);
        setShowUploadModal(false);
        toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded`);
      });
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
  });

  useEffect(() => {
    try {
      localStorage.setItem('connectly-files', JSON.stringify(files));
    } catch {}
  }, [files]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fileId = params.get('file');
    if (fileId) {
      const match = files.find((f) => String(f.id) === fileId);
      if (match) setSelectedFile(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleDownload = (e, file) => {
    e?.stopPropagation?.();
    const triggerDownload = (href, name) => {
      const a = document.createElement('a');
      a.href = href;
      a.download = name || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    if (file.dataUrl) {
      triggerDownload(file.dataUrl, file.name);
    } else {
      const content = `AdzConnect file record\n\nName: ${file.name}\nSize: ${file.size}\nUploaded: ${file.date} by ${file.uploader}\n\nThis is the file record for a demo file. Uploaded files include their real content.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, file.name.endsWith('.txt') ? file.name : `${file.name}.txt`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    toast.success(`Downloading ${file.name}`);
  };

  const handleRename = (file) => {
    const newName = window.prompt('Rename file', file.name);
    if (newName && newName.trim() && newName.trim() !== file.name) {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name: newName.trim() } : f)));
      toast.success('File renamed');
    }
  };

  const handleShare = async (e, file) => {
    e?.stopPropagation?.();
    const url = `${window.location.origin}/app/files?file=${encodeURIComponent(file.id)}`;
    const copyToClipboard = () => {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      document.body.removeChild(textarea);
      return ok;
    };
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {}
    if (!ok) ok = copyToClipboard();
    if (ok) {
      toast.success(`Share link copied for ${file.name}`);
    } else {
      window.prompt('Share link for this file:', url);
    }
  };

  const filteredFiles = useMemo(() => {
    let list = [...files];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') {
      const catMap = {
        Documents: ['pdf', 'doc', 'pptx', 'xlsx', 'drawio', 'fig'],
        Images: ['img'],
        Videos: ['video'],
        Audio: ['audio'],
        Archives: ['archive'],
      };
      const types = catMap[categoryFilter] || [];
      list = list.filter((f) => types.includes(f.type));
    }
    if (activeTab === 'Favorites') {
      list = list.filter((f) => f.starred);
    }
    if (activeTab === 'My Files') {
      list = list.filter((f) => f.uploader === (user?.name || 'Sarah Chen'));
    }
    if (activeTab === 'Shared with Me') {
      list = list.filter((f) => f.uploader !== (user?.name || 'Sarah Chen'));
    }
    if (activeTab === 'Meeting Files') {
      list = list.filter((f) => f.meeting);
    }
    if (activeTab === 'Recent') {
      list = [...list].sort((a, b) => (a.dateRank ?? 100) - (b.dateRank ?? 100));
    }
    return list;
  }, [files, searchQuery, categoryFilter, activeTab, user?.name]);

  const toggleStar = (id) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)));
  };

  const handleDelete = () => {
    setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const renderFileIcon = (type) => {
    const Icon = getFileIcon(type);
    return (
      <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 ${getFileColor(type)}`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  };

  const renderFileCard = (file) => (
    <motion.div key={file.id} variants={itemVariants} layout>
      <Card hover className="group relative" onClick={() => setSelectedFile(file)}>
        <div className="flex items-start gap-3">
          {renderFileIcon(file.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{file.name}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}
                className="flex-shrink-0"
              >
                {file.starred ? (
                  <HiStar className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <HiStar className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <span>{file.size}</span>
              <span>&middot;</span>
              <span>{file.date}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Avatar size="xs" name={file.uploader} />
              <span className="text-xs text-gray-500 dark:text-slate-400">{file.uploader}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button size="xs" variant="ghost" icon={HiDownload} onClick={(e) => handleDownload(e, file)} />
            <div className="relative">
              <Button
                size="xs"
                variant="ghost"
                icon={HiDotsVertical}
                onClick={(e) => { e.stopPropagation(); setShowMoreMenu(showMoreMenu === file.id ? null : file.id); }}
              />
              {showMoreMenu === file.id && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-gray-100 dark:border-slate-600 py-1 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu(null); handleRename(file); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <HiPencil className="w-3.5 h-3.5" /> Rename
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu(null); setDeleteTarget(file); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <HiTrash className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu(null); handleShare(e, file); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <HiShare className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderFileRow = (file) => (
    <motion.div key={file.id} variants={itemVariants} layout>
      <div
        onClick={() => setSelectedFile(file)}
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
      >
        {renderFileIcon(file.type)}
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900 dark:text-white truncate">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}>
                {file.starred ? (
                  <HiStar className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <HiStar className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>
          <span className="text-gray-500 dark:text-slate-400 hidden sm:block">{file.size}</span>
          <span className="text-gray-500 dark:text-slate-400 hidden md:block">{file.date}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="xs" variant="ghost" icon={HiDownload} onClick={(e) => handleDownload(e, file)} />
          <Button size="xs" variant="ghost" icon={HiTrash} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeleteTarget(file); }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
    <Helmet>
      <title>Files - AdzConnect</title>
      <meta name="description" content="Browse, upload, and manage files in your AdzConnect workspace including recordings, documents, and images." />
    </Helmet>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Files</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{files.length} total files</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="ghost" size="sm" icon={HiFilter} onClick={() => setShowFilterMenu(!showFilterMenu)}>Filter</Button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-gray-100 dark:border-slate-600 py-1 z-20">
                {FILE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowFilterMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm ${categoryFilter === cat ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                  >
                    <span>{cat}</span>
                    {categoryFilter === cat && <HiCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button icon={HiUpload} size="md" onClick={() => setShowUploadModal(true)}>Upload File</Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={HiSearch}
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {FILE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
            >
              <HiViewGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}
            >
              <HiViewList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Files Content */}
      {filteredFiles.length === 0 ? (
        <EmptyState icon={HiFolder} title="No files found" description="Upload a file or adjust your filters" />
      ) : viewMode === 'grid' ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map(renderFileCard)}
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-1">
          {filteredFiles.map(renderFileRow)}
        </motion.div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Files"
        size="md"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <HiUpload className="w-7 h-7 text-gray-500 dark:text-slate-400" />
          </div>
          {isDragActive ? (
            <p className="text-primary-600 dark:text-primary-400 font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Drag & drop files here</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">or click to browse</p>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">PDF, DOCX, PNG, JPG up to 50MB</p>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name || ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => handleShare(null, selectedFile)} icon={HiExternalLink}>Share</Button>
            <Button icon={HiDownload} onClick={() => { handleDownload(null, selectedFile); setSelectedFile(null); }}>Download</Button>
          </>
        }
      >
        {selectedFile && (
          <div className="space-y-5">
            <div className="aspect-video rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              {(() => {
                const Icon = getFileIcon(selectedFile.type);
                return <Icon className={`w-16 h-16 ${getFileColor(selectedFile.type)}`} />;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-slate-400">Size</span>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.size}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Upload Date</span>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.date}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Uploaded by</span>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar size="xs" name={selectedFile.uploader} />
                  <span className="font-medium text-gray-900 dark:text-white">{selectedFile.uploader}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Type</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedFile.type}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete File"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" icon={HiTrash} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
    </>
  );
}
