import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  HiSearch, HiPlay, HiDownload, HiTrash, HiStar,
  HiEye, HiShare, HiCog, HiSortAscending,
  HiVideoCamera,
  HiChevronDown,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { SAMPLE_RECORDING_URL } from '../../utils/recordings';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const FILTERS = ['All', 'Recent', 'Last Month', 'Favorites'];
const SORTS = ['Newest', 'Oldest', 'Most Viewed'];

function formatDuration(duration) {
  return duration;
}

function formatViews(views) {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

export default function RecordingsPage() {
  const { recordings, setRecordings } = useApp();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recSettings, setRecSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-recording-settings');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { autoRecord: true, cloudBackup: true, quality: '1080p', storageLimit: '1 GB' };
  });

  const allRecordings = recordings;

  const toggleStar = (id) => {
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r)));
  };

  const filteredRecordings = useMemo(() => {
    let list = [...allRecordings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.host.toLowerCase().includes(q));
    }

    if (activeFilter === 'Favorites') {
      list = list.filter((r) => r.starred);
    }

    if (activeFilter === 'Recent') {
      list = list.filter((r) => {
        const d = new Date(r.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      });
    }

    if (activeFilter === 'Last Month') {
      list = list.filter((r) => {
        const d = new Date(r.date);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return d >= monthAgo && d < now;
      });
    }

    list.sort((a, b) => {
      if (activeSort === 'Newest') return new Date(b.date) - new Date(a.date);
      if (activeSort === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (activeSort === 'Most Viewed') return b.views - a.views;
      return 0;
    });

    return list;
  }, [allRecordings, searchQuery, activeFilter, activeSort]);

  const handlePlay = (recording) => {
    setSelectedRecording(recording);
    const src = recording.url && !String(recording.url).startsWith('blob:') ? recording.url : SAMPLE_RECORDING_URL;
    setPlaybackUrl(src);
    setRating(recording.rating || 0);
    setReviewComment(recording.review || '');
    setShowReview(false);
    setShowPlayer(true);
  };

  const handleDelete = () => {
    const id = deleteTarget?.id;
    if (id !== undefined) {
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    }
    setDeleteTarget(null);
    toast.success('Recording deleted');
  };

  const handleShare = async (recording) => {
    const url = `${window.location.origin}/app/recordings?rec=${encodeURIComponent(recording.id ?? '')}`;
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
    if (navigator.share) {
      try {
        await navigator.share({ title: recording.title || 'AdzConnect Recording', text: `Watch "${recording.title}" on AdzConnect`, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {}
    if (!ok) ok = copyToClipboard();
    if (ok) {
      toast.success(`Share link copied: ${url}`);
    } else {
      window.prompt('Share link for this recording:', url);
    }
  };

  const handleSubmitReview = () => {
    if (!selectedRecording) return;
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setRecordings((prev) => prev.map((r) => (r.id === selectedRecording.id ? { ...r, rating, review: reviewComment } : r)));
    setSelectedRecording((prev) => (prev ? { ...prev, rating, review: reviewComment } : prev));
    toast.success('Review submitted!');
  };

  const handleDownload = (recording) => {
    const triggerDownload = (href, name) => {
      const a = document.createElement('a');
      a.href = href;
      a.download = name;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    const src = recording.url || SAMPLE_RECORDING_URL;
    if (src) {
      triggerDownload(src, `${recording.title.replace(/\s+/g, '-')}.mp4`);
      toast.success('Download started');
    } else {
      const transcript = `AdzConnect Recording Transcript\n\nTitle: ${recording.title}\nHost: ${recording.host}\nDate: ${recording.date}\nDuration: ${recording.duration}\nViews: ${recording.views}\n\nThis is the meeting transcript record. Video downloads are available for recordings with media attached.`;
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${recording.title.replace(/\s+/g, '-')}-transcript.txt`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Transcript downloaded');
    }
    setShowPlayer(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recId = params.get('rec');
    if (recId) {
      const match = recordings.find((r) => String(r.id) === recId);
      if (match) handlePlay(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const saveSettings = () => {
    localStorage.setItem('connectly-recording-settings', JSON.stringify(recSettings));
    setShowSettings(false);
    toast.success('Recording settings saved');
  };

  return (
    <>
    <Helmet>
      <title>Recordings - AdzConnect</title>
      <meta name="description" content="Browse, search, and manage your AdzConnect meeting recordings with playback and download options." />
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Recordings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{allRecordings.length} recordings</p>
        </div>
        <Button variant="ghost" size="sm" icon={HiCog} onClick={() => setShowSettings(true)}>
          Recording Settings
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Input
          icon={HiSearch}
          placeholder="Search recordings by title or host..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Filter & Sort */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {filter === 'Favorites' && <HiStar className="w-3.5 h-3.5 inline mr-1" />}
              {filter}
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border border-gray-200 dark:border-slate-600"
          >
            <HiSortAscending className="w-4 h-4" />
            {activeSort}
            <HiChevronDown className="w-3.5 h-3.5" />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-gray-100 dark:border-slate-600 py-1 z-10">
              {SORTS.map((sort) => (
                <button
                  key={sort}
                  onClick={() => { setActiveSort(sort); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    activeSort === sort
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-slate-200'
                  } hover:bg-gray-50 dark:hover:bg-slate-600`}
                >
                  {sort}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recordings Grid */}
      {filteredRecordings.length === 0 ? (
        <EmptyState icon={HiVideoCamera} title="No recordings found" description="Adjust your filters or search query" />
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <motion.div key={recording.id} variants={itemVariants} layout>
              <Card hover padding={false} className="overflow-hidden group">
                <div className="relative aspect-video bg-gray-900 dark:bg-slate-800">
                  <video
                    src={recording.url || SAMPLE_RECORDING_URL}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlay(recording)}
                      className="w-14 h-14 rounded-full bg-primary-600/90 hover:bg-primary-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <HiPlay className="w-6 h-6 ml-0.5" />
                    </motion.button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium">
                    {formatDuration(recording.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex-1 truncate">{recording.title}</h3>
                    <button onClick={() => toggleStar(recording.id)} className="flex-shrink-0">
                      {recording.starred ? (
                        <HiStar className="w-4 h-4 text-amber-400" />
                      ) : (
                        <HiStar className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-3">
                    <span>{recording.date}</span>
                    <span>&middot;</span>
                    <span>{recording.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar size="xs" name={recording.host} />
                      <span className="text-xs text-gray-500 dark:text-slate-400">{recording.host}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <HiEye className="w-3.5 h-3.5" />
                        {formatViews(recording.views)}
                      </span>
                      <button onClick={() => handleShare(recording)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-500 transition-colors" aria-label={`Share ${recording.title}`}>
                        <HiShare className="w-3.5 h-3.5" />
                      </button>
                      {recording.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <HiStar className="w-3.5 h-3.5" />
                          {recording.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recording Player Modal */}
      <Modal
        isOpen={showPlayer}
        onClose={() => { setShowPlayer(false); setSelectedRecording(null); setPlaybackUrl(null); }}
        title={selectedRecording?.title || ''}
        size="full"
        footer={
          <>
            <Button variant="ghost" size="sm" icon={HiShare} onClick={() => handleShare(selectedRecording)}>Share</Button>
            <Button variant="ghost" size="sm" icon={HiStar} onClick={() => setShowReview(!showReview)}>{selectedRecording?.rating ? `Rated ${selectedRecording.rating}★` : 'Review'}</Button>
            <Button variant="ghost" size="sm" icon={HiTrash} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => { setDeleteTarget(selectedRecording); setShowPlayer(false); }}>Delete</Button>
            <Button size="sm" icon={HiDownload} onClick={() => handleDownload(selectedRecording)}>Download</Button>
          </>
        }
      >
        {selectedRecording && (
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              {playbackUrl ? (
                <video
                  key={playbackUrl}
                  src={playbackUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  onError={() => {
                    if (playbackUrl !== SAMPLE_RECORDING_URL) {
                      setPlaybackUrl(SAMPLE_RECORDING_URL);
                    } else {
                      setPlaybackUrl(null);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center mx-auto mb-3">
                      <HiPlay className="w-10 h-10 text-gray-600 dark:text-slate-300 ml-1" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Video preview not available</p>
                  </div>
                </div>
              )}
            </div>
            {showReview && (
              <div className="rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Rate this recording</span>
                  {selectedRecording.rating > 0 && (
                    <Badge variant="warning" size="sm">Current rating: {selectedRecording.rating}★</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <HiStar className={`w-6 h-6 ${star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add a comment about this recording (optional)"
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" icon={HiStar} onClick={handleSubmitReview}>Submit Review</Button>
                  {rating > 0 && <span className="text-xs text-gray-500 dark:text-slate-400">Rating: {rating}★</span>}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-slate-400">Host</span>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar size="sm" name={selectedRecording.host} />
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRecording.host}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Date</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{selectedRecording.date}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Duration</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{selectedRecording.duration}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Size</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">{selectedRecording.size}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-slate-400">Description</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedRecording.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Recording"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" icon={HiTrash} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Recording Preferences"
        size="md"
        footer={
          <Button onClick={saveSettings}>Save Changes</Button>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-record meetings</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Automatically record all scheduled meetings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={recSettings.autoRecord} onChange={(e) => setRecSettings((prev) => ({ ...prev, autoRecord: e.target.checked }))} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Cloud backup</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Save recordings to cloud storage automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={recSettings.cloudBackup} onChange={(e) => setRecSettings((prev) => ({ ...prev, cloudBackup: e.target.checked }))} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Recording quality</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Select default recording quality</p>
            </div>
            <select value={recSettings.quality} onChange={(e) => setRecSettings((prev) => ({ ...prev, quality: e.target.value }))} className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>1080p</option>
              <option>720p</option>
              <option>480p</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Storage limit</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Maximum storage per recording</p>
            </div>
            <select value={recSettings.storageLimit} onChange={(e) => setRecSettings((prev) => ({ ...prev, storageLimit: e.target.value }))} className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>1 GB</option>
              <option>2 GB</option>
              <option>5 GB</option>
            </select>
          </div>
        </div>
      </Modal>
    </motion.div>
    </>
  );
}
