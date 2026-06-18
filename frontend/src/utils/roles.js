export const ROLES = {
  PRESIDENT: 'PRESIDENT',
  VICE_PRESIDENT: 'VICE_PRESIDENT',
  DEPARTMENT_LEAD: 'DEPARTMENT_LEAD',
  MEMBER: 'MEMBER',
};

export const ROLE_LABELS = {
  PRESIDENT: 'President',
  VICE_PRESIDENT: 'Vice President',
  DEPARTMENT_LEAD: 'Department Lead',
  MEMBER: 'Member',
};

export const ROLE_HIERARCHY = {
  PRESIDENT: 1,
  VICE_PRESIDENT: 2,
  DEPARTMENT_LEAD: 3,
  MEMBER: 4,
};

export const ROLE_COLORS = {
  PRESIDENT: 'bg-purple-100 text-purple-800',
  VICE_PRESIDENT: 'bg-blue-100 text-blue-800',
  DEPARTMENT_LEAD: 'bg-emerald-100 text-emerald-800',
  MEMBER: 'bg-gray-100 text-gray-700',
};

export const canCreateTask = (role) =>
  [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.DEPARTMENT_LEAD].includes(role);

export const canCreateDepartment = (role) =>
  [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(role);

export const canManageUsers = (role) =>
  [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(role);

export const canDeleteTask = (role, task, currentUserId) => {
  if (role === ROLES.PRESIDENT) return true;
  if (role === ROLES.VICE_PRESIDENT && task.created_by_id === currentUserId) return true;
  if (role === ROLES.DEPARTMENT_LEAD && task.created_by_id === currentUserId) return true;
  return false;
};

export const canAccessAdmin = (role) =>
  [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(role);

export const isHigherOrEqual = (userRole, targetRole) =>
  ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[targetRole];
