import React from 'react';
import { Eye, X, Copy, Crown, Download, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';

export default function PreviewMediaModal({
  file,
  onClose,
  onCopyUrl,
  copiedUrl,
  onSetAsLogo,
  formatFileSize
}) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-4 border-primary-dark shadow-hard max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="bg-primary-dark text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-primary-dark">
          <div className="flex items-center gap-2 truncate pr-2">
            <Eye size={18} className="text-secondary-light shrink-0" />
            <h3 className="font-black text-sm uppercase truncate">
              Pratinjau Berkas: {file.original_name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <div className="bg-gray-100 border-2 border-primary-dark max-h-[60vh] flex items-center justify-center overflow-hidden">
            {file.file_type === 'image' ? (
              <img
                src={`${API_BASE_URL}${file.file_url}`}
                alt={file.original_name}
                className="max-h-[55vh] max-w-full object-contain"
              />
            ) : file.file_type === 'video' ? (
              <video
                src={`${API_BASE_URL}${file.file_url}`}
                controls
                autoPlay
                className="max-h-[55vh] max-w-full"
              />
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="w-16 h-16 bg-primary-dark text-white flex items-center justify-center mx-auto border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <FileText size={32} />
                </div>
                <p className="font-black text-sm uppercase text-primary-dark">{file.original_name}</p>
                <p className="text-xs text-gray-500">Berkas Dokumen ({formatFileSize(file.file_size)})</p>
              </div>
            )}
          </div>

          {/* Details Table */}
          <div className="bg-gray-50 border-2 border-primary-dark p-3 text-xs space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama Asli:</span>
              <span className="font-bold text-primary-dark truncate max-w-xs">{file.original_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tipe / Ukuran:</span>
              <span className="font-bold text-primary-dark">{file.file_type?.toUpperCase()} • {formatFileSize(file.file_size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sumber / Diunggah Oleh:</span>
              <span className="font-bold text-primary-dark">{file.source} • {file.uploaded_by}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">URL Berkas:</span>
              <span className="font-mono text-primary-dark truncate max-w-xs">{file.file_url}</span>
            </div>
          </div>

          {/* Actions in Preview */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCopyUrl(file.file_url)}
                className="px-3 py-1.5 text-xs font-black uppercase border-2 border-primary-dark bg-white hover:bg-gray-100 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Copy size={13} /> {copiedUrl === file.file_url ? 'Tersalin!' : 'Salin URL'}
              </button>
              {file.file_type === 'image' && onSetAsLogo && (
                <button
                  type="button"
                  onClick={() => {
                    onSetAsLogo(file.file_url);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-black uppercase border-2 border-primary-dark bg-gradient-yellow text-primary-dark hover:bg-yellow-400 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Crown size={13} /> Jadikan Logo Website
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`${API_BASE_URL}${file.file_url}`}
                download
                className="px-3 py-1.5 text-xs font-black uppercase border-2 border-primary-dark bg-primary-dark text-white hover:bg-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Download size={13} /> Unduh File
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-black uppercase border-2 border-primary-dark bg-gray-200 hover:bg-gray-300 text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
