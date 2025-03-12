import { Squircle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = true
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="modal-gradient p-0 w-[450px] max-w-full rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-theme" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {isDangerous && (
              <Squircle size={20} className="text-crimson-red" />
            )}
            <span>{title}</span>
          </h3>
          <button 
            onClick={onCancel} 
            className="p-1 hover:bg-theme-background-alt rounded text-theme-muted hover:text-theme-text"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-theme-text mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded ${
                isDangerous 
                  ? 'bg-crimson-red hover:bg-red-700' 
                  : 'bg-electric-blue hover:bg-blue-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
