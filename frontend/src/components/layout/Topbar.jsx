import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-4 px-4 lg:px-6 shrink-0">
      {/* Hamburger */}
      <button
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-colors"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-500">
          Welcome, <span className="font-medium text-gray-800">{user?.name?.split(' ')[0]}</span>
        </span>
      </div>
    </header>
  );
};

export default Topbar;
