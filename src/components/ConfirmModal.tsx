interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'info' | 'success';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  const colorMap = {
    warning: 'text-orange-600',
    info: 'text-blue-600',
    success: 'text-green-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <div className="text-center mb-4">
          <span className="text-5xl">{iconMap[type]}</span>
        </div>
        
        <h2 className={`text-2xl font-bold text-center mb-3 ${colorMap[type]}`}>
          {title}
        </h2>
        
        <p className="text-gray-700 text-center mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
