import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import { formatDate, isOverdue, getInitials } from '../../utils/helpers';

const TaskTable = ({ tasks, onDelete, canDelete }) => {
  if (!tasks.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Task</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Department</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Assignee</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Deadline</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadline) && task.status !== 'COMPLETED';
            return (
              <tr key={task.task_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    to={`/tasks/${task.task_id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {task.title}
                  </Link>
                  {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-gray-600">{task.department?.name || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {getInitials(task.assigned_to?.name || 'U')}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{task.assigned_to?.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                    {overdue ? '⚠ ' : ''}{formatDate(task.deadline)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      to={`/tasks/${task.task_id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View
                    </Link>
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(task)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
