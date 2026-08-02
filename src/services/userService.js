import users from '../data/users.json';

export async function getUsers() {
  return { data: users };
}

export async function getUserById(id) {
  const user = users.find((u) => u.id === id) || null;
  return { data: user };
}

export async function updateUser(id, data) {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  const updated = { ...user, ...data };
  return { data: updated };
}

export async function getOnlineUsers() {
  const online = users.filter((u) => u.status === 'online');
  return { data: online };
}

export async function getDepartments() {
  const departments = [...new Set(users.map((u) => u.department))];
  return { data: departments };
}
