import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiOfficeBuilding, HiBadgeCheck, HiCamera, HiSave, HiShieldCheck } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@connectly.io',
    title: user?.title || 'Team Member',
    department: user?.department || 'General',
    bio: 'Passionate collaborator dedicated to building great products.',
    phone: '+1 (555) 000-0000',
    location: 'San Francisco, CA',
    avatar: user?.avatar,
  });
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    setUser({ ...user, ...profile, avatar: avatarUrl || user?.avatar });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarUrl(ev.target.result);
      reader.readAsDataURL(file);
      toast.success(`Avatar updated: ${file.name}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-6 max-w-3xl mx-auto">
      <Helmet><title>Profile - AdzConnect</title></Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!editing ? <Button variant="primary" onClick={() => setEditing(true)}>Edit Profile</Button> : (
          <div className="flex gap-2"><Button variant="primary" icon={HiSave} onClick={handleSave}>Save</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
        )}
      </div>

      <Card className="p-8 text-center">
        <div className="relative inline-block mb-4">
          <Avatar src={avatarUrl || profile.avatar} name={profile.name} size="xxl" status="online" />
          {editing && <button onClick={handleAvatarUpload} className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-700 transition-colors"><HiCamera /></button>}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{profile.title}</p>
        <Badge variant="primary" size="sm" className="mt-2 capitalize">{user?.role || 'employee'}</Badge>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><HiUser className="w-5 h-5" />Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={editing ? profile.name : profile.name} disabled={!editing} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} icon={HiUser} />
          <Input label="Email" value={profile.email} disabled icon={HiMail} />
          <Input label="Title" value={editing ? profile.title : profile.title} disabled={!editing} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))} icon={HiBadgeCheck} />
          <Input label="Department" value={editing ? profile.department : profile.department} disabled={!editing} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} icon={HiOfficeBuilding} />
          <Input label="Phone" value={editing ? profile.phone : profile.phone} disabled={!editing} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} icon={HiPhone} />
          <Input label="Location" value={profile.location} disabled={!editing} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} icon={HiOfficeBuilding} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><HiShieldCheck className="w-5 h-5" />Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
            <span className="text-sm text-gray-600 dark:text-slate-400">Two-Factor Authentication</span>
            <Badge variant="success" size="sm">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
            <span className="text-sm text-gray-600 dark:text-slate-400">Last Password Change</span>
            <span className="text-sm text-gray-900 dark:text-white">30 days ago</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
            <span className="text-sm text-gray-600 dark:text-slate-400">Active Sessions</span>
            <span className="text-sm text-gray-900 dark:text-white">1 (Current)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
            <span className="text-sm text-gray-600 dark:text-slate-400">Camera, microphone & speaker</span>
            <Button size="xs" variant="outline" onClick={() => navigate('/app/device-test')}>Run Device Check</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}