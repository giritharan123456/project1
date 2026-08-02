import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { HiSupport, HiPlus, HiX, HiUsers, HiClock, HiVolumeUp, HiVolumeOff, HiTrash, HiPencil } from 'react-icons/hi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const mockParticipants = [
  { id: 'u1', name: 'You', avatar: '' },
  { id: 'u2', name: 'Sarah Chen', avatar: '' },
  { id: 'u4', name: 'Marcus Johnson', avatar: '' },
  { id: 'u6', name: 'Emily Nakamura', avatar: '' },
  { id: 'u7', name: 'David Park', avatar: '' },
  { id: 'u8', name: 'Rachel Torres', avatar: '' },
];

export default function BreakoutRooms({ onClose, roster: propsRoster, currentUserId }) {
  const effectiveRoster = propsRoster || mockParticipants;
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Room 1', participants: effectiveRoster.slice(0, Math.ceil(effectiveRoster.length / 2)), duration: 15, active: false, audioRouting: 'main' },
    { id: 2, name: 'Room 2', participants: effectiveRoster.slice(Math.ceil(effectiveRoster.length / 2)), duration: 15, active: false, audioRouting: 'main' },
  ]);
  const [showAssign, setShowAssign] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState('auto');
  const [newRoomNames, setNewRoomNames] = useState('');
  const [newRoomCount, setNewRoomCount] = useState(3);
  const [newRoomDuration, setNewRoomDuration] = useState(15);
  const [allActive, setAllActive] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editName, setEditName] = useState('');

  const toggleRoom = (roomId) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, active: !r.active, audioRouting: r.active ? 'main' : 'room' } : r));
    toast.success(rooms.find(r => r.id === roomId)?.active ? 'Room closed, audio back to main' : 'Room opened, audio routed to breakout');
  };

  const startAll = () => {
    setRooms(prev => prev.map(r => ({ ...r, active: true, audioRouting: 'room' })));
    setAllActive(true);
    toast.success('All breakout rooms open with audio routing');
  };

  const closeAll = () => {
    setRooms(prev => prev.map(r => ({ ...r, active: false, audioRouting: 'main' })));
    setAllActive(false);
    setJoinedRoom(null);
    toast.success('All rooms closed, audio back to main');
  };

  const deleteRoom = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && room.participants.length > 0) {
      toast.error('Remove participants before deleting room');
      return;
    }
    setRooms(prev => prev.filter(r => r.id !== roomId));
    toast.success('Room deleted');
  };

  const startEditRoom = (room) => {
    setEditingRoom(room.id);
    setEditName(room.name);
  };

  const saveEditRoom = (roomId) => {
    if (!editName.trim()) return;
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name: editName.trim() } : r));
    setEditingRoom(null);
    setEditName('');
    toast.success('Room renamed');
  };

  const createRooms = () => {
    if (createMode === 'custom') {
      const names = newRoomNames.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length === 0) {
        toast.error('Enter at least one room name');
        return;
      }
      const newRooms = names.map((name) => ({
        id: Date.now() + Math.random(),
        name,
        participants: [],
        duration: newRoomDuration,
        active: false,
        audioRouting: 'main',
      }));
      setRooms(prev => [...prev, ...newRooms]);
      toast.success(`${newRooms.length} rooms created`);
    } else {
      const newRooms = Array.from({ length: newRoomCount }, (_, i) => ({
        id: Date.now() + i,
        name: `Room ${rooms.length + i + 1}`,
        participants: [],
        duration: newRoomDuration,
        active: false,
        audioRouting: 'main',
      }));
      setRooms(prev => [...prev, ...newRooms]);
      toast.success(`${newRoomCount} rooms created`);
    }
    setShowCreate(false);
  };

  const joinRoom = (roomId) => {
    setJoinedRoom(joinedRoom === roomId ? null : roomId);
    toast.success(joinedRoom === roomId ? 'Left breakout room' : 'Joined breakout room');
  };

  const assignToRoom = (participant, roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) return { ...r, participants: [...r.participants, participant] };
      return r;
    }));
    setShowAssign(null);
    toast.success(`${participant.name} assigned`);
  };

  const unassignFromRoom = (participantId, roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) return { ...r, participants: r.participants.filter(p => p.id !== participantId) };
      return r;
    }));
    toast.success('Participant unassigned');
  };

  const getUnassigned = () => effectiveRoster.filter(p => !rooms.some(r => r.participants.some(rp => rp.id === p.id)));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <HiSupport className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium text-white">Breakout Rooms</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="secondary" icon={HiPlus} onClick={() => setShowCreate(true)}>Create Rooms</Button>
          <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!allActive && rooms.length > 0 && (
          <Button variant="primary" size="sm" fullWidth onClick={startAll}>Open All Rooms</Button>
        )}
        {allActive && (
          <Button variant="danger" size="sm" fullWidth onClick={closeAll}>Close All Rooms</Button>
        )}

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setCreateMode('auto')}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${createMode === 'auto' ? 'bg-primary-600/20 text-primary-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setCreateMode('custom')}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${createMode === 'custom' ? 'bg-primary-600/20 text-primary-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                >
                  Custom Names
                </button>
              </div>
              {createMode === 'auto' ? (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Number of rooms</label>
                  <input type="number" min={1} max={20} value={newRoomCount} onChange={(e) => setNewRoomCount(Number(e.target.value))} className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-primary-500" />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room names (comma-separated)</label>
                  <textarea
                    value={newRoomNames}
                    onChange={(e) => setNewRoomNames(e.target.value)}
                    placeholder="Design Review, Brainstorming, Q&A"
                    rows={3}
                    className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                <input type="number" min={1} max={60} value={newRoomDuration} onChange={(e) => setNewRoomDuration(Number(e.target.value))} className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-primary-500" />
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="primary" onClick={createRooms}>Create</Button>
                <Button size="xs" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {rooms.map((room) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border transition-all ${room.active ? 'border-primary-500/50 bg-primary-500/5' : 'border-gray-700 bg-gray-800'}`}>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editingRoom === room.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditRoom(room.id); if (e.key === 'Escape') setEditingRoom(null); }}
                        className="bg-gray-700 text-white text-sm rounded px-2 py-1 w-32 border border-gray-600 focus:outline-none focus:border-primary-500"
                        autoFocus
                      />
                      <button onClick={() => saveEditRoom(room.id)} className="p-1 text-emerald-400 hover:text-emerald-300 text-xs">Save</button>
                      <button onClick={() => setEditingRoom(null)} className="p-1 text-gray-400 hover:text-white text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{room.name}</span>
                      {!room.active && (
                        <button onClick={() => startEditRoom(room)} className="p-0.5 text-gray-500 hover:text-white transition-colors" title="Rename room">
                          <HiPencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  {room.active && <Badge variant="success" size="xs" dot>Active</Badge>}
                  {joinedRoom === room.id && <Badge variant="warning" size="xs">Joined</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {room.active && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {room.audioRouting === 'room' ? <HiVolumeUp className="w-3 h-3 text-emerald-400" /> : <HiVolumeOff className="w-3 h-3 text-gray-500" />}
                      {room.audioRouting === 'room' ? 'Routed' : 'Main'}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1"><HiClock className="w-3 h-3" />{room.duration}m</span>
                  <button
                    onClick={() => toggleRoom(room.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${room.active ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/30'}`}
                  >
                    {room.active ? 'Close' : 'Open'}
                  </button>
                  {!room.active && (
                    <button onClick={() => deleteRoom(room.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors" title="Delete room">
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {room.active && (
                <button
                  onClick={() => joinRoom(room.id)}
                  className={`w-full text-xs py-1.5 rounded-lg transition-colors ${joinedRoom === room.id ? 'bg-red-600/20 text-red-400' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'}`}
                >
                  {joinedRoom === room.id ? 'Leave Room' : 'Join Room'}
                </button>
              )}
              <div className="space-y-1.5">
                {room.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-800/60">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="xs" />
                      <span className="text-xs text-gray-300">{p.name}</span>
                      {joinedRoom === room.id && p.id === currentUserId && <Badge variant="warning" size="xs">You</Badge>}
                    </div>
                    {!room.active && (
                      <button onClick={() => unassignFromRoom(p.id, room.id)} className="p-0.5 text-gray-500 hover:text-red-400 transition-colors" title="Unassign">
                        <HiX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {room.participants.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-1">No participants assigned</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">{room.participants.length} / {effectiveRoster.length} participants</span>
                <button onClick={() => setShowAssign(showAssign === room.id ? null : room.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                  <HiUsers className="w-3.5 h-3.5" />
                  Assign
                </button>
              </div>
              <AnimatePresence>
                {showAssign === room.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1 pt-1 border-t border-gray-700/50">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Unassigned participants</p>
                    {getUnassigned().map((p) => (
                      <button key={p.id} onClick={() => assignToRoom(p, room.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-xs text-gray-300">
                        <Avatar name={p.name} size="xs" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                    {getUnassigned().length === 0 && <p className="text-xs text-gray-500">All participants assigned</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

BreakoutRooms.propTypes = {
  onClose: PropTypes.func.isRequired,
  roster: PropTypes.array,
  currentUserId: PropTypes.string,
};