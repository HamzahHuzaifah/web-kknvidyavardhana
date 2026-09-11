import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, MapPin } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4 border-b-8 border-accent relative overflow-hidden">
        {/* Abstract background shape for flat design */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full mix-blend-multiply opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent rounded-full mix-blend-multiply opacity-20 -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary font-bold px-3 py-1 text-sm border-2 border-primary mb-6 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <MapPin size={16} /> Desa Ciasihan, Pamijahan
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight uppercase leading-tight">
            Selamat Datang di <br /> <span className="text-secondary">Portal KKN</span> <br /> Vidya Vardhana
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 font-light border-l-4 border-secondary pl-4">
            Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan.
          </p>
          <a href="#berita" className="bg-accent hover:bg-green-700 text-white font-bold py-3 px-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 uppercase tracking-wide">
            Jelajahi Program <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* News / Articles Section */}
      <section id="berita" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-12 border-b-4 border-primary pb-4">
          <h2 className="text-4xl font-bold text-primary uppercase">Berita & Kegiatan</h2>
          <span className="text-primary font-bold bg-secondary px-4 py-1 border-2 border-primary hidden sm:block shadow-hard">
            Update Terbaru
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-secondary rounded-full"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white p-8 border-2 border-primary shadow-hard text-center">
            <p className="text-gray-600 font-medium">Belum ada artikel yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white border-2 border-primary shadow-hard hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(30,58,138,1)] transition-all flex flex-col h-full">
                {article.image_url ? (
                  <div className="h-48 border-b-2 border-primary overflow-hidden relative group">
                    <img 
                      src={`http://localhost:5000${article.image_url}`} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 border-b-2 border-primary bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 font-medium">No Image</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-bold text-accent mb-3 uppercase tracking-wider">
                    {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 font-light text-sm flex-grow">
                    {article.content}
                  </p>
                  <a href={`/artikel/${article.slug}`} className="inline-flex items-center font-bold text-primary hover:text-accent transition-colors mt-auto group">
                    Baca Selengkapnya 
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
