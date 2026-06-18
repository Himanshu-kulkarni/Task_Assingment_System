import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useDepartments } from '../../context/DepartmentContext';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { extractApiError } from '../../utils/helpers';

const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const { createDepartment } = useDepartments();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Department name is required.'); return; }
    setSubmitting(true);
    try {
      const dept = await createDepartment(form);
      addToast('Department created!', 'success');
      navigate(`/departments/${dept.department_id}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <nav className="text-sm text-gray-500 flex items-center gap-2 mb-3">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <Link to="/departments" className="hover:text-gray-700">Departments</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Create</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900">Create a department</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up a new organizational unit.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Engineering, Marketing, Finance"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the department's purpose…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Spinner size="sm" /> Creating…</> : 'Create department'}
            </button>
            <Link
              to="/departments"
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

export default CreateDepartmentPage;
