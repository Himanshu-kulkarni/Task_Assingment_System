import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useDepartments } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import DepartmentCard from '../../components/departments/DepartmentCard';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { canCreateDepartment } from '../../utils/roles';

const DepartmentsPage = () => {
  const { user } = useAuth();
  const { departments, fetchDepartments, loading, error } = useDepartments();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const filtered = departments.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Departments</h1>
            <p className="text-sm text-gray-500 mt-0.5">{departments.length} departments in your organization</p>
          </div>
          {canCreateDepartment(user?.role) && (
            <Link
              to="/departments/create"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              + New Department
            </Link>
          )}
        </div>

        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
          />
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100">
            <EmptyState
              icon="🏢"
              title="No departments found"
              description={search ? 'Try a different search.' : 'No departments have been created yet.'}
              action={
                canCreateDepartment(user?.role) ? (
                  <Link to="/departments/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                    Create first department
                  </Link>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((dept, i) => (
              <DepartmentCard key={dept.department_id} department={dept} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DepartmentsPage;
