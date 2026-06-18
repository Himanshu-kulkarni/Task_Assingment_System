import { Link } from 'react-router-dom';

const COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-indigo-600',
];

const DepartmentCard = ({ department, index = 0 }) => {
  const gradient = COLORS[index % COLORS.length];

  return (
    <Link
      to={`/departments/${department.department_id}`}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg`}>
            {department.name?.[0]?.toUpperCase() || 'D'}
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md font-medium">
            #{department.department_id?.slice(-6)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
          {department.name}
        </h3>
        {department.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{department.description}</p>
        )}

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {department.lead?.name ? `Lead: ${department.lead.name}` : 'No lead assigned'}
          </span>
          <span className="text-xs text-indigo-600 font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
};

export default DepartmentCard;
