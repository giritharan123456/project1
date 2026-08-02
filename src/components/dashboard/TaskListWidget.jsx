import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi';
import Card from '../ui/Card';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function TaskListWidget() {
  const { tasks, completeTask, addTask, getCurrentUser } = useApp();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState('');

  const userTasks = tasks.filter(t => !t.completed && (t.assignedTo === currentUser?.email || t.assignedTo === currentUser?.id || t.assignedTo === 'You' || t.assignedTo === currentUser?.name));
  const recentTasks = userTasks.slice(0, 5);

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask({ title: newTask, assignedTo: currentUser?.email || 'u7', assignedBy: currentUser?.name, assignee: currentUser?.name || 'You', status: 'todo', priority: 'medium', dueDate: 'No date', tags: [] });
    setNewTask('');
    toast.success('Task added!');
  };

  const openTasks = () => navigate('/app/tasks');

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">My Tasks</h3>
        <button onClick={openTasks} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">View all</button>
      </div>
      <div className="space-y-2">
        {recentTasks.map((t) => (
          <div key={t.id} onClick={openTasks} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
            <button onClick={(e) => { e.stopPropagation(); completeTask(t.id); toast.success('Task completed!'); }}>
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 group-hover:border-primary-500 transition-colors inline-block" />
            </button>
            <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">{t.title}</span>
          </div>
        ))}
        {recentTasks.length === 0 && (
          <div onClick={openTasks} className="space-y-2 cursor-pointer">
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 inline-block" />
              <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">Prepare weekly status report</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 inline-block" />
              <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">Review team pull requests</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 inline-block" />
              <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">Update project documentation</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Quick add task..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-slate-300 placeholder-gray-400"
        />
        <button onClick={handleAdd} disabled={!newTask.trim()} className="p-1 text-primary-500 hover:text-primary-600 disabled:opacity-50">
          <HiPlus className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}