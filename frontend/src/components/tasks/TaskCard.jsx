import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import { formatDate, isOverdue, isDueSoon, getInitials } from '../../utils/helpers';

const TaskCard = ({ task, onDelete, canDelete }) => {
  const overdue = isOverdue(task.deadline) && task.status !== 'COMPLETED';
  const dueSoon = isDueSoon(task.deadline) && task.status !== 'COMPLETED';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Link
          to={`/tasks/${task.task_id}`}
          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug"
        >
          {task.title}
        </Link>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        {task.department?.name && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            {task.department.name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {getInitials(task.assigned_to?.name || 'U')}
          </div>
          <span className="truncate max-w-[100px]">{task.assigned_to?.name || 'Unassigned'}</span>
        </div>

        <span className={`font-medium ${overdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : 'text-gray-500'}`}>
          {overdue ? '⚠ Overdue' : `Due ${formatDate(task.deadline)}`}
        </span>
      </div>

      {canDelete && onDelete && (
        <div className="mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(task)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
