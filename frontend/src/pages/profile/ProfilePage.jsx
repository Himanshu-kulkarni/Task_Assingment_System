import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../../utils/roles';
import { getInitials } from '../../utils/helpers';

const PERMISSIONS_MAP = {
  PRESIDENT: [
    'View and manage all tasks across all departments',
    'Create, edit, and delete any task',
    'Create and manage departments',
    'Assign users to departments',
    'View all user profiles',
    'Access admin panel',
  ],
  VICE_PRESIDENT: [
    'View all tasks across departments',
    'Create tasks for any department',
    'Delete own created tasks',
    'Create and manage departments',
    'Assign users to departments',
    'Access admin panel',
  ],
  DEPARTMENT_LEAD: [
    'Create tasks within your department',
    'Delete own created tasks',
    'Manage department members',
    'View department tasks',
    'Update task statuses',
  ],
  MEMBER: [
    'View assigned tasks',
    'Update own task status',
    'View department information',
    'View task details',
  ],
};

const ProfilePage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const permissions = PERMISSIONS_MAP[user.role] || [];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Account details</h3>
          <div className="space-y-3">
            {[
              { label: 'Full name', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Role', value: ROLE_LABELS[user.role] },
              { label: 'User ID', value: user.user_id, mono: true },
              { label: 'Department ID', value: user.department_id || 'Not assigned', mono: !!user.department_id },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-sm font-medium text-gray-800 ${mono ? 'font-mono text-xs bg-gray-50 px-2 py-0.5 rounded' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Your permissions</h3>
          <ul className="space-y-2">
            {permissions.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
