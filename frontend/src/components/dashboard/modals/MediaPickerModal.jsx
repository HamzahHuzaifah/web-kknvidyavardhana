import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderOpen, X, Folder, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';

export default function MediaPickerModal({
  isOpen,
  onClose,
  target, // 'image' | 'document'
  onSelectFile,
  formatFileSize
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get('/api/files?type=all&source=all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setFiles(res.data.files || []))
      .catch(err => console.error('Error fetching files for MediaPicker:', err))
      .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFiles = files.filter((f) =>
    target === 'image' ? f.file_type === 'image' : f.file_type === 'document' || f.file_type === 'other'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-4 border-primary-dark shadow-hard max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary-dark text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-primary-dark">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-secondary-light" />
            <h3 className="font-black text-sm uppercase">
              Pilih {target === 'image' ? 'Foto Sampul' : 'Dokumen'} Dari Manajer Berkas
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

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-gray-600 font-medium">
            Klik pada berkas yang ingin digunakan untuk artikel/publikasi ini. Berkas yang tampil di sini mencakup seluruh upload sebelumnya.
          </p>

          {loading ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <p className="text-xs font-bold uppercase">Memuat Berkas...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Folder size={36} className="mx-auto text-gray-400" />
              <p className="text-xs font-bold uppercase">
                Belum ada {target === 'image' ? 'gambar' : 'dokumen'} di Manajer Berkas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file, target);
                    onClose();
                  }}
                  className="bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-hard hover:-translate-y-0.5 transition-all p-2 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-28 bg-gray-100 border border-primary-dark overflow-hidden flex items-center justify-center mb-1.5">
                    {file.file_type === 'image' ? (
                      <img
                        src={`${API_BASE_URL}${file.file_url}`}
                        alt={file.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <FileText size={32} className="text-primary-dark" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[11px] truncate text-primary-dark" title={file.original_name}>
                      {file.original_name}
                    </p>
                    <span className="text-[9px] text-gray-500">{formatFileSize(file.file_size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t-2 border-primary-dark flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase border-2 border-primary-dark bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
