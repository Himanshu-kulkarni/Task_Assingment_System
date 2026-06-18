import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import TaskTable from '../../components/tasks/TaskTable';
import TaskCard from '../../components/tasks/TaskCard';
import TaskFilter from '../../components/tasks/TaskFilter';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { useToast } from '../../components/common/Toast';
import { canDeleteTask } from '../../utils/roles';
import { extractApiError } from '../../utils/helpers';

const MyTasksPage = () => {
  const { user } = useAuth();
  const { myTasks, fetchMyTasks, deleteTask, loading, error } = useTasks();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchMyTasks(); }, [fetchMyTasks]);

  const filtered = myTasks.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(taskToDelete.task_id);
      addToast('Task deleted.', 'success');
      setTaskToDelete(null);
    } catch (err) {
      addToast(extractApiError(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">{myTasks.length} tasks assigned to you</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['table', 'grid'].map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
                {m === 'table' ? '☰ List' : '⊞ Grid'}
              </button>
            ))}
          </div>
        </div>

        <TaskFilter activeStatus={statusFilter} onStatusChange={setStatusFilter} search={search} onSearchChange={setSearch} />

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100">
            <EmptyState icon="📋" title="No tasks found" description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'No tasks assigned to you yet.'} />
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl">
            <TaskTable
              tasks={filtered}
              onDelete={(t) => setTaskToDelete(t)}
              canDelete={(t) => canDeleteTask(user?.role, t, user?.user_id)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                onDelete={(t) => setTaskToDelete(t)}
                canDelete={canDeleteTask(user?.role, task, user?.user_id)}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDelete}
          title="Delete task"
          message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmColor="red"
          loading={deleting}
        />
      </div>
    </AppLayout>
  );
};

export default MyTasksPage;
