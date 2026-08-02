import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiUserGroup, HiCheckCircle, HiClock, HiXCircle,
  HiSearch, HiPlay, HiVideoCamera, HiBadgeCheck, HiShieldCheck, HiTrash,
  HiMicrophone, HiVolumeOff, HiVolumeUp, HiVideoCamera as HiVideoCameraIcon, HiLockClosed, HiUsers, HiX,
} from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Toggle from '../../components/ui/Toggle';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function statusOf(member, joinedIds) {
  if (joinedIds.has(member.userId)) return 'joined';
  if (member.waiting) return 'waiting';
  return 'absent';
}

export default function ParticipantsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meetings, users, attendanceRecords, getWaitingUsers, admitWaitingUser, denyWaitingUser, setCoHost, updateParticipantPermissions, removeParticipant, setMeetings } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [permUser, setPermUser] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const hostedMeetings = useMemo(() => {
    const list = user?.role === 'host'
      ? meetings
      : meetings.filter(m => m.host === user?.id);
    const live = list.filter(m => m.status === 'live');
    const upcoming = list.filter(m => ['upcoming', 'pending_approval', 'scheduled'].includes(m.status));
    const past = list.filter(m => ['ended', 'completed', 'cancelled'].includes(m.status));
    return [...live, ...upcoming, ...past];
  }, [meetings, user]);

  const [selectedId, setSelectedId] = useState(null);
  const meeting = hostedMeetings.find(m => m.id === (selectedId || hostedMeetings[0]?.id)) || hostedMeetings[0] || null;

  const waiting = useMemo(() => (meeting ? getWaitingUsers(meeting.id) : []), [meeting, getWaitingUsers]);
  const waitingIds = useMemo(() => new Set(waiting.map(w => w.id)), [waiting]);

  const joined = useMemo(() => {
    if (!meeting) return [];
    const records = attendanceRecords.filter(r => r.meetingId === meeting.id && r.status === 'present');
    return records;
  }, [meeting, attendanceRecords]);
  const joinedIds = useMemo(() => new Set(joined.map(j => j.userId)), [joined]);

  const members = useMemo(() => {
    if (!meeting) return [];
    const meta = meeting.participantMeta || {};
    return meeting.participants.map(pid => {
      const u = users.find(x => x.id === pid);
      const record = joined.find(j => j.userId === pid);
      const entry = meta[pid] || {};
      return {
        userId: pid,
        name: u?.name || 'Unknown',
        avatar: u?.avatar || '',
        department: u?.department || 'General',
        role: pid === meeting.host ? 'host' : 'participant',
        coHost: !!entry.coHost,
        permissions: { mic: true, video: true, chat: true, screenShare: true, ...(entry.permissions || {}) },
        joinTime: record?.joinTime || null,
        waiting: waitingIds.has(pid),
      };
    });
  }, [meeting, users, joined, waitingIds]);

  const filteredMembers = useMemo(() => members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.department.toLowerCase().includes(search.toLowerCase());
    const st = statusOf(m, joinedIds);
    const matchStatus = statusFilter === 'all' || st === statusFilter;
    return matchSearch && matchStatus;
  }), [members, search, statusFilter, joinedIds]);

  const joinedCount = joined.length;
  const waitingCount = waiting.length;
  const absentCount = Math.max(0, (meeting?.participants?.length || 0) - joinedCount);
  const total = meeting?.participants?.length || 0;

  const handleAdmit = (userId) => {
    admitWaitingUser(meeting.id, userId);
    toast.success('Participant admitted to the meeting');
  };

  const handleDeny = (userId) => {
    denyWaitingUser(meeting.id, userId);
    toast.success('Participant denied entry');
  };

  // Room controls state for live meetings
  const [roomControls, setRoomControls] = useState({
    isLocked: false,
    allMuted: false,
    allCamerasOff: false,
  });

  const toggleLock = () => setRoomControls(p => ({ ...p, isLocked: !p.isLocked }));
  const toggleMuteAll = () => setRoomControls(p => ({ ...p, allMuted: !p.allMuted }));
  const toggleAllCameras = () => setRoomControls(p => ({ ...p, allCamerasOff: !p.allCamerasOff }));

  const handleMuteParticipant = (participantId) => {
    const member = members.find(m => m.userId === participantId);
    if (member) {
      updateParticipantPermissions(meeting.id, participantId, 'mic', !member.permissions.mic);
      toast.success(`${member.name} ${member.permissions.mic ? 'muted' : 'unmuted'}`);
    }
  };

  const handleCameraParticipant = (participantId) => {
    const member = members.find(m => m.userId === participantId);
    if (member) {
      updateParticipantPermissions(meeting.id, participantId, 'video', !member.permissions.video);
      toast.success(`${member.name} camera ${member.permissions.video ? 'disabled' : 'enabled'}`);
    }
  };

  const handleScreenShareParticipant = (participantId) => {
    const member = members.find(m => m.userId === participantId);
    if (member) {
      updateParticipantPermissions(meeting.id, participantId, 'screenShare', !member.permissions.screenShare);
      toast.success(`${member.name} screen share ${member.permissions.screenShare ? 'disabled' : 'enabled'}`);
    }
  };

  const handleEndMeeting = () => {
    if (meeting) {
      setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'ended' } : m));
      toast.success('Meeting ended');
    }
  };

  const badgeFor = (st) => (
    st === 'joined' ? <Badge variant="success" size="xs" dot>Joined</Badge>
      : st === 'waiting' ? <Badge variant="warning" size="xs" dot>Waiting</Badge>
        : <Badge variant="danger" size="xs">Absent</Badge>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Helmet><title>Participants - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Participants</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track who joined, who is waiting, and who is absent for each meeting you host</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={meeting?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            {hostedMeetings.length === 0 && <option value="">No meetings</option>}
            {hostedMeetings.map(m => (
              <option key={m.id} value={m.id}>{m.title} ({m.status.replace(/_/g, ' ')})</option>
            ))}
          </select>
          {meeting?.status === 'live' && (
            <Button variant="primary" size="md" icon={HiPlay} onClick={() => navigate(`/app/meeting/room/${meeting.id}`)}>Go to Room</Button>
          )}
        </div>
      </motion.div>

      {!meeting ? (
        <Card className="p-10">
          <EmptyState icon={HiVideoCamera} title="No meetings hosted" description="Schedule or start a meeting to manage participants" />
        </Card>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiUserGroup className="w-4 h-4 text-primary-500" />
                <p className="text-xs text-gray-500 dark:text-slate-400">Invited</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-gray-500 dark:text-slate-400">Joined</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{joinedCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiClock className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-gray-500 dark:text-slate-400">Waiting Room</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{waitingCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiXCircle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-gray-500 dark:text-slate-400">Absent</p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
            </Card>
          </motion.div>

          {waitingCount > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-amber-200 dark:border-amber-900/30">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <HiClock className="w-5 h-5 text-amber-500" />
                  Waiting Room ({waitingCount})
                </h2>
                <div className="space-y-2">
                  {waiting.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={w.avatar} name={w.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{w.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{w.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="xs" variant="primary" icon={HiBadgeCheck} onClick={() => handleAdmit(w.id)}>Admit</Button>
                        <Button size="xs" variant="danger" onClick={() => handleDeny(w.id)}>Deny</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {meeting?.status === 'live' && (
            <motion.div variants={itemVariants}>
              <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HiVideoCameraIcon className="w-5 h-5 text-emerald-500" />
                  Room Controls (Live)
                </h2>
                <div className="space-y-4">
                  {/* Meeting Lock */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <HiLockClosed className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Lock Meeting</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Prevent new participants from joining</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={roomControls.isLocked ? 'primary' : 'outline'}
                      onClick={toggleLock}
                    >
                      {roomControls.isLocked ? 'Unlock' : 'Lock Meeting'}
                    </Button>
                  </div>

                  {/* Mute All / Unmute All */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <HiMicrophone className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Mute All Participants</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Mute/unmute everyone at once</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={roomControls.allMuted ? 'primary' : 'outline'}
                      icon={roomControls.allMuted ? HiVolumeOff : HiVolumeUp}
                      onClick={toggleMuteAll}
                    >
                      {roomControls.allMuted ? 'Unmute All' : 'Mute All'}
                    </Button>
                  </div>

                  {/* Disable All Cameras / Enable All Cameras */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <HiVideoCameraIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Disable All Cameras</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Turn off all participant cameras</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={roomControls.allCamerasOff ? 'primary' : 'outline'}
                      onClick={toggleAllCameras}
                    >
                      {roomControls.allCamerasOff ? 'Enable All' : 'Disable All'}
                    </Button>
                  </div>

                  {/* End Meeting */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3">
                      <HiX className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">End Meeting for All</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Immediately end the meeting for everyone</p>
                      </div>
                    </div>
                    <Button size="sm" variant="danger" onClick={handleEndMeeting}>
                      End Meeting
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
            <Input icon={HiSearch} placeholder="Search participants..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <option value="all">All Status</option>
              <option value="joined">Joined</option>
              <option value="waiting">Waiting</option>
              <option value="absent">Absent</option>
            </select>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Participant</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Joined At</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredMembers.map(m => {
                    const st = statusOf(m, joinedIds);
                    return (
                      <tr key={m.userId} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar src={m.avatar} name={m.name} size="sm" />
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                              {m.role === 'host' && <Badge variant="primary" size="xs" className="ml-2">Host</Badge>}
                              {m.role !== 'host' && m.coHost && <Badge variant="info" size="xs" className="ml-2">Co-host</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{m.department}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                          {m.role === 'host' ? 'host' : m.coHost ? 'co-host' : 'participant'}
                        </td>
                        <td className="px-4 py-3">{badgeFor(st)}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{m.joinTime ? new Date(m.joinTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {m.role !== 'host' && (
                              <Button
                                size="xs"
                                variant={m.coHost ? 'primary' : 'ghost'}
                                onClick={() => { setCoHost(meeting.id, m.userId, !m.coHost); toast.success(m.coHost ? 'Co-host removed' : `${m.name} is now a co-host`); }}
                                title={m.coHost ? 'Remove co-host' : 'Assign co-host'}
                              >
                                {m.coHost ? 'Unassign' : 'Co-host'}
                              </Button>
                            )}
                            {meeting?.status === 'live' && m.role !== 'host' && (
                              <>
                                <Button
                                  size="xs"
                                  variant={m.permissions.mic ? 'ghost' : 'outline'}
                                  icon={m.permissions.mic ? HiMicrophone : HiVolumeOff}
                                  onClick={() => handleMuteParticipant(m.userId)}
                                  title={m.permissions.mic ? 'Mute' : 'Unmute'}
                                />
                                <Button
                                  size="xs"
                                  variant={m.permissions.video ? 'ghost' : 'outline'}
                                  icon={m.permissions.video ? HiVideoCameraIcon : HiVideoCameraIcon}
                                  onClick={() => handleCameraParticipant(m.userId)}
                                  title={m.permissions.video ? 'Disable Camera' : 'Enable Camera'}
                                />
                                <Button
                                  size="xs"
                                  variant={m.permissions.screenShare ? 'ghost' : 'outline'}
                                  icon={HiUsers}
                                  onClick={() => handleScreenShareParticipant(m.userId)}
                                  title={m.permissions.screenShare ? 'Disable Screen Share' : 'Enable Screen Share'}
                                />
                              </>
                            )}
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={HiShieldCheck}
                              onClick={() => setPermUser(m.userId)}
                              title="Manage permissions"
                            />
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={HiTrash}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => setRemoveTarget(m)}
                              title="Remove from meeting"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">No participants found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Permissions Modal */}
      <Modal
        isOpen={!!permUser}
        onClose={() => setPermUser(null)}
        title="Participant Permissions"
        size="sm"
      >
        {(() => {
          const member = members.find((mm) => mm.userId === permUser);
          if (!member || !meeting) return null;
          const perms = member.permissions;
          const rows = [
            { key: 'mic', label: 'Microphone' },
            { key: 'video', label: 'Camera / Video' },
            { key: 'chat', label: 'Chat' },
            { key: 'screenShare', label: 'Screen Sharing' },
          ];
          return (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Manage permissions for <strong className="text-gray-900 dark:text-white">{member.name}</strong> in
                <strong className="text-gray-900 dark:text-white"> {meeting.title}</strong>.
              </p>
              {rows.map((row) => (
                <Toggle
                  key={row.key}
                  enabled={perms[row.key]}
                  onChange={(v) => updateParticipantPermissions(meeting.id, member.userId, row.key, v)}
                  label={row.label}
                />
              ))}
            </div>
          );
        })()}
      </Modal>

      {/* Remove Participant Modal */}
      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Participant"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              icon={HiTrash}
              onClick={() => {
                if (meeting && removeTarget) {
                  removeParticipant(meeting.id, removeTarget.userId);
                  toast.success(`${removeTarget.name} removed from the meeting`);
                }
                setRemoveTarget(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Remove <strong className="text-gray-900 dark:text-white">{removeTarget?.name}</strong> from
          <strong className="text-gray-900 dark:text-white"> {meeting?.title}</strong>? They will be removed from the
          participant list and will need a new invitation to rejoin.
        </p>
      </Modal>
    </motion.div>
  );
}
