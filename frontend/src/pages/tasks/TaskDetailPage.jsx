import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { useToast } from '../../components/common/Toast';
import { canDeleteTask } from '../../utils/roles';
import { formatDateTime, isOverdue, isDueSoon, getInitials, extractApiError } from '../../utils/helpers';

const STATUS_TRANSITIONS = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

const STATUS_LABELS = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTask, fetchTask, updateStatus, deleteTask, loading, error } = useTasks();
  const { addToast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchTask(taskId); }, [taskId, fetchTask]);

  const task = currentTask?.task_id === taskId ? currentTask : null;

  const isAssignee = task?.assigned_to_id === user?.user_id;
  const canDelete = task ? canDeleteTask(user?.role, task, user?.user_id) : false;
  const nextStatuses = task ? STATUS_TRANSITIONS[task.status] || [] : [];

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateStatus(taskId, newStatus);
      addToast(`Status updated to ${STATUS_LABELS[newStatus]}.`, 'success');
    } catch (err) {
      addToast(extractApiError(err), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(taskId);
      addToast('Task deleted.', 'success');
      navigate('/tasks/created-by-me', { replace: true });
    } catch (err) {
      addToast(extractApiError(err), 'error');
      setDeleting(false);
    }
  };

  if (loading && !task) return <AppLayout><Spinner className="py-32" /></AppLayout>;
  if (error && !task) return <AppLayout><Alert type="error" message={error} /></AppLayout>;
  if (!task) return <AppLayout><Alert type="error" message="Task not found." /></AppLayout>;

  const overdue = isOverdue(task.deadline) && task.status !== 'COMPLETED';
  const dueSoon = isDueSoon(task.deadline) && task.status !== 'COMPLETED';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link to="/tasks/my-tasks" className="hover:text-gray-700">Tasks</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{task.title}</span>
        </nav>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{task.title}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <TaskStatusBadge status={task.status} />
                {task.department?.name && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                    {task.department.name}
                  </span>
                )}
                {overdue && (
                  <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">⚠ Overdue</span>
                )}
                {dueSoon && !overdue && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">⏰ Due soon</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {(isAssignee) && nextStatuses.length > 0 && (
                nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {updating ? 'Updating…' : `Mark as ${STATUS_LABELS[s]}`}
                  </button>
                ))
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDelete(true)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors border border-red-100"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Assignee */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Assigned to</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {getInitials(task.assigned_to?.name || 'U')}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{task.assigned_to?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{task.assigned_to?.email}</p>
              </div>
            </div>
          </div>

          {/* Creator */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Created by</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                {getInitials(task.created_by?.name || 'U')}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{task.created_by?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{task.created_by?.email}</p>
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Deadline</h3>
            <p className={`text-sm font-semibold ${overdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : 'text-gray-800'}`}>
              {formatDateTime(task.deadline)}
            </p>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Timeline</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700 font-medium">{formatDateTime(task.created_at)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Last updated</span>
                <span className="text-gray-700 font-medium">{formatDateTime(task.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        confirmColor="red"
        loading={deleting}
      />
    </AppLayout>
  );
};

export default TaskDetailPage;
