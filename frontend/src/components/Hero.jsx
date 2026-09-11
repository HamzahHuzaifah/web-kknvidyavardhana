import { ArrowRight, MapPin } from 'lucide-react';

export default function Hero({ location, titleLine1, titleLine2, titleLine3, description, ctaText }) {
  return (
    <section className="bg-primary text-white py-20 px-4 border-b-8 border-accent relative overflow-hidden">
      {/* Abstract background shape for flat design */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full mix-blend-multiply opacity-20 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent rounded-full mix-blend-multiply opacity-20 -ml-20 -mb-20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start">
        <div className="inline-flex items-center gap-2 bg-secondary text-primary font-bold px-3 py-1 text-sm border-2 border-primary mb-6 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          <MapPin size={16} /> {location}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight uppercase leading-tight">
          {titleLine1} <br /> <span className="text-secondary">{titleLine2}</span> <br /> {titleLine3}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 font-light border-l-4 border-secondary pl-4">
          {description}
        </p>
        <a href="#berita" className="bg-accent hover:bg-green-700 text-white font-bold py-3 px-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 uppercase tracking-wide">
          {ctaText} <ArrowRight size={20} />
        </a>
      </div>
    </section>
  );
}
