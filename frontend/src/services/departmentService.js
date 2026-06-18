import api from './api';

export const departmentService = {
  createDepartment: (data) => api.post('/departments', data),
  getDepartments: () => api.get('/departments'),
  getDepartmentMembers: (departmentId) => api.get(`/departments/${departmentId}/members`),
  assignUser: (departmentId, userId) => api.post(`/departments/${departmentId}/assign-user/${userId}`),
};
