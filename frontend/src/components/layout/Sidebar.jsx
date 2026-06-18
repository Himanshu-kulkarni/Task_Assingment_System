import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canCreateTask, canCreateDepartment, canAccessAdmin, ROLE_LABELS, ROLE_COLORS } from '../../utils/roles';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/tasks/my-tasks', label: 'My Tasks', icon: '✓' },
  { to: '/tasks/created-by-me', label: 'Created by Me', icon: '✏' },
  { to: '/departments', label: 'Departments', icon: '🏢' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;

  const extraItems = [];
  if (canCreateTask(role)) extraItems.push({ to: '/tasks/create', label: 'Create Task', icon: '+', primary: true });
  if (canAccessAdmin(role)) extraItems.push({ to: '/admin/users', label: 'Admin Panel', icon: '⚙' });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="font-bold text-white text-base tracking-tight">TaskFlow</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 mx-3 mt-3 rounded-xl bg-slate-800">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {extraItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 ${
                  item.primary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="pt-1 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Navigation</p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-colors"
          >
            <span className="w-5 text-center text-base">↩</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
