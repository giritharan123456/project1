import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiPlus } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const mockActionItems = [
  { id: 1, text: 'Draft proposal for developer relations program budget', assignedTo: 'Rachel Torres', dueDate: '2024-08-02', priority: 'High', completed: false },
  { id: 2, text: 'Coordinate with data science team on domain-specific translation training data', assignedTo: 'Emily Nakamura', dueDate: '2024-07-28', priority: 'High', completed: true },
  { id: 3, text: 'Patch identified security vulnerabilities - prioritize by severity', assignedTo: 'Marcus Johnson', dueDate: '2024-07-31', priority: 'High', completed: false },
  { id: 4, text: 'Draft updated data handling policies for GDPR compliance', assignedTo: 'Sarah Chen', dueDate: '2024-08-15', priority: 'Medium', completed: false },
  { id: 5, text: 'Create custom model training plan for technical jargon translation', assignedTo: 'David Park', dueDate: '2024-08-10', priority: 'Medium', completed: false },
  { id: 6, text: 'Prepare marketing campaign assets for Connectly Spaces launch', assignedTo: 'Rachel Torres', dueDate: '2024-08-20', priority: 'Low', completed: false },
];

const assigneeOptions = ['Unassigned', 'Rachel Torres', 'Emily Nakamura', 'Marcus Johnson', 'Sarah Chen', 'David Park'];
const priorityOptions = ['High', 'Medium', 'Low'];
const priorityColors = { High: 'danger', Medium: 'warning', Low: 'default' };

export default function AIActionItems({ actionItems = mockActionItems }) {
  const [items, setItems] = useState(actionItems);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [assignee, setAssignee] = useState('Unassigned');
  const [priority, setPriority] = useState('Medium');

  const toggleComplete = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) {
      toast.error('Action item title is required');
      return;
    }
    const newItem = {
      id: `ai-${Date.now()}`,
      text: title,
      assignedTo: assignee || 'Unassigned',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      priority: priority || 'Medium',
      completed: false,
    };
    setItems(prev => [...prev, newItem]);
    setNewTitle('');
    setAssignee('Unassigned');
    setPriority('Medium');
    setIsAdding(false);
    toast.success('Action item added');
  };

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Items</h3>
          <Badge variant="primary">{items.filter(i => !i.completed).length} remaining</Badge>
        </div>

        <div className="space-y-2">
          {items.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">No action items yet. Attend the meeting and exchange chat messages so AI can extract action items.</p>
          )}
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                item.completed ? 'bg-gray-50 dark:bg-slate-700/20' : 'bg-white dark:bg-slate-700/40'
              }`}
            >
              <button
                onClick={() => toggleComplete(item.id)}
                className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  item.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-300 dark:border-slate-500 hover:border-primary-400'
                }`}
              >
                {item.completed && <HiCheck className="w-3.5 h-3.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.completed ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}>
                  {item.text}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={item.assignedTo} size="xs" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">{item.assignedTo}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Due: {item.dueDate}</span>
                  <Badge variant={priorityColors[item.priority]} size="sm">{item.priority}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {isAdding && (
          <div className="rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 p-3 space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="What needs to be done?"
              className={inputClass}
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className={inputClass}
              >
                {assigneeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`${inputClass} shrink-0 w-28`}
              >
                {priorityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setIsAdding(false); setNewTitle(''); }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Add item
              </button>
            </div>
          </div>
        )}

        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            <HiPlus className="w-4 h-4" />
            Add action item
          </button>
        )}
      </div>
    </Card>
  );
}
