import { AlertTriangle, Trash2, ShieldAlert, CheckCircle, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  showCancel = true,
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onCancel,
  isLoading = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      headerBg: 'bg-red-600',
      headerText: 'text-white',
      icon: <Trash2 size={22} className="text-white" />,
      btnBg: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      headerBg: 'bg-gradient-yellow',
      headerText: 'text-primary-dark',
      icon: <ShieldAlert size={22} className="text-primary-dark" />,
      btnBg: 'bg-gradient-yellow hover:brightness-105 text-primary-dark'
    },
    info: {
      headerBg: 'bg-gradient-blue',
      headerText: 'text-white',
      icon: <HelpCircle size={22} className="text-white" />,
      btnBg: 'bg-gradient-blue hover:brightness-110 text-white'
    },
    success: {
      headerBg: 'bg-gradient-green',
      headerText: 'text-white',
      icon: <CheckCircle size={22} className="text-white" />,
      btnBg: 'bg-gradient-green hover:brightness-105 text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className={`${config.headerBg} ${config.headerText} p-4 flex items-center justify-between border-b-4 border-primary-dark`}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-black/10 border-2 border-current shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
              {config.icon}
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 hover:bg-black/10 border-2 border-transparent hover:border-current transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-line">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 border-2 border-primary-dark bg-gray-100 hover:bg-gray-200 text-primary-dark text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 border-2 border-primary-dark ${config.btnBg} text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5`}
            >
              {isLoading ? 'Memproses...' : confirmText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
