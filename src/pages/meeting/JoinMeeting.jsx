import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiLink, HiKey,
  HiPlus, HiLogin, HiChevronRight,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function JoinMeeting() {
  const navigate = useNavigate();
  const { joinMeeting, createInstantMeeting, getCurrentUser } = useApp();
  const currentUser = getCurrentUser();
  const [meetingId, setMeetingId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState('');

  const handleJoinById = () => {
    if (!meetingId.trim()) {
      setError('Please enter a meeting ID');
      return;
    }
    const meeting = joinMeeting(meetingId.trim());
    if (meeting) {
      navigate(`/app/meeting/lobby/${meeting.id}`);
    } else {
      setError('Meeting not found. Please check the ID and try again.');
    }
  };

  const handleJoinByLink = () => {
    if (!inviteLink.trim()) {
      setLinkError('Please paste an invite link');
      return;
    }
    const extracted = inviteLink.match(/con-[\w-]+/)?.[0];
    if (extracted) {
      const meeting = joinMeeting(extracted);
      if (meeting) {
        navigate(`/app/meeting/lobby/${meeting.id}`);
      } else {
        setLinkError('Invalid meeting link. Please check and try again.');
      }
    } else {
      setLinkError('Could not find a valid meeting code in the link.');
    }
  };

  const handleCreateOwn = () => {
    const meeting = createInstantMeeting(currentUser);
    if (meeting) {
      navigate(`/app/meeting/lobby/${meeting.id}`);
    }
  };

  return (
    <>
    <Helmet>
      <title>Join Meeting - AdzConnect</title>
      <meta name="description" content="Join an AdzConnect meeting by entering a meeting link or code, or create an instant meeting." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/20 dark:to-violet-900/20 flex items-center justify-center mx-auto mb-4">
            <HiVideoCamera className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join a Meeting</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Enter a meeting ID or paste an invite link
          </p>
        </motion.div>

        {/* Join via Meeting ID */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <HiKey className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Meeting ID</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Enter the meeting ID provided by the host</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g. con-xxxx-xxxx"
                  value={meetingId}
                  onChange={(e) => { setMeetingId(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinById()}
                  error={error}
                  icon={HiVideoCamera}
                  autoFocus
                />
              </div>
              <Button icon={HiLogin} onClick={handleJoinById} disabled={!meetingId.trim()}>
                Join
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
          <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
        </motion.div>

        {/* Join via Invite Link */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <HiLink className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Invite Link</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Paste the full invite link you received</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://connectly.com/join/..."
                  value={inviteLink}
                  onChange={(e) => { setInviteLink(e.target.value); setLinkError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinByLink()}
                  error={linkError}
                  icon={HiLink}
                />
              </div>
              <Button variant="outline" icon={HiChevronRight} onClick={handleJoinByLink} disabled={!inviteLink.trim()}>
                Join
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Create your own */}
        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Don't have an invitation?</p>
            <Button
              variant="secondary"
              icon={HiPlus}
              onClick={handleCreateOwn}
              size="lg"
              fullWidth
            >
              Create Your Own Meeting
            </Button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
