import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiPlus, HiUsers, HiCube, HiOfficeBuilding, HiColorSwatch, HiLightningBolt } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const mockWorkspaces = [
  { id: 1, name: 'Acme Corp', members: 24, icon: HiOfficeBuilding, color: 'from-primary-500 to-blue-500' },
  { id: 2, name: 'Design Studio', members: 12, icon: HiColorSwatch, color: 'from-violet-500 to-purple-500' },
  { id: 3, name: 'Dev Team Alpha', members: 8, icon: HiCube, color: 'from-emerald-500 to-teal-500' },
  { id: 4, name: 'StartupX', members: 18, icon: HiLightningBolt, color: 'from-amber-500 to-orange-500' },
];

export default function WorkspaceSelectionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null);

  const handleJoin = async (workspace) => {
    setIsLoading(workspace.id);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(`Joined ${workspace.name}`);
      navigate('/auth/setup');
    } catch {
      toast.error('Failed to join workspace');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCreate = () => {
    navigate('/auth/setup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Helmet>
        <title>Select Workspace - AdzConnect</title>
        <meta name="description" content="Choose your AdzConnect workspace to access meetings, chat, and team collaboration tools." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiUsers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Choose a workspace</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Join an existing workspace or create a new one</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          {mockWorkspaces.map((workspace) => (
            <motion.div
              key={workspace.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleJoin(workspace)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workspace.color} flex items-center justify-center flex-shrink-0`}>
                <workspace.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">{workspace.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{workspace.members} members</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                loading={isLoading === workspace.id}
                onClick={() => handleJoin(workspace)}
              >
                Join
              </Button>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer"
            onClick={handleCreate}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <HiPlus className="w-6 h-6 text-gray-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Create new workspace</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Set up a workspace for your team</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
