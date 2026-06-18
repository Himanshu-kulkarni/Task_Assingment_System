import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useTasks } from '../../context/TaskContext';
import { useDepartments } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { ROLES } from '../../utils/roles';
import { extractApiError } from '../../utils/helpers';

const TaskCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTask } = useTasks();
  const { departments, fetchDepartments, fetchMembers } = useDepartments();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    department_id: '',
    deadline: '',
  });
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  // Pre-select department for dept lead
  useEffect(() => {
    if (user?.role === ROLES.DEPARTMENT_LEAD && user?.department_id) {
      setForm((prev) => ({ ...prev, department_id: user.department_id }));
    }
  }, [user]);

  useEffect(() => {
    if (form.department_id) {
      setLoadingMembers(true);
      fetchMembers(form.department_id)
        .then((data) => setMembers(data || []))
        .finally(() => setLoadingMembers(false));
    } else {
      setMembers([]);
    }
    setForm((prev) => ({ ...prev, assigned_to_id: '' }));
  }, [form.department_id, fetchMembers]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.assigned_to_id) { setError('Please select an assignee.'); return; }
    if (!form.department_id) { setError('Please select a department.'); return; }
    if (!form.deadline) { setError('Please set a deadline.'); return; }
    if (new Date(form.deadline) <= new Date()) { setError('Deadline must be in the future.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const task = await createTask(form);
      addToast('Task created successfully!', 'success');
      navigate(`/tasks/${task.task_id}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isDeptLead = user?.role === ROLES.DEPARTMENT_LEAD;
  const availableDepts = isDeptLead && user?.department_id
    ? departments.filter((d) => d.department_id === user.department_id)
    : departments;

  // Tomorrow as min date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <nav className="text-sm text-gray-500 flex items-center gap-2 mb-3">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Create Task</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900">Create a new task</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to assign a task.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="e.g. Prepare Q3 financial report"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={5000}
              placeholder="Provide context, requirements, or instructions…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department <span className="text-red-500">*</span></label>
            <select
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              disabled={isDeptLead && !!user?.department_id}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select a department…</option>
              {availableDepts.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to <span className="text-red-500">*</span></label>
            {loadingMembers ? (
              <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                <Spinner size="sm" /> Loading members…
              </div>
            ) : (
              <select
                name="assigned_to_id"
                value={form.assigned_to_id}
                onChange={handleChange}
                disabled={!form.department_id}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">{!form.department_id ? 'Select a department first…' : 'Select an assignee…'}</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.name} ({m.email})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              min={minDateStr}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Spinner size="sm" /> Creating…</> : 'Create task'}
            </button>
            <Link
              to="/tasks/my-tasks"
              className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default TaskCreatePage;
