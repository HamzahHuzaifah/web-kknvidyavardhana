import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Pencil, 
  X, 
  FolderOpen, 
  FileText, 
  Save, 
  Download, 
  Trash2 
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import CustomSelect from '../CustomSelect';
import CustomDatePicker from '../CustomDatePicker';
import 'react-quill-new/dist/quill.snow.css';

export default function ArticlesTab({
  articlesList,
  loadingArticles,
  articleCategoryFilter,
  setArticleCategoryFilter,
  articleActionMsg,
  editingArticle,
  editArticleForm,
  setEditArticleForm,
  selectedMediaForArticle,
  setSelectedMediaForArticle,
  setEditArticleImage,
  setEditArticleDoc,
  savingArticle,
  handleSaveArticle,
  handleStartEditArticle,
  handleCancelEditArticle,
  handleDeleteArticle,
  setMediaPickerTarget,
  setShowMediaPickerModal
}) {
  return (
    <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
      <div className="border-b-2 border-primary-dark pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
            <BookOpen size={22} /> Kelola Berita, Publikasi & Modul
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            Pengubahan (edit) dan penghapusan konten hanya dapat dilakukan oleh Admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1"
          >
            <PlusCircle size={14} /> + Upload Baru
          </Link>
          <Link
            to="/berita"
            target="_blank"
            className="text-xs font-bold text-primary-dark underline hover:text-secondary-dark"
          >
            Lihat Berita Publik ↗
          </Link>
        </div>
      </div>

      {articleActionMsg.message && (
        <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
          articleActionMsg.type === 'success' 
            ? 'bg-green-50 border-accent-dark text-accent-dark' 
            : 'bg-red-50 border-red-600 text-red-600'
        }`}>
          {articleActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{articleActionMsg.message}</span>
        </div>
      )}

      {/* Form Edit Artikel / Publikasi / Modul (Jika sedang mode edit) */}
      {editingArticle && (
        <form onSubmit={handleSaveArticle} className="bg-yellow-50 border-2 border-primary-dark p-5 space-y-4 shadow-hard">
          <div className="flex items-center justify-between border-b border-primary-dark pb-2">
            <h4 className="text-sm font-black uppercase text-primary-dark flex items-center gap-1.5">
              <Pencil size={16} /> Edit Postingan: {editingArticle.title}
            </h4>
            <button
              type="button"
              onClick={handleCancelEditArticle}
              className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
            >
              <X size={14} /> Batal Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                Judul *
              </label>
              <input
                type="text"
                value={editArticleForm.title}
                onChange={(e) => setEditArticleForm({ ...editArticleForm, title: e.target.value })}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                Kategori *
              </label>
              <CustomSelect
                value={editArticleForm.category}
                onChange={(val) => setEditArticleForm({ ...editArticleForm, category: val })}
                options={[
                  { value: 'berita', label: '📰 Berita' },
                  { value: 'publikasi', label: '📑 Publikasi' },
                  { value: 'modul', label: '📚 Modul & Buku' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                Penulis & Afiliasi Kampus
              </label>
              <input
                type="text"
                value={editArticleForm.authors_meta || ''}
                onChange={(e) => setEditArticleForm({ ...editArticleForm, authors_meta: e.target.value })}
                placeholder="cth: Hamzah Huzaifah (UPN Veteran Jakarta)"
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                No. Registrasi / DOI / ISBN
              </label>
              <input
                type="text"
                value={editArticleForm.doi_or_reg || ''}
                onChange={(e) => setEditArticleForm({ ...editArticleForm, doi_or_reg: e.target.value })}
                placeholder="cth: LPPM-KKN/2026/08"
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                Kata Kunci (Keywords)
              </label>
              <input
                type="text"
                value={editArticleForm.keywords || ''}
                onChange={(e) => setEditArticleForm({ ...editArticleForm, keywords: e.target.value })}
                placeholder="cth: KKN; UMKM; Digital Marketing; Ciasihan"
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                Abstrak (Abstract) / Sinopsis
              </label>
              <textarea
                rows={2}
                value={editArticleForm.abstract || ''}
                onChange={(e) => setEditArticleForm({ ...editArticleForm, abstract: e.target.value })}
                placeholder="Ringkasan abstrak publikasi ilmiah atau sinopsis modul..."
                className="w-full border-2 border-primary-dark p-2.5 text-xs font-medium bg-white outline-none"
              />
            </div>

            {editArticleForm.category === 'publikasi' && (
              <>
                <div>
                  <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                    Volume & Issue
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editArticleForm.volume || ''}
                      onChange={(e) => setEditArticleForm({ ...editArticleForm, volume: e.target.value })}
                      placeholder="Vol"
                      className="w-1/2 border-2 border-primary-dark px-2 py-2 text-xs font-medium bg-white outline-none"
                    />
                    <input
                      type="number"
                      value={editArticleForm.issue || ''}
                      onChange={(e) => setEditArticleForm({ ...editArticleForm, issue: e.target.value })}
                      placeholder="No"
                      className="w-1/2 border-2 border-primary-dark px-2 py-2 text-xs font-medium bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                    Tanggal Publikasi Asli
                  </label>
                  <CustomDatePicker
                    value={editArticleForm.published_date || ''}
                    onChange={(val) => setEditArticleForm({ ...editArticleForm, published_date: val })}
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                    Daftar Pustaka (References)
                  </label>
                  <textarea
                    rows={3}
                    value={editArticleForm.references_list || ''}
                    onChange={(e) => setEditArticleForm({ ...editArticleForm, references_list: e.target.value })}
                    placeholder="Tuliskan daftar pustaka yang digunakan, pisahkan dengan baris baru (Enter)..."
                    className="w-full border-2 border-primary-dark p-2.5 text-xs font-medium bg-white outline-none leading-relaxed"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-primary-dark font-bold text-xs uppercase">
                  Foto Sampul Berita / Modul
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('image');
                    setShowMediaPickerModal(true);
                  }}
                  className="text-[10px] font-black uppercase bg-primary-dark text-white px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all flex items-center gap-1"
                >
                  <FolderOpen size={11} /> Pilih dari Manajer Berkas
                </button>
              </div>

              {selectedMediaForArticle.image ? (
                <div className="flex items-center gap-3 p-2 bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <img 
                    src={`${selectedMediaForArticle.image}`} 
                    alt="Sampul Terpilih" 
                    className="w-12 h-12 object-cover border border-primary-dark"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase bg-gradient-yellow px-1 border border-primary-dark inline-block mb-0.5">
                      Dari Manajer Berkas
                    </span>
                    <p className="text-xs font-mono truncate text-gray-700">{selectedMediaForArticle.image}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMediaForArticle(prev => ({ ...prev, image: null }));
                      setEditArticleForm(prev => ({ ...prev, image_url: '' }));
                    }}
                    className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                  >
                    Ganti / Hapus
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditArticleImage(e.target.files[0] || null)}
                  className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
                />
              )}
            </div>

            <div className="sm:col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-primary-dark font-bold text-xs uppercase">
                  Lampiran Dokumen / Modul (PDF/Doc/Zip)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('document');
                    setShowMediaPickerModal(true);
                  }}
                  className="text-[10px] font-black uppercase bg-primary-dark text-white px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all flex items-center gap-1"
                >
                  <FolderOpen size={11} /> Pilih dari Manajer Berkas
                </button>
              </div>

              {selectedMediaForArticle.document ? (
                <div className="flex items-center gap-3 p-2 bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-10 h-10 bg-gradient-blue text-white flex items-center justify-center font-black border border-primary-dark">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase bg-gradient-yellow px-1 border border-primary-dark inline-block mb-0.5">
                      Dokumen dari Manajer Berkas
                    </span>
                    <p className="text-xs font-mono truncate text-gray-700">{selectedMediaForArticle.document}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMediaForArticle(prev => ({ ...prev, document: null }));
                      setEditArticleForm(prev => ({ ...prev, file_url: '' }));
                    }}
                    className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                  >
                    Ganti / Hapus
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={(e) => setEditArticleDoc(e.target.files[0] || null)}
                  className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
              Isi Konten *
            </label>
            <div className="border-2 border-primary-dark bg-white">
              <ReactQuill
                theme="snow"
                value={editArticleForm.content}
                onChange={(val) => setEditArticleForm({ ...editArticleForm, content: val })}
                className="min-h-[180px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingArticle}
              className="bg-gradient-green text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
            >
              <Save size={14} /> {savingArticle ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={handleCancelEditArticle}
              className="bg-gray-200 text-primary-dark font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Filter Kategori */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        {['all', 'berita', 'publikasi', 'modul'].map((c) => (
          <button
            key={c}
            onClick={() => setArticleCategoryFilter(c)}
            className={`px-3 py-1.5 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              articleCategoryFilter === c
                ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                : 'bg-white text-primary-dark hover:bg-gray-100'
            }`}
          >
            {c === 'all' ? 'Semua' : c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabel Konten */}
      {loadingArticles ? (
        <p className="text-xs font-bold text-gray-500">Memuat data artikel...</p>
      ) : articlesList.length === 0 ? (
        <p className="text-xs font-medium text-gray-500 italic">Belum ada artikel pada kategori ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-blue text-white text-xs uppercase">
                <th className="p-2.5 border-2 border-primary-dark">Kategori</th>
                <th className="p-2.5 border-2 border-primary-dark">Judul</th>
                <th className="p-2.5 border-2 border-primary-dark">Penulis</th>
                <th className="p-2.5 border-2 border-primary-dark">Waktu</th>
                <th className="p-2.5 border-2 border-primary-dark text-center">Berkas</th>
                <th className="p-2.5 border-2 border-primary-dark text-center">Aksi (Admin)</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {articlesList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2.5 border-2 border-primary-dark">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-primary-dark ${
                      item.category === 'publikasi'
                        ? 'bg-green-100 text-green-900 border-green-800'
                        : item.category === 'modul'
                        ? 'bg-yellow-100 text-yellow-900 border-yellow-800'
                        : 'bg-blue-100 text-blue-900 border-blue-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark font-bold text-primary-dark max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark text-gray-700 font-medium">
                    {item.author_name || 'Tim KKN'}
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark text-center">
                    {item.file_url ? (
                      <a
                        href={`${item.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-dark hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Download size={12} /> Unduh
                      </a>
                    ) : (
                      <span className="text-gray-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEditArticle(item)}
                        className="p-1.5 bg-yellow-400 hover:bg-yellow-500 border border-primary-dark text-primary-dark"
                        title="Edit Konten (Hanya Admin)"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(item.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark"
                        title="Hapus Konten (Hanya Admin)"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
