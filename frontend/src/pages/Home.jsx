import { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';

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
      <Hero 
        location="Desa Ciasihan, Pamijahan"
        titleLine1="Selamat Datang di"
        titleLine2="Portal KKN"
        titleLine3="Vidya Vardhana"
        description="Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan."
        ctaText="Jelajahi Program"
      />

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
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
