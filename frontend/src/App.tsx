import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  User as UserIcon,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Key,
  UserPlus,
  Calendar
} from 'lucide-react';



const API_BASE = 'http://localhost:8000';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  college_id: number | null;
  club_id: number | null;
  department_id: number | null;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  deadline: string;
  assigned_to: number;
  assigned_by: number;
  department_id: number | null;
}

interface Club {
  id: number;
  name: string;
  description: string;
  college_id: number;
  faculty_coordinator_id: number | null;
}

interface Department {
  id: number;
  name: string;
  description: string;
  lead_id: number | null;
}

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  
  // Input fields for Login/Register
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // App global collections
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  
  // Dashboard Metrics
  const [collegeDashboard, setCollegeDashboard] = useState<any>(null);
  const [presidentDashboard, setPresidentDashboard] = useState<any>(null);
  const [deptDashboard, setDeptDashboard] = useState<any>(null);

  const [viewingClub, setViewingClub] = useState<Club | null>(null);
  const [viewingClubDashboard, setViewingClubDashboard] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | ''>('');

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Department Dashboard state
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [viewingDeptDashboard, setViewingDeptDashboard] = useState<any>(null);
  const [viewingDeptMembers, setViewingDeptMembers] = useState<User[]>([]);
  const [viewingDeptTasks, setViewingDeptTasks] = useState<Task[]>([]);
  const [expandedClubId, setExpandedClubId] = useState<number | null>(null);
  
  // Modals state
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  
  // Form values for Modals
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignTo, setTaskAssignTo] = useState<number | ''>('');
  
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLeadId, setDeptLeadId] = useState<number | ''>('');
  
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');

  // College Management state (SUPER_ADMIN)
  const [showCreateCollegeModal, setShowCreateCollegeModal] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);



  // Fetch helper
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'API request failed');
    }
    
    if (res.status === 204) return null;
    return res.json();
  };

  // Load profile context
  useEffect(() => {
    if (token) {
      setLoading(true);
      apiFetch('/me')
        .then(data => {
          setUser(data);
          setErrorMsg('');
        })
        .catch(err => {
          setErrorMsg(err.message);
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [token]);

  // Load colleges list on component mount
  useEffect(() => {
    fetch(`${API_BASE}/colleges/public`)
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error("Error fetching colleges", err));
  }, []);

  // Load dashboard data depending on role
  useEffect(() => {
    if (!user) return;
    refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const collegesList = await apiFetch('/colleges');
        setColleges(collegesList);
        return;
      }

      // 1. Common data fetching
      const usersData = await apiFetch('/users');
      setAllUsers(usersData);
      
      const deptsData = await apiFetch('/departments');
      setDepartments(deptsData);
      
      const tasksData = await apiFetch('/tasks/my-tasks');
      setMyTasks(tasksData);

      const clubsData = await apiFetch('/clubs');
      setClubs(clubsData);

      // 2. Role specific data fetching
      if (user?.role === 'COLLEGE_REP') {
        const collegeStats = await apiFetch('/colleges/dashboard');
        setCollegeDashboard(collegeStats);
      } else if (user?.role === 'PRESIDENT' || user?.role === 'VICE_PRESIDENT' || user?.role === 'FACULTY_COORDINATOR') {
        const presStats = await apiFetch('/dashboard/president');
        setPresidentDashboard(presStats);
        const assignedByMe = await apiFetch('/tasks/created-by-me');
        setCreatedTasks(assignedByMe);
      } else if (user?.role === 'DEPARTMENT_LEAD') {
        const leadStats = await apiFetch('/departments/my-dashboard');
        setDeptDashboard(leadStats);
        const assignedByMe = await apiFetch('/tasks/created-by-me');
        setCreatedTasks(assignedByMe);
      }

      // 3. Applications data fetching
      if (user?.role === 'COLLEGE_REP' || (user?.role === 'MEMBER' && !user?.club_id)) {
        const appsData = await apiFetch('/applications');
        setApplications(appsData);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      // SECURITY WARNING: Storing JWT tokens in localStorage makes them vulnerable to XSS.
      // In production, this should be migrated to HttpOnly cookies set by the backend server.
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedCollegeId) {
      setErrorMsg('Please select a college.');
      return;
    }
    try {
      await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          college_id: Number(selectedCollegeId)
        })
      });
      setSuccessMsg('Registration successful! Please login.');
      setIsLogin(true);
      setAuthName('');
      setAuthPassword('');
      setSelectedCollegeId('');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskAssignTo) return;
    try {
      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          deadline: new Date(taskDeadline).toISOString(),
          assigned_to: Number(taskAssignTo)
        })
      });
      setShowAssignTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDeadline('');
      setTaskAssignTo('');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptLeadId) return;
    try {
      await apiFetch('/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: deptName,
          description: deptDesc,
          lead_id: Number(deptLeadId)
        })
      });
      setShowCreateDeptModal(false);
      setDeptName('');
      setDeptDesc('');
      setDeptLeadId('');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/clubs', {
        method: 'POST',
        body: JSON.stringify({ name: clubName, description: clubDesc })
      });
      setShowCreateClubModal(false);
      setClubName('');
      setClubDesc('');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/colleges', {
        method: 'POST',
        body: JSON.stringify({
          name: collegeName,
          code: collegeCode || null,
          address: collegeAddress || null,
          representative_name: repName,
          representative_email: repEmail
        })
      });
      setShowCreateCollegeModal(false);
      setCollegeName('');
      setCollegeCode('');
      setCollegeAddress('');
      setRepName('');
      setRepEmail('');
      setCreatedCredentials(data.credentials);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCollege = async (collegeId: number) => {
    if (!window.confirm("Are you sure you want to delete this college? All associated data will be affected.")) return;
    try {
      await apiFetch(`/colleges/${collegeId}`, {
        method: 'DELETE'
      });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    try {
      await apiFetch(`/colleges/${editingCollege.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: collegeName,
          code: collegeCode || null,
          address: collegeAddress || null
        })
      });
      setEditingCollege(null);
      setCollegeName('');
      setCollegeCode('');
      setCollegeAddress('');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClub = async (clubId: number) => {
    if (!confirm('Are you sure you want to delete this club?')) return;
    try {
      await apiFetch(`/clubs/${clubId}`, { method: 'DELETE' });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleViewClub = async (club: Club) => {
    try {
      setLoading(true);
      const stats = await apiFetch(`/dashboard/president?club_id=${club.id}`);
      setViewingClubDashboard(stats);
      setViewingClub(club);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDepartment = async (dept: Department) => {
    try {
      setLoading(true);
      const dashboard = await apiFetch(`/departments/${dept.id}/dashboard`);
      const members = await apiFetch(`/departments/${dept.id}/members`);
      const tasks = await apiFetch(`/departments/${dept.id}/tasks`);
      setViewingDeptDashboard(dashboard);
      setViewingDeptMembers(members);
      setViewingDeptTasks(tasks);
      setViewingDept(dept);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyDepartment = async () => {
    if (!user?.department_id) return;
    try {
      setLoading(true);
      // Fetch fresh list of departments to find our department
      const depts = await apiFetch(`/departments`);
      const dept = depts.find((d: any) => d.id === user.department_id);
      if (dept) {
        const dashboard = await apiFetch(`/departments/${dept.id}/dashboard`);
        const members = await apiFetch(`/departments/${dept.id}/members`);
        const tasks = await apiFetch(`/departments/${dept.id}/tasks`);
        setViewingDeptDashboard(dashboard);
        setViewingDeptMembers(members);
        setViewingDeptTasks(tasks);
        setViewingDept(dept);
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPosition = async (clubId: number, role: string, departmentId?: number) => {
    try {
      await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({
          club_id: clubId,
          role: role,
          department_id: departmentId || null
        })
      });
      alert('Application submitted successfully!');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveApplication = async (appId: number) => {
    try {
      await apiFetch(`/applications/${appId}/approve`, { method: 'POST' });
      alert('Application approved successfully!');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectApplication = async (appId: number) => {
    try {
      await apiFetch(`/applications/${appId}/reject`, { method: 'POST' });
      alert('Application rejected.');
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };







  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER LOGIN / REGISTER CONTAINER
  // ──────────────────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>TaskFlow</h1>
            <p>{isLogin ? 'Sign in to access your organization dashboard' : 'Create an account to get started'}</p>
          </div>
          
          {errorMsg && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--accent-green)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="form-input"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                />
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Select College</label>
                <select
                  required
                  className="form-input"
                  style={{ background: 'var(--card-bg)', color: '#fff' }}
                  value={selectedCollegeId}
                  onChange={e => setSelectedCollegeId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- Choose your College --</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                className="form-input"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn">
              {isLogin ? <Key size={16} /> : <UserPlus size={16} />}
              {isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? (
              <>
                New to TaskFlow?{' '}
                <span className="auth-link" onClick={() => { setIsLogin(false); setErrorMsg(''); }}>
                  Create an account
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="auth-link" onClick={() => { setIsLogin(true); setErrorMsg(''); }}>
                  Sign in instead
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Helper lists for user dropdowns
  const membersList = allUsers.filter(u => u.role === 'MEMBER' && u.department_id === user.department_id);
  const leadsList = allUsers.filter(u => u.role === 'DEPARTMENT_LEAD');
  const executivesList = allUsers.filter(u => u.role === 'PRESIDENT' || u.role === 'VICE_PRESIDENT');

  const getClubDepartments = (clubId: number) => {
    return departments.filter(d => d.club_id === clubId);
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER APP SHELL (SIDEBAR & MAIN CONTENT)
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <FolderKanban size={24} color="#8b5cf6" />
          <span>TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {user.role !== 'COLLEGE_REP' && user.role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => { setActiveTab('departments'); setViewingDept(null); }}
              className={`nav-item ${activeTab === 'departments' ? 'active' : ''}`}
            >
              <Building2 size={18} />
              Departments
            </button>
          )}

          {user.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setActiveTab('colleges_mgmt')}
              className={`nav-item ${activeTab === 'colleges_mgmt' ? 'active' : ''}`}
            >
              <Building2 size={18} />
              Manage Colleges
            </button>
          )}

          {user.role === 'MEMBER' && user.department_id && (
            <button
              onClick={() => { setActiveTab('my_department'); handleViewMyDepartment(); }}
              className={`nav-item ${activeTab === 'my_department' ? 'active' : ''}`}
            >
              <Building2 size={18} />
              My Department
            </button>
          )}

          {user.role === 'COLLEGE_REP' && (
            <button
              onClick={() => setActiveTab('clubs')}
              className={`nav-item ${activeTab === 'clubs' ? 'active' : ''}`}
            >
              <FolderKanban size={18} />
              Clubs
            </button>
          )}

          {['COLLEGE_REP', 'FACULTY_COORDINATOR', 'PRESIDENT', 'VICE_PRESIDENT', 'DEPARTMENT_LEAD'].includes(user.role) && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            >
              <Users size={18} />
              Applications
            </button>
          )}

          {(user.role === 'DEPARTMENT_LEAD' || user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'FACULTY_COORDINATOR') && (
            <button
              onClick={() => setActiveTab('members')}
              className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
            >
              <Users size={18} />
              Roster / Leads
            </button>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <UserIcon size={18} />
            Profile
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="main-layout">
        {/* Header Bar */}
        <header className="header">
          <div className="header-title">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h2>
          </div>
          
          <div className="header-actions">


            <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--accent-purple)', border: '1px solid var(--primary)' }}>
              {user.role}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="content-container">

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: APPLICATIONS (College Rep only)
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'applications' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-title">
                      {user.role === 'COLLEGE_REP'
                        ? 'Coordinator Applications'
                        : user.role === 'DEPARTMENT_LEAD'
                        ? 'Member Applications'
                        : user.role === 'FACULTY_COORDINATOR'
                        ? 'Club Applications'
                        : 'Department Lead Applications'}
                    </span>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>
                      {user.role === 'COLLEGE_REP'
                        ? 'Review applications for Faculty Coordinator positions'
                        : user.role === 'DEPARTMENT_LEAD'
                        ? 'Review applications for Department Membership'
                        : user.role === 'FACULTY_COORDINATOR'
                        ? 'Review applications for leadership and department roles in your club'
                        : 'Review applications for Department Lead positions in your club'}
                    </p>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state">
                    <h3>No applications received</h3>
                    <p>Applications from users applying to coordinate clubs will appear here.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Email</th>
                          <th>Applied Club</th>
                          <th>Applied Position</th>
                          <th>Target Department</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{app.user_name}</td>
                            <td>{app.user_email}</td>
                            <td style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{app.club_name}</td>
                            <td style={{ textTransform: 'capitalize' }}>{app.role.replace('_', ' ').toLowerCase()}</td>
                            <td>{app.department_name || 'N/A'}</td>
                            <td>
                              <span className={`badge ${app.status === 'APPROVED' ? 'badge-completed' : app.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleApproveApplication(app.id)}
                                    className="btn"
                                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(app.id)}
                                    className="btn btn-secondary"
                                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', color: 'var(--accent-red)' }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* ────────────────────────────────────────────────────────────────────────
             TAB: DASHBOARD
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Card */}
              <div className="welcome-card">
                <h1>Welcome back, {user.name}!</h1>
                <p>Manage your organization, tasks, and members smoothly from your role-specific dashboard.</p>
              </div>

              {/* 1. MEMBER DASHBOARD VIEW (Assigned to a club) */}
              {user.role === 'MEMBER' && user.club_id && (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-title">Pending Tasks</span>
                      <span className="stat-value">{myTasks.filter(t => t.status === 'PENDING').length}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">In Progress</span>
                      <span className="stat-value">{myTasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed</span>
                      <span className="stat-value">{myTasks.filter(t => t.status === 'COMPLETED').length}</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">My Assigned Tasks</span>
                    </div>
                    {myTasks.length === 0 ? (
                      <div className="empty-state">
                        <CheckCircle2 size={36} color="var(--accent-green)" />
                        <h3>All caught up!</h3>
                        <p>No tasks assigned to you currently.</p>
                      </div>
                    ) : (
                      <div className="task-list">
                        {myTasks.map(task => (
                          <div className="task-item" key={task.id}>
                            <div className="task-details">
                              <div className="task-title">{task.title}</div>
                              <div className="task-desc">{task.description}</div>
                              <div className="task-meta">
                                <span><Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="task-actions">
                              <select
                                className="status-select"
                                value={task.status}
                                onChange={e => handleUpdateStatus(task.id, e.target.value)}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                              <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : task.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-pending'}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 1A. UNASSIGNED MEMBER LANDING VIEW (Not yet in a club) */}
              {user.role === 'MEMBER' && !user.club_id && (
                <div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <span className="card-title">Join a Club or Apply for a Position</span>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Welcome to TaskFlow! Review the active clubs in your college below to apply for a role.</p>
                      </div>
                    </div>
                    
                    {clubs.filter(c => c.college_id === user.college_id).length === 0 ? (
                      <div className="empty-state">
                        <h3>No clubs registered under your College</h3>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '16px' }}>
                        {clubs.filter(c => c.college_id === user.college_id).map(club => {
                          const clubDepts = getClubDepartments(club.id);
                          const isNewClub = clubDepts.length === 0;
                          
                          // Helper check if applied
                          const hasAppliedRole = (role: string, deptId?: number) => {
                            return applications.some(a => 
                              a.club_id === club.id && 
                              a.role === role && 
                              (deptId ? a.department_id === deptId : !a.department_id) && 
                              a.status === 'PENDING'
                            );
                          };
                          
                          return (
                            <div 
                              className="card" 
                              key={club.id} 
                              style={{ border: '1px solid var(--border-color)', margin: 0, padding: '20px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                              onClick={() => setExpandedClubId(expandedClubId === club.id ? null : club.id)}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '6px' }}>{club.name}</h3>
                                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{club.description || 'No description'}</p>
                                </div>
                                <span className="badge" style={{ background: isNewClub ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isNewClub ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                  {isNewClub ? 'New Club' : 'Established Club'}
                                </span>
                              </div>

                              {/* Executive Positions */}
                              <div style={{ marginTop: '20px' }} onClick={e => e.stopPropagation()}>
                                <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>Apply for Club Leadership</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                  {['FACULTY_COORDINATOR', 'PRESIDENT', 'VICE_PRESIDENT'].map(role => {
                                    const applied = hasAppliedRole(role);
                                    return (
                                      <button
                                        key={role}
                                        onClick={(e) => { e.stopPropagation(); handleApplyPosition(club.id, role); }}
                                        disabled={applied}
                                        className="btn btn-secondary"
                                        style={{ 
                                          width: 'auto',
                                          padding: '8px 16px', 
                                          fontSize: '12px', 
                                          background: applied ? '#374151' : 'rgba(255,255,255,0.05)',
                                          color: applied ? 'var(--text-secondary)' : '#fff',
                                          cursor: applied ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        {applied ? 'Applied' : `Apply ${role.replace('_', ' ')}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Click Hint */}
                              {expandedClubId !== club.id && (
                                <p style={{ fontSize: '12px', color: 'var(--accent-purple)', marginTop: '16px', textAlign: 'right' }}>
                                  Click club card to view departments & apply for roles ↓
                                </p>
                              )}

                              {/* Departments (Only visible when card is expanded) */}
                              {expandedClubId === club.id && (
                                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }} onClick={e => e.stopPropagation()}>
                                  <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Departments & Membership</h4>
                                  {clubDepts.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No departments created in this club yet.</p>
                                  ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                      {clubDepts.map(dept => {
                                        const appliedLead = hasAppliedRole('DEPARTMENT_LEAD', dept.id);
                                        const appliedMember = hasAppliedRole('MEMBER', dept.id);
                                        return (
                                          <div key={dept.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div>
                                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{dept.name}</div>
                                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{dept.description}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleApplyPosition(club.id, 'DEPARTMENT_LEAD', dept.id); }}
                                                disabled={appliedLead}
                                                className="btn btn-secondary"
                                                style={{ 
                                                  width: 'auto',
                                                  padding: '6px 12px', 
                                                  fontSize: '11px',
                                                  background: appliedLead ? '#374151' : 'rgba(139,92,246,0.1)',
                                                  color: appliedLead ? 'var(--text-secondary)' : 'var(--accent-purple)'
                                                }}
                                              >
                                                {appliedLead ? 'Applied Lead' : 'Apply Lead'}
                                              </button>
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleApplyPosition(club.id, 'MEMBER', dept.id); }}
                                                disabled={appliedMember}
                                                className="btn"
                                                style={{ 
                                                  width: 'auto',
                                                  padding: '6px 12px', 
                                                  fontSize: '11px',
                                                  background: appliedMember ? '#374151' : 'var(--accent-purple)'
                                                }}
                                              >
                                                {appliedMember ? 'Applied Member' : 'Apply Member'}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {applications.length > 0 && (
                    <div className="card" style={{ marginTop: '24px' }}>
                      <div className="card-header">
                        <span className="card-title">My Submitted Applications</span>
                      </div>
                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Applied Club</th>
                              <th>Applied Position</th>
                              <th>Target Department</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {applications.map(app => (
                              <tr key={app.id}>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{app.club_name}</td>
                                <td style={{ textTransform: 'capitalize' }}>{app.role.replace('_', ' ').toLowerCase()}</td>
                                <td>{app.department_name || 'N/A'}</td>
                                <td>
                                  <span className={`badge ${app.status === 'APPROVED' ? 'badge-completed' : app.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                                    {app.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. DEPARTMENT LEAD DASHBOARD VIEW */}
              {user.role === 'DEPARTMENT_LEAD' && (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-title">Tasks for Me</span>
                      <span className="stat-value">{myTasks.length}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Assigned By Me</span>
                      <span className="stat-value">{createdTasks.length}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Dept Members</span>
                      <span className="stat-value">{deptDashboard?.members || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed Tasks</span>
                      <span className="stat-value">{deptDashboard?.completed_tasks || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Tasks assigned to lead */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Tasks Assigned to Me</span>
                      </div>
                      {myTasks.length === 0 ? (
                        <div className="empty-state">
                          <h3>No tasks</h3>
                        </div>
                      ) : (
                        <div className="task-list">
                          {myTasks.map(task => (
                            <div className="task-item" key={task.id}>
                              <div className="task-details">
                                <div className="task-title">{task.title}</div>
                                <div className="task-meta">
                                  <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>{task.status}</span>
                                </div>
                              </div>
                              <select
                                className="status-select"
                                value={task.status}
                                onChange={e => handleUpdateStatus(task.id, e.target.value)}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tasks assigned by lead */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Tasks Assigned By Me</span>
                        <button onClick={() => setShowAssignTaskModal(true)} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                          <Plus size={14} /> Assign Task
                        </button>
                      </div>
                      {createdTasks.length === 0 ? (
                        <div className="empty-state">
                          <h3>No tasks assigned</h3>
                        </div>
                      ) : (
                        <div className="task-list">
                          {createdTasks.map(task => {
                            const assignee = allUsers.find(u => u.id === task.assigned_to);
                            return (
                              <div className="task-item" key={task.id}>
                                <div className="task-details">
                                  <div className="task-title">{task.title}</div>
                                  <div className="task-meta">
                                    <span>To: {assignee?.name || `User #${task.assigned_to}`}</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>{task.status}</span>
                                  <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PRESIDENT / VICE PRESIDENT / FACULTY COORDINATOR DASHBOARD VIEW */}
              {(user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'FACULTY_COORDINATOR') && (
                <div>
                  <div className="stats-grid">
                    <div 
                      className="stat-card" 
                      onClick={() => setActiveTab('departments')}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="stat-title">Total Departments</span>
                      <span className="stat-value">{presidentDashboard?.total_departments || 0}</span>
                    </div>
                    <div 
                      className="stat-card" 
                      onClick={() => setActiveTab('members')}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="stat-title">
                        {user.role === 'FACULTY_COORDINATOR' ? 'Total Club Members' : 'Total Organization Users'}
                      </span>
                      <span className="stat-value">{presidentDashboard?.total_users || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Total Tasks</span>
                      <span className="stat-value">{presidentDashboard?.total_tasks || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed vs Pending</span>
                      <span className="stat-value">{presidentDashboard?.completed_tasks || 0} / {presidentDashboard?.pending_tasks || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Tasks Assigned by Me</span>
                        <button onClick={() => setShowAssignTaskModal(true)} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                          <Plus size={14} /> Assign Task
                        </button>
                      </div>
                      {createdTasks.length === 0 ? (
                        <div className="empty-state">
                          <h3>No tasks assigned yet</h3>
                        </div>
                      ) : (
                        <div className="table-wrapper">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Assignee (Role)</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {createdTasks.map(task => {
                                const assignee = allUsers.find(u => u.id === task.assigned_to);
                                return (
                                  <tr key={task.id}>
                                    <td>
                                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{task.description}</div>
                                    </td>
                                    <td>{assignee?.name} ({assignee?.role})</td>
                                    <td>
                                      <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : task.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-pending'}`}>
                                        {task.status}
                                      </span>
                                    </td>
                                    <td>
                                      <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">My Tasks (Assigned to Me)</span>
                      </div>
                      {myTasks.length === 0 ? (
                        <div className="empty-state">
                          <p>No tasks assigned to you by superiors.</p>
                        </div>
                      ) : (
                        <div className="task-list">
                          {myTasks.map(task => (
                            <div className="task-item" key={task.id} style={{ padding: '12px' }}>
                              <div className="task-details">
                                <div className="task-title" style={{ fontSize: '14px' }}>{task.title}</div>
                                <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '10px' }}>
                                  {task.status}
                                </span>
                              </div>
                              <select
                                className="status-select"
                                value={task.status}
                                onChange={e => handleUpdateStatus(task.id, e.target.value)}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SUPER ADMIN DASHBOARD VIEW */}
              {user.role === 'SUPER_ADMIN' && (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('colleges_mgmt')}>
                      <span className="stat-title">Total Colleges</span>
                      <span className="stat-value">{colleges.length}</span>
                    </div>
                  </div>
                  <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                      <span className="card-title">Quick Actions</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '10px 0' }}>
                      <button onClick={() => { setShowCreateCollegeModal(true); setActiveTab('colleges_mgmt'); }} className="btn" style={{ padding: '16px', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={24} />
                        <span>Register New College</span>
                      </button>
                      <button onClick={() => setActiveTab('profile')} className="btn btn-secondary" style={{ padding: '16px', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        <UserIcon size={24} />
                        <span>View My Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COLLEGE REPRESENTATIVE DASHBOARD VIEW */}
              {user.role === 'COLLEGE_REP' && (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-title">Total Clubs</span>
                      <span className="stat-value">{collegeDashboard?.total_clubs || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Total Tasks Assigned</span>
                      <span className="stat-value">{collegeDashboard?.total_tasks_assigned || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed Tasks</span>
                      <span className="stat-value">{collegeDashboard?.total_tasks_completed || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completion Rate</span>
                      <span className="stat-value">
                        {collegeDashboard?.total_tasks_assigned > 0
                          ? `${Math.round((collegeDashboard?.total_tasks_completed / collegeDashboard?.total_tasks_assigned) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Club Task Overview (Observational)</span>
                      <button onClick={() => setShowCreateClubModal(true)} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                        <Plus size={14} /> Create Club
                      </button>
                    </div>

                    {clubs.length === 0 ? (
                      <div className="empty-state">
                        <Building2 size={36} color="var(--accent-purple)" />
                        <h3>No clubs registered</h3>
                        <p>Create a club to begin organization oversight.</p>
                      </div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Club ID</th>
                              <th>Club Name</th>
                              <th>Description</th>
                              <th>Pending Tasks</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clubs.map(club => {
                              const pendingStats = collegeDashboard?.pending_tasks_per_club?.find((p: any) => p.club_id === club.id);
                              return (
                                <tr key={club.id}>
                                  <td>#{club.id}</td>
                                  <td 
                                    style={{ fontWeight: 600, color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => handleViewClub(club)}
                                  >
                                    {club.name}
                                  </td>
                                  <td>{club.description || 'No description'}</td>
                                  <td>
                                    <span className="badge badge-pending">
                                      {pendingStats ? pendingStats.pending_tasks : 0} Pending
                                    </span>
                                  </td>
                                  <td>
                                    <button onClick={() => handleDeleteClub(club.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: DEPARTMENTS
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'departments' && (
            <div>
              {user.role === 'MEMBER' && !user.club_id ? (
                <div className="card">
                  <div className="empty-state">
                    <h3>Join a club first</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>You must be a member of a club to view its departments. Go to the Dashboard to join/apply to a club.</p>
                  </div>
                </div>
              ) : viewingDept ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', color: '#fff', fontWeight: 700 }}>{viewingDept.name} Dashboard</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{viewingDept.description}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setViewingDept(null)} style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                      ← Back to Departments
                    </button>
                  </div>

                  <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                      <span className="stat-title">Total Members</span>
                      <span className="stat-value">{viewingDeptDashboard?.total_members || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Total Tasks</span>
                      <span className="stat-value">{viewingDeptDashboard?.total_tasks || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Pending / In Progress</span>
                      <span className="stat-value">
                        {viewingDeptDashboard?.pending_tasks || 0} / {viewingDeptDashboard?.in_progress_tasks || 0}
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed Tasks</span>
                      <span className="stat-value">{viewingDeptDashboard?.completed_tasks || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                    {/* Members List */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Department Members</span>
                      </div>
                      {viewingDeptMembers.length === 0 ? (
                        <div className="empty-state">
                          <h3>No members in this department</h3>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {viewingDeptMembers.map(member => (
                            <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{member.name}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{member.email}</div>
                              </div>
                              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
                                {member.role === 'DEPARTMENT_LEAD' ? 'Lead' : 'Member'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tasks List */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Department Tasks</span>
                      </div>
                      {viewingDeptTasks.length === 0 ? (
                        <div className="empty-state">
                          <h3>No tasks assigned in this department</h3>
                        </div>
                      ) : (
                        <div className="task-list">
                          {viewingDeptTasks.map(task => {
                            const assignee = viewingDeptMembers.find(m => m.id === task.assigned_to) || allUsers.find(u => u.id === task.assigned_to);
                            return (
                              <div className="task-item" key={task.id} style={{ padding: '16px' }}>
                                <div className="task-details" style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    <div className="task-title" style={{ fontSize: '15px', fontWeight: 600 }}>{task.title}</div>
                                    <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : task.status === 'IN_PROGRESS' ? 'badge-pending' : ''}`} style={{ background: task.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.1)' : undefined, color: task.status === 'IN_PROGRESS' ? '#f59e0b' : undefined }}>
                                      {task.status}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>{task.description}</p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                    <span>Assigned to: <strong style={{ color: '#fff' }}>{assignee?.name || `User #${task.assigned_to}`}</strong></span>
                                    <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <span className="card-title">Departments</span>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>Overview of all active departments inside the organization</p>
                    </div>
                    {(user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') && (
                      <button onClick={() => setShowCreateDeptModal(true)} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                        <Plus size={14} /> Create Department
                      </button>
                    )}
                  </div>

                  {departments.length === 0 ? (
                    <div className="empty-state">
                      <h3>No departments created yet</h3>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {departments.map(dept => {
                        const lead = allUsers.find(u => u.id === dept.lead_id);
                        return (
                          <div 
                            className="stat-card" 
                            key={dept.id} 
                            style={{ gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                            onClick={() => handleViewDepartment(dept)}
                          >
                            <div>
                              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '4px' }}>{dept.name}</h3>
                              <p style={{ fontSize: '13px' }}>{dept.description}</p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Lead: <strong style={{ color: 'var(--accent-purple)' }}>{lead ? lead.name : 'Unassigned'}</strong></span>
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>ID: {dept.id}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: MY DEPARTMENT (Member only)
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'my_department' && (
            <div>
              {viewingDept ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', color: '#fff', fontWeight: 700 }}>{viewingDept.name} Dashboard</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{viewingDept.description}</p>
                    </div>
                  </div>

                  <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                      <span className="stat-title">Total Members</span>
                      <span className="stat-value">{viewingDeptDashboard?.total_members || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Total Tasks</span>
                      <span className="stat-value">{viewingDeptDashboard?.total_tasks || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Pending / In Progress</span>
                      <span className="stat-value">
                        {viewingDeptDashboard?.pending_tasks || 0} / {viewingDeptDashboard?.in_progress_tasks || 0}
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-title">Completed Tasks</span>
                      <span className="stat-value">{viewingDeptDashboard?.completed_tasks || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                    {/* Members List */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Department Members</span>
                      </div>
                      {viewingDeptMembers.length === 0 ? (
                        <div className="empty-state">
                          <h3>No members in this department</h3>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {viewingDeptMembers.map(member => (
                            <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{member.name}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{member.email}</div>
                              </div>
                              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
                                {member.role === 'DEPARTMENT_LEAD' ? 'Lead' : 'Member'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tasks List */}
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Department Tasks</span>
                      </div>
                      {viewingDeptTasks.length === 0 ? (
                        <div className="empty-state">
                          <h3>No tasks assigned in this department</h3>
                        </div>
                      ) : (
                        <div className="task-list">
                          {viewingDeptTasks.map(task => {
                            const assignee = viewingDeptMembers.find(m => m.id === task.assigned_to) || allUsers.find(u => u.id === task.assigned_to);
                            return (
                              <div className="task-item" key={task.id} style={{ padding: '16px' }}>
                                <div className="task-details" style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    <div className="task-title" style={{ fontSize: '15px', fontWeight: 600 }}>{task.title}</div>
                                    <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : task.status === 'IN_PROGRESS' ? 'badge-pending' : ''}`} style={{ background: task.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.1)' : undefined, color: task.status === 'IN_PROGRESS' ? '#f59e0b' : undefined }}>
                                      {task.status}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>{task.description}</p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                    <span>Assigned to: <strong style={{ color: '#fff' }}>{assignee?.name || `User #${task.assigned_to}`}</strong></span>
                                    <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <h3>Loading department dashboard...</h3>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: CLUBS (College Rep only)
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'clubs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Manage College Clubs</span>
                  <button onClick={() => setShowCreateClubModal(true)} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                    <Plus size={14} /> Create Club
                  </button>
                </div>

                {clubs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No clubs created yet</h3>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {clubs.map(club => (
                      <div className="stat-card" key={club.id} style={{ gap: '12px' }}>
                        <div>
                          <h3 
                            style={{ color: '#fff', fontSize: '18px', marginBottom: '4px', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleViewClub(club)}
                          >
                            {club.name}
                          </h3>
                          <p style={{ fontSize: '13px' }}>{club.description}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>ID: {club.id}</span>
                          <button onClick={() => handleDeleteClub(club.id)} className="btn btn-secondary" style={{ width: 'auto', padding: '4px 8px', color: 'var(--accent-red)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: ROSTER / LEADS
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'members' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">User Directory & Assignments</span>
                </div>
                
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Dept ID</th>
                        <th>Club ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-purple)' }}>
                              {u.role}
                            </span>
                          </td>
                          <td>{u.department_id || 'None'}</td>
                          <td>{u.club_id || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: PROFILE
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="user-avatar" style={{ width: '72px', height: '72px', fontSize: '28px', margin: '0 auto 20px' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2>{user.name}</h2>
                <p style={{ marginBottom: '24px' }}>{user.email}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>#{user.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>User Role</span>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{user.role}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>College ID Association</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{user.college_id || 'Not Assigned'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Club ID Association</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{user.club_id || 'Not Assigned'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Department ID Association</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{user.department_id || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
             TAB: COLLEGES MANAGEMENT (SUPER_ADMIN only)
             ──────────────────────────────────────────────────────────────────────── */}
          {activeTab === 'colleges_mgmt' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-title">Manage Colleges</span>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>Register, edit, and manage all colleges and their representatives on the platform.</p>
                  </div>
                  <button onClick={() => { setEditingCollege(null); setShowCreateCollegeModal(true); }} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                    <Plus size={14} /> Register New College
                  </button>
                </div>

                {colleges.length === 0 ? (
                  <div className="empty-state">
                    <h3>No colleges registered yet</h3>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>College Name</th>
                          <th>Code</th>
                          <th>Address</th>
                          <th>Representative</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {colleges.map(c => (
                          <tr key={c.id}>
                            <td>#{c.id}</td>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{c.name}</td>
                            <td>{c.code || 'N/A'}</td>
                            <td>{c.address || 'N/A'}</td>
                            <td>{c.representative_name || 'Unassigned'}</td>
                            <td>{c.representative_email || 'N/A'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setEditingCollege(c);
                                    setCollegeName(c.name);
                                    setCollegeCode(c.code || '');
                                    setCollegeAddress(c.address || '');
                                  }}
                                  className="btn btn-secondary"
                                  style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCollege(c.id)}
                                  className="btn btn-secondary"
                                  style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', color: 'var(--accent-red)' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: ASSIGN TASK
         ──────────────────────────────────────────────────────────────────────── */}
      {showAssignTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Assign New Task</h3>
              <button className="close-btn" onClick={() => setShowAssignTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Complete research draft"
                    className="form-input"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    placeholder="Provide details about the task requirements"
                    className="form-input"
                    rows={3}
                    style={{ resize: 'none' }}
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={taskDeadline}
                    onChange={e => setTaskDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    required
                    className="form-input"
                    value={taskAssignTo}
                    onChange={e => setTaskAssignTo(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Select Assignee</option>
                    
                    {/* Faculty Coordinator assigns to President/VP only */}
                    {user.role === 'FACULTY_COORDINATOR' && executivesList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                    
                    {/* Executive assigns to Department Leads only */}
                    {(user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') && leadsList.map(u => {
                      const dept = departments.find(d => d.id === u.department_id);
                      return (
                        <option key={u.id} value={u.id}>
                          {dept ? `${dept.name} Lead` : `${u.name} (Lead)`}
                        </option>
                      );
                    })}

                    {/* Department Lead assigns to Department Members only */}
                    {user.role === 'DEPARTMENT_LEAD' && membersList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} (Member)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: CREATE DEPARTMENT
         ──────────────────────────────────────────────────────────────────────── */}
      {showCreateDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Create Department</h3>
              <button className="close-btn" onClick={() => setShowCreateDeptModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Technical Department"
                    className="form-input"
                    value={deptName}
                    onChange={e => setDeptName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    placeholder="Technical projects, workshops, and contests"
                    className="form-input"
                    rows={3}
                    style={{ resize: 'none' }}
                    value={deptDesc}
                    onChange={e => setDeptDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Lead</label>
                  <select
                    required
                    className="form-input"
                    value={deptLeadId}
                    onChange={e => setDeptLeadId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Select Department Lead</option>
                    {leadsList.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: CREATE CLUB
         ──────────────────────────────────────────────────────────────────────── */}
      {showCreateClubModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Register New Club</h3>
              <button className="close-btn" onClick={() => setShowCreateClubModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClub}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Club Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Robotics Club"
                    className="form-input"
                    value={clubName}
                    onChange={e => setClubName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    placeholder="Building hardware and software robots"
                    className="form-input"
                    rows={3}
                    style={{ resize: 'none' }}
                    value={clubDesc}
                    onChange={e => setClubDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateClubModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: READ-ONLY CLUB PRESIDENT DASHBOARD VIEW (College Rep only)
         ──────────────────────────────────────────────────────────────────────── */}
      {viewingClub && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '20px', color: '#fff' }}>{viewingClub.name} — Dashboard</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Read-only observational access</p>
              </div>
              <button className="close-btn" onClick={() => setViewingClub(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              
              {/* Metrics Grid */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="stat-card" style={{ padding: '16px' }}>
                  <span className="stat-title" style={{ fontSize: '11px' }}>Departments</span>
                  <span className="stat-value" style={{ fontSize: '24px' }}>{viewingClubDashboard?.total_departments || 0}</span>
                </div>
                <div className="stat-card" style={{ padding: '16px' }}>
                  <span className="stat-title" style={{ fontSize: '11px' }}>Club Members</span>
                  <span className="stat-value" style={{ fontSize: '24px' }}>{viewingClubDashboard?.total_users || 0}</span>
                </div>
                <div className="stat-card" style={{ padding: '16px' }}>
                  <span className="stat-title" style={{ fontSize: '11px' }}>Total Tasks</span>
                  <span className="stat-value" style={{ fontSize: '24px' }}>{viewingClubDashboard?.total_tasks || 0}</span>
                </div>
                <div className="stat-card" style={{ padding: '16px' }}>
                  <span className="stat-title" style={{ fontSize: '11px' }}>Completed / Pending</span>
                  <span className="stat-value" style={{ fontSize: '18px' }}>
                    {viewingClubDashboard?.completed_tasks || 0} / {viewingClubDashboard?.pending_tasks || 0}
                  </span>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="card" style={{ marginBottom: '0' }}>
                <div className="card-header">
                  <span className="card-title">Departments Summary</span>
                </div>
                {(!viewingClubDashboard?.departments || viewingClubDashboard.departments.length === 0) ? (
                  <div className="empty-state">
                    <p>No departments registered under this club.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Department Name</th>
                          <th>Members</th>
                          <th>Tasks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingClubDashboard.departments.map((dept: any) => (
                          <tr key={dept.department_id}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{dept.department_name}</td>
                            <td>{dept.members} Members</td>
                            <td>{dept.tasks} Tasks</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setViewingClub(null)}>
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: REGISTER COLLEGE (SUPER_ADMIN)
         ──────────────────────────────────────────────────────────────────────── */}
      {showCreateCollegeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Register New College</h3>
              <button className="close-btn" onClick={() => setShowCreateCollegeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCollege}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">College Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Stanford University"
                    className="form-input"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="SU"
                    className="form-input"
                    value={collegeCode}
                    onChange={e => setCollegeCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="Stanford, CA 94305"
                    className="form-input"
                    value={collegeAddress}
                    onChange={e => setCollegeAddress(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Representative Account Assignment</h4>
                </div>
                <div className="form-group">
                  <label className="form-label">Representative Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="form-input"
                    value={repName}
                    onChange={e => setRepName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Representative Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rep@stanford.edu"
                    className="form-input"
                    value={repEmail}
                    onChange={e => setRepEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateCollegeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                  Register College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: EDIT COLLEGE (SUPER_ADMIN)
         ──────────────────────────────────────────────────────────────────────── */}
      {editingCollege && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Edit College Details</h3>
              <button className="close-btn" onClick={() => setEditingCollege(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateCollege}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">College Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College Code (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={collegeCode}
                    onChange={e => setCollegeCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College Address (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={collegeAddress}
                    onChange={e => setCollegeAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCollege(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
         MODAL: REPRESENTATIVE CREDENTIALS DISPLAY (SUPER_ADMIN)
         ──────────────────────────────────────────────────────────────────────── */}
      {createdCredentials && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', color: '#10b981' }}>Representative Credentials</h3>
              <button className="close-btn" onClick={() => setCreatedCredentials(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <p style={{ marginBottom: '12px' }}>Copy these credentials to hand off to the College Representative:</p>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>Email: <strong style={{ color: '#fff' }}>{createdCredentials.email}</strong></div>
                <div>Password: <strong style={{ color: '#fff' }}>{createdCredentials.password}</strong></div>
              </div>
              <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>Note: These credentials will not be shown again.</p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setCreatedCredentials(null)}>Close</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
