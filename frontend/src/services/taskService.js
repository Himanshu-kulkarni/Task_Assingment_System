import api from './api';

export const taskService = {
  createTask: (data) => api.post('/tasks', data),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getCreatedByMe: () => api.get('/tasks/created-by-me'),
  updateTaskStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};
