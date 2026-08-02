import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiCheckCircle, HiClock, HiPlusCircle,
  HiSearch, HiArrowRight,
  HiMenu,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const taskStatuses = ['all', 'todo', 'in-progress', 'done'];
const taskPriorities = ['all', 'high', 'medium', 'low'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function priorityColor(p) {
  switch (p) {
    case 'high': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
    case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
    case 'low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
  }
}

export default function TasksPage() {
  const { user } = useAuth();
  const { createInstantMeeting, tasks, setTasks, addTask, completeTask } = useApp();
  const [filter, setFilter] = useState({ status: 'all', priority: 'all' });
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const taskStatus = (t) => t.status || (t.completed ? 'done' : 'todo');

  const filtered = tasks.filter((t) => {
    const st = taskStatus(t);
    const matchStatus = filter.status === 'all' || st === filter.status;
    const matchPriority = filter.priority === 'all' || t.priority === filter.priority;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const toggleStatus = (id) => {
    const current = tasks.find((t) => t.id === id);
    const done = !(current?.status === 'done' || current?.completed);
    if (done) {
      completeTask(id);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'in-progress', completed: false } : t))
      );
    }
  };

  const addNewTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle,
      assignee: user?.name || 'You',
      assignedTo: user?.name || 'You',
      status: 'todo',
      priority: 'medium',
      dueDate: 'No date',
      tags: ['new'],
    });
    setNewTitle('');
    setShowNew(false);
    toast.success('Task created');
  };

  const handleStartMeeting = () => {
    createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' });
    toast.success('Meeting started');
  };

  return (
    <>
      <Helmet>
        <title>Tasks - AdzConnect</title>
        <meta name="description" content="Manage your tasks, track progress, and stay organized with AdzConnect task management." />
      </Helmet>
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        className="space-y-6 p-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              {filtered.length} of {tasks.length} tasks shown
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={HiPlusCircle} onClick={() => setShowNew(!showNew)}>New Task</Button>
            <Button variant="outline" icon={HiMenu} onClick={handleStartMeeting}>Team Meeting</Button>
          </div>
        </motion.div>

        {showNew && (
          <motion.div variants={itemVariants} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
                placeholder="Task title..." className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <Button variant="primary" size="sm" onClick={addNewTask}>Add</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
            <HiSearch className="w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
              className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 w-40" />
          </div>
          {taskStatuses.map((s) => (
            <button key={s} onClick={() => setFilter((p) => ({ ...p, status: s }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter.status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
              {s === 'all' ? 'All' : s === 'in-progress' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span className="text-gray-300 dark:text-slate-600">|</span>
          {taskPriorities.map((p) => (
            <button key={p} onClick={() => setFilter((f) => ({ ...f, priority: p }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter.priority === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
              {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
              <HiMenu className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <HiCheckCircle className="w-16 h-16 mx-auto text-gray-200 dark:text-slate-600 mb-4" />
              <p className="text-gray-500 dark:text-slate-400 text-lg">No tasks found</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Create a new task or adjust your filters</p>
            </Card>
          ) : (
            filtered.map((task, idx) => (
              <motion.div key={task.id} variants={itemVariants}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => toggleStatus(task.id)}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/30 transition-all cursor-pointer group"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${(task.status === 'done' || task.completed) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-slate-500 group-hover:border-primary-400'}`}>
                  {(task.status === 'done' || task.completed) && <HiCheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${(task.status === 'done' || task.completed) ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}>{task.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(task.priority)}`}>{task.priority || 'medium'}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><HiClock className="w-3 h-3" />{task.dueDate || 'No date'}</span>
                    {(task.tags || []).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="info" size="sm">{task.assignee || 'You'}</Badge>
                  <HiArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center"><HiMenu className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter((t) => taskStatus(t) === 'todo').length}</p><p className="text-xs text-gray-500 dark:text-slate-400">To Do</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-500/10 rounded-xl flex items-center justify-center"><HiClock className="w-5 h-5 text-violet-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter((t) => taskStatus(t) === 'in-progress').length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Active</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center"><HiCheckCircle className="w-5 h-5 text-emerald-500" /></div>
              <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter((t) => taskStatus(t) === 'done').length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Done</p></div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}