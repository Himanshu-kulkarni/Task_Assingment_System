import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            Go back
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForbiddenPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-gray-200 mb-4">403</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
      <p className="text-gray-500 mb-8">You don't have permission to view this page. Contact your administrator if you think this is a mistake.</p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);
