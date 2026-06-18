const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
    {action && action}
  </div>
);

export default EmptyState;
