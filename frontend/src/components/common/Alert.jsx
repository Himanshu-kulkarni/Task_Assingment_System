const Alert = ({ type = 'error', message, onDismiss }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: '✕',
    success: '✓',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <span className="font-bold mt-0.5">{icons[type]}</span>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100 font-bold">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
