import notifications from '../data/notifications.json';

export async function getNotifications() {
  return { data: notifications };
}

export async function markAsRead(id) {
  return { data: { id, read: true } };
}

export async function markAllAsRead() {
  return { data: { success: true } };
}

export async function deleteNotification(id) {
  return { data: { id, deleted: true } };
}
