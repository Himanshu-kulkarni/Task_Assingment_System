import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useDepartments } from '../../context/DepartmentContext';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/roles';
import { getInitials } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

// Admin page shows all members from all departments
const AdminUsersPage = () => {
  const { departments, members, fetchDepartments, fetchMembers, loading, error } = useDepartments();
  const [allMembers, setAllMembers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const depts = await fetchDepartments();
      if (!depts) { setFetching(false); return; }
      const memberSets = await Promise.all(
        depts.map((d) => fetchMembers(d.department_id).catch(() => []))
      );
      // Deduplicate users by user_id, add department name
      const seen = new Set();
      const all = [];
      memberSets.forEach((ms, i) => {
        if (!ms) return;
        ms.forEach((m) => {
          if (!seen.has(m.user_id)) {
            seen.add(m.user_id);
            all.push({ ...m, department_name: depts[i]?.name });
          }
        });
      });
      setAllMembers(all);
      setFetching(false);
    };
    load();
  }, [fetchDepartments, fetchMembers]);

  const filtered = allMembers.filter((m) =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">All registered members across departments</p>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
            {allMembers.length} users
          </span>
        </div>

        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
          />
        </div>

        {error && <Alert type="error" message={error} />}

        {fetching ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-gray-500 text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {getInitials(member.name)}
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{member.department_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUsersPage;
