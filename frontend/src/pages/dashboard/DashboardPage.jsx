import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useDepartments } from '../../context/DepartmentContext';
import TaskCard from '../../components/tasks/TaskCard';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import Spinner from '../../components/common/Spinner';
import { ROLE_LABELS, ROLES, canCreateTask, canCreateDepartment } from '../../utils/roles';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';

const StatCard = ({ label, value, sub, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { myTasks, createdTasks, fetchMyTasks, fetchCreatedTasks, loading } = useTasks();
  const { departments, fetchDepartments } = useDepartments();
  const [deptLoading, setDeptLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
    fetchCreatedTasks();
    fetchDepartments().finally(() => setDeptLoading(false));
  }, [fetchMyTasks, fetchCreatedTasks, fetchDepartments]);

  const pending = myTasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = myTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = myTasks.filter((t) => t.status === 'COMPLETED').length;
  const overdue = myTasks.filter((t) => isOverdue(t.deadline) && t.status !== 'COMPLETED').length;
  const dueSoon = myTasks.filter((t) => isDueSoon(t.deadline) && t.status !== 'COMPLETED').length;

  const recentTasks = [...myTasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {ROLE_LABELS[user?.role]} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            {canCreateTask(user?.role) && (
              <Link
                to="/tasks/create"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                + New Task
              </Link>
            )}
            {canCreateDepartment(user?.role) && (
              <Link
                to="/departments/create"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold transition-colors"
              >
                + Department
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <Spinner className="py-12" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Assigned to me" value={myTasks.length} color="indigo" />
            <StatCard label="Pending" value={pending} color="amber" />
            <StatCard label="In progress" value={inProgress} color="blue" />
            <StatCard label="Completed" value={completed} color="emerald" />
            <StatCard label="Overdue" value={overdue} color="red" sub={dueSoon > 0 ? `${dueSoon} due soon` : undefined} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent assigned tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Tasks</h2>
              <Link to="/tasks/my-tasks" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all →
              </Link>
            </div>
            {loading ? (
              <Spinner className="py-8" />
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentTasks.map((task) => (
                  <div key={task.task_id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/tasks/${task.task_id}`}
                        className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.department?.name} · Due {formatDate(task.deadline)}
                      </p>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Departments overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Departments</h2>
              <Link to="/departments" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all →
              </Link>
            </div>
            {deptLoading ? (
              <Spinner className="py-8" />
            ) : departments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No departments yet</p>
            ) : (
              <div className="space-y-2">
                {departments.slice(0, 6).map((dept, i) => {
                  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
                  return (
                    <Link
                      key={dept.department_id}
                      to={`/departments/${dept.department_id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {dept.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate">{dept.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Created by me (for managers) */}
        {canCreateTask(user?.role) && createdTasks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Tasks You Created</h2>
              <Link to="/tasks/created-by-me" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {createdTasks.slice(0, 4).map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
