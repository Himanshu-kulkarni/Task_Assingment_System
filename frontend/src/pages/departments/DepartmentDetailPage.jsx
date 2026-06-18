import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useDepartments } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import MembersList from '../../components/departments/MembersList';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';
import { canManageUsers } from '../../utils/roles';
import { extractApiError } from '../../utils/helpers';

const DepartmentDetailPage = () => {
  const { departmentId } = useParams();
  const { user } = useAuth();
  const { departments, members, fetchDepartments, fetchMembers, assignUser, loading } = useDepartments();
  const { addToast } = useToast();
  const [showAssign, setShowAssign] = useState(false);
  const [userId, setUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchMembers(departmentId);
  }, [departmentId, fetchDepartments, fetchMembers]);

  const department = departments.find((d) => d.department_id === departmentId);

  const handleAssign = async () => {
    if (!userId.trim()) { setAssignError('Please enter a user ID.'); return; }
    setAssigning(true);
    setAssignError('');
    try {
      await assignUser(departmentId, userId.trim());
      addToast('User assigned to department.', 'success');
      fetchMembers(departmentId);
      setShowAssign(false);
      setUserId('');
    } catch (err) {
      setAssignError(extractApiError(err));
    } finally {
      setAssigning(false);
    }
  };

  const COLORS = ['from-indigo-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600'];
  const deptIndex = departments.findIndex((d) => d.department_id === departmentId);
  const gradient = COLORS[deptIndex % COLORS.length] || COLORS[0];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link to="/departments" className="hover:text-gray-700">Departments</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{department?.name || 'Loading…'}</span>
        </nav>

        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
                {department?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <h1 className="text-2xl font-bold">{department?.name || 'Department'}</h1>
              {department?.description && (
                <p className="text-white/80 text-sm mt-1">{department.description}</p>
              )}
            </div>
            {canManageUsers(user?.role) && (
              <button
                onClick={() => setShowAssign(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors border border-white/20"
              >
                + Assign Member
              </button>
            )}
          </div>
          <div className="mt-4 flex gap-4 text-sm text-white/80">
            <span>{members.length} members</span>
            <span>·</span>
            <span>ID: {departmentId?.slice(-8)}</span>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Members</h2>
          {loading ? <Spinner className="py-8" /> : <MembersList members={members} />}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="flex gap-3 flex-wrap">
            <Link
              to={`/tasks/create`}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
            >
              Create task for this department
            </Link>
          </div>
        </div>
      </div>

      {/* Assign member modal */}
      <Modal isOpen={showAssign} onClose={() => { setShowAssign(false); setAssignError(''); setUserId(''); }} title="Assign member to department">
        <div className="space-y-4">
          {assignError && <Alert type="error" message={assignError} onDismiss={() => setAssignError('')} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Paste the user's UUID…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Users can find their ID on their profile page.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {assigning ? 'Assigning…' : 'Assign member'}
            </button>
            <button
              onClick={() => setShowAssign(false)}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default DepartmentDetailPage;
