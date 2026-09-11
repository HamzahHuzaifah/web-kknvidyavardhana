import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  BookOpen, 
  Search, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  UploadCloud, 
  X, 
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'berita' | 'publikasi' | 'modul'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/articles';
      if (categoryFilter !== 'all') {
        url += `?category=${categoryFilter}`;
      }
      const response = await axios.get(url);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.author_name && item.author_name.toLowerCase().includes(query))
    );
  });

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'publikasi':
        return 'bg-gradient-green text-white';
      case 'modul':
        return 'bg-gradient-yellow text-primary-dark';
      case 'berita':
      default:
        return 'bg-gradient-blue text-white';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'publikasi':
        return '📑 Publikasi';
      case 'modul':
        return '📚 Modul & Buku Saku';
      case 'berita':
      default:
        return '📰 Berita KKN';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 space-y-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Title with Upload Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-primary-dark pb-6">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Portal Berita, Publikasi & Modul
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="text-secondary-dark shrink-0" size={42} /> 
              Publikasi & Dokumen
            </h1>
          </div>

          {token && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-5 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start md:self-auto"
            >
              <UploadCloud size={18} /> Upload Berita / Modul
            </Link>
          )}
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                categoryFilter === 'all'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              Semua ({articles.length})
            </button>

            <button
              onClick={() => setCategoryFilter('berita')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                categoryFilter === 'berita'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              📰 Berita
            </button>

            <button
              onClick={() => setCategoryFilter('publikasi')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                categoryFilter === 'publikasi'
                  ? 'bg-gradient-green text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              📑 Publikasi
            </button>

            <button
              onClick={() => setCategoryFilter('modul')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                categoryFilter === 'modul'
                  ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              📚 Modul & Buku Saku
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul postingan..."
              className="w-full border-2 border-primary-dark pl-9 pr-3 py-2 text-xs font-medium focus:border-secondary-dark outline-none bg-gray-50"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="p-8 text-center bg-white border-2 border-primary-dark font-bold text-primary-dark uppercase animate-pulse">
            Memuat postingan...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white border-2 border-primary-dark shadow-hard p-12 text-center">
            <p className="text-gray-500 font-medium italic">
              Tidak ada konten ditemukan untuk kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-primary-dark shadow-hard flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-transform"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-video w-full border-b-2 border-primary-dark bg-gray-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-blue flex items-center justify-center text-white">
                        <FileText size={48} className="opacity-40" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getCategoryBadge(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>

                  {/* Metadata & Title */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-secondary-dark" />
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-secondary-dark" />
                        {item.author_name || 'Tim KKN'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-primary-dark uppercase tracking-tight line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <div 
                      className="text-xs text-gray-600 font-medium line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedArticle(item)}
                    className="inline-flex items-center gap-1 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    Baca Detail <ChevronRight size={14} />
                  </button>

                  {item.file_url && (
                    <a
                      href={`http://localhost:5000${item.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-gradient-green text-white font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                      title="Unduh Dokumen / Modul"
                    >
                      <Download size={14} /> Unduh
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DETAIL BACA ARTIKEL / MODUL */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-4 border-primary-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X size={18} />
              </button>

              <div className="space-y-4">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 border border-primary-dark inline-block ${getCategoryBadge(selectedArticle.category)}`}>
                  {getCategoryLabel(selectedArticle.category)}
                </span>

                <h2 className="text-2xl md:text-3xl font-black text-primary-dark uppercase tracking-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-bold border-b-2 border-gray-200 pb-3">
                  <span>Oleh: {selectedArticle.author_name || 'Tim KKN'}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.created_at).toLocaleString('id-ID')}</span>
                </div>

                {selectedArticle.image_url && (
                  <div className="border-2 border-primary-dark overflow-hidden">
                    <img
                      src={`http://localhost:5000${selectedArticle.image_url}`}
                      alt={selectedArticle.title}
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                )}

                {/* Rich HTML Content */}
                <div
                  className="prose max-w-none text-sm text-gray-800 font-medium leading-relaxed pt-2"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedArticle.content) }}
                />

                {/* Download Document Attachment if Available */}
                {selectedArticle.file_url && (
                  <div className="p-4 bg-yellow-50 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4 mt-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-primary-dark">
                        Lampiran File Modul / Publikasi
                      </h4>
                      <p className="text-[11px] text-gray-600 font-medium">
                        Tersedia berkas panduan/dokumen untuk diunduh dan dipelajari.
                      </p>
                    </div>

                    <a
                      href={`http://localhost:5000${selectedArticle.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gradient-green text-white font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all shrink-0"
                    >
                      <Download size={16} /> Unduh Berkas
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
