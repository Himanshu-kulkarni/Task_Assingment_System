const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const STATUS_DOTS = {
  PENDING: 'bg-amber-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
};

const TaskStatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status] || 'bg-gray-400'}`} />
    {STATUS_LABELS[status] || status}
  </span>
);

export default TaskStatusBadge;
