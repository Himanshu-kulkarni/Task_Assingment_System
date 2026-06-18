const STATUSES = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS = { ALL: 'All', PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const TaskFilter = ({ activeStatus, onStatusChange, search, onSearchChange }) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1 max-w-xs">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tasks…"
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
      />
    </div>

    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onStatusChange(s)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeStatus === s
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  </div>
);

export default TaskFilter;
