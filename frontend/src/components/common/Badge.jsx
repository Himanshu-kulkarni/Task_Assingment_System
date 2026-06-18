const Badge = ({ label, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color]}`}>
      {label}
    </span>
  );
};

export default Badge;
