import api from './api';
export const fetchNotifications = () => api.get('/notifications');
export const markRead = id => api.put(`/notifications/${id}/read`);
export const announce = ({ title, message, link }) => api.post('/notifications/announce', null, { params: { title, message, link } });