export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const isOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export const isDueSoon = (deadline, days = 3) => {
  if (!deadline) return false;
  const due = new Date(deadline);
  const now = new Date();
  const diffMs = due - now;
  return diffMs > 0 && diffMs < days * 24 * 60 * 60 * 1000;
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const extractApiError = (error) => {
  if (!error.response) return 'Network error. Please check your connection.';
  const { data, status } = error.response;
  if (status === 422 && Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).join(', ');
  }
  if (data?.detail) return data.detail;
  return `Error ${status}: Something went wrong.`;
};
