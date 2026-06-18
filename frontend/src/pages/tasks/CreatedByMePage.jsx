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
import { useToast } from '../../components/common/Toast';
import { canDeleteTask } from '../../utils/roles';
import { extractApiError } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const CreatedByMePage = () => {
  const { user } = useAuth();
  const { createdTasks, fetchCreatedTasks, deleteTask, loading } = useTasks();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCreatedTasks(); }, [fetchCreatedTasks]);

  const filtered = createdTasks.filter((t) => {
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
            <h1 className="text-xl font-bold text-gray-900">Created by Me</h1>
            <p className="text-sm text-gray-500 mt-0.5">{createdTasks.length} tasks you created</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['table', 'grid'].map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
                  {m === 'table' ? '☰ List' : '⊞ Grid'}
                </button>
              ))}
            </div>
            <Link to="/tasks/create" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
              + New Task
            </Link>
          </div>
        </div>

        <TaskFilter activeStatus={statusFilter} onStatusChange={setStatusFilter} search={search} onSearchChange={setSearch} />

        {loading ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100">
            <EmptyState
              icon="✏️"
              title="No tasks yet"
              description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : "You haven't created any tasks yet."}
              action={
                <Link to="/tasks/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                  Create your first task
                </Link>
              }
            />
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
          message={`Delete "${taskToDelete?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmColor="red"
          loading={deleting}
        />
      </div>
    </AppLayout>
  );
};

export default CreatedByMePage;
