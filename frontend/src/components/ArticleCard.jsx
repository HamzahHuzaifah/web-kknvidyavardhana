import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify'; // To safely render the rich text preview if needed

export default function ArticleCard({ article, baseUrl = 'http://localhost:5000' }) {
  // Simple utility to strip HTML tags from Rich Text content for preview
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = DOMPurify.sanitize(html);
    return tmp.textContent || tmp.innerText || "";
  };

  const previewText = article.content ? stripHtml(article.content) : '';

  return (
    <article className="bg-white border-2 border-primary shadow-hard hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(30,58,138,1)] transition-all flex flex-col h-full">
      {article.image_url ? (
        <div className="h-48 border-b-2 border-primary overflow-hidden relative group">
          <img 
            src={`${baseUrl}${article.image_url}`} 
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
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-accent-dark uppercase tracking-wider">
            {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {article.category && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 border border-primary-dark bg-yellow-200 text-primary-dark">
              {article.category}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-gray-600 mb-6 line-clamp-3 font-medium text-xs leading-relaxed flex-grow">
          {previewText}
        </p>
        <Link to="/berita" className="inline-flex items-center font-bold text-primary-dark hover:text-secondary-dark transition-colors mt-auto text-xs uppercase tracking-wider group">
          Baca Selengkapnya 
          <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
