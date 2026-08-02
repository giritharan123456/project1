import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiSearch, HiVideoCamera, HiUser, HiChat, HiFolder, HiCheckCircle, HiBell } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { meetings, users, messages, tasks, notifications } = useApp();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 300);

  const userName = (id) => users.find((u) => u.id === id)?.name || id;

  const getStoredFiles = () => {
    try {
      const stored = localStorage.getItem('connectly-files');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  };

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return { meetings: [], users: [], messages: [], files: [], tasks: [], notifications: [] };
    const q = debouncedQuery.toLowerCase();
    const sender = (id) => users.find((u) => u.id === id)?.name || id;
    return {
      meetings: meetings.filter(m => m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.meetingId?.toLowerCase().includes(q)),
      users: users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.title?.toLowerCase().includes(q)),
      messages: messages.filter(m => m.text.toLowerCase().includes(q) || sender(m.from).toLowerCase().includes(q)),
      files: getStoredFiles().filter(f => (f.name || '').toLowerCase().includes(q) || (f.uploader || '').toLowerCase().includes(q) || (f.type || '').toLowerCase().includes(q)),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q) || (t.status || '').toLowerCase().includes(q) || (t.priority || '').toLowerCase().includes(q) || (t.tags || []).some(tag => tag.toLowerCase().includes(q))),
      notifications: notifications.filter(n => (n.title || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q) || (n.type || '').toLowerCase().includes(q)),
    };
  }, [debouncedQuery, meetings, users, messages, tasks, notifications]);

  const totalResults = results.meetings.length + results.users.length + results.messages.length + results.files.length + results.tasks.length + results.notifications.length;

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
    <Helmet>
      <title>Search - AdzConnect</title>
      <meta name="description" content="Search meetings, messages, files, and people across your AdzConnect workspace." />
    </Helmet>
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Search</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Find meetings, people, files, and more</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          icon={HiSearch}
          placeholder="Search meetings, people, messages, files, tasks..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          autoFocus
        />
      </motion.div>

      {query && (
        <motion.div variants={itemVariants}>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for <strong className="text-gray-900 dark:text-white">&ldquo;{query}&rdquo;</strong>
          </p>
        </motion.div>
      )}

      {results.meetings.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiVideoCamera className="w-5 h-5 text-primary-500" /> Meetings ({results.meetings.length})
          </h2>
          <div className="space-y-2">
            {results.meetings.map(m => (
              <Card key={m.id} hover onClick={() => navigate(`/app/meeting/${m.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <HiVideoCamera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{m.date} · {m.time}</p>
                  </div>
                  <Badge variant={m.status === 'live' ? 'success' : 'default'} size="sm">{m.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {results.users.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiUser className="w-5 h-5 text-emerald-500" /> People ({results.users.length})
          </h2>
          <div className="space-y-2">
            {results.users.map(u => (
              <Card key={u.id} hover>
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{u.title} · {u.department}</p>
                  </div>
                  <Badge variant="default" size="sm">{u.role}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {results.messages.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiChat className="w-5 h-5 text-violet-500" /> Messages ({results.messages.length})
          </h2>
          <div className="space-y-2">
            {results.messages.map(m => (
              <Card key={m.id} hover onClick={() => navigate('/app/chat')}>
                <div className="flex items-center gap-3">
                  <Avatar name={userName(m.from)} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{userName(m.from)}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400 truncate">{m.text}</p>
                  </div>
                  <Badge size="sm">{m.type === 'channel' ? m.to : 'Direct'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {results.files.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiFolder className="w-5 h-5 text-amber-500" /> Files ({results.files.length})
          </h2>
          <div className="space-y-2">
            {results.files.map(f => (
              <Card key={f.id} hover onClick={() => navigate('/app/files')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <HiFolder className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{f.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{f.size} · uploaded by {f.uploader}</p>
                  </div>
                  <Badge size="sm">{f.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {results.tasks.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5 text-rose-500" /> Tasks ({results.tasks.length})
          </h2>
          <div className="space-y-2">
            {results.tasks.map(t => (
              <Card key={t.id} hover onClick={() => navigate('/app/tasks')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                    <HiCheckCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{t.dueDate || t.due}</p>
                  </div>
                  <Badge variant={t.completed || t.status === 'done' ? 'success' : t.priority === 'high' ? 'danger' : 'default'} size="sm">{t.completed || t.status === 'done' ? 'Done' : t.status || t.priority}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {results.notifications.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HiBell className="w-5 h-5 text-sky-500" /> Notifications ({results.notifications.length})
          </h2>
          <div className="space-y-2">
            {results.notifications.map(n => (
              <Card key={n.id} hover onClick={() => navigate(n.link || '/app/notifications')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
                    <HiBell className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{n.description}</p>
                  </div>
                  <Badge variant={n.read ? 'default' : 'primary'} size="sm">{n.read ? 'Read' : 'Unread'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {query && totalResults === 0 && (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <HiSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No results found</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Try different keywords or check the spelling</p>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
