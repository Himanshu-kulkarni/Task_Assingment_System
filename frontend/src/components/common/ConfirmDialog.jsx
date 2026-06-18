import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmColor = 'red', loading = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 ${
          confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {loading ? 'Processing…' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
