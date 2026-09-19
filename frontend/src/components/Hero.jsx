import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero({ location, slides, animationType = 'fade' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback slide if empty
  const defaultSlides = [
    {
      id: 'default',
      image_url: '', // Empty means fallback to solid color
      title: 'SELAMAT DATANG DI WEBSITE KKN VIDYA VARDHANA',
      subtitle: 'Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan.'
    }
  ];

  const displaySlides = slides && slides.length > 0 ? slides : defaultSlides;

  // Auto slide effect
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setDirection(1); // Auto slide is always moving forward
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 10000); // 10 seconds per slide
    
    return () => clearInterval(interval);
  }, [displaySlides.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  // Animation variants
  const variants = {
    enter: (direction) => {
      if (animationType === 'fade') {
        return { opacity: 0 };
      }
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      if (animationType === 'fade') {
        return { opacity: 0, zIndex: 0 };
      }
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  // Direction state to determine slide direction
  const [direction, setDirection] = useState(1);

  const changeSlide = (newIndex) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  const currentSlide = displaySlides[currentIndex];

  return (
    <section className="relative h-[85vh] min-h-[600px] bg-primary text-white border-b-8 border-accent overflow-hidden flex items-center group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image / Solid Fallback */}
          {currentSlide.image_url ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentSlide.image_url})` }}
              ></div>
              {/* Overlay agar teks tetap terbaca */}
              <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-transparent"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-primary">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full mix-blend-multiply opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent rounded-full mix-blend-multiply opacity-20 -ml-20 -mb-20"></div>
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-bold px-3 py-1 text-sm border-2 border-primary-dark mb-6 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <MapPin size={16} /> {location}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase leading-tight drop-shadow-md max-w-4xl">
                {currentSlide.title || ''}
              </h1>
              
              {currentSlide.subtitle && (
                <p className="text-lg md:text-xl max-w-2xl mb-8 font-medium border-l-4 border-yellow-400 pl-4 drop-shadow-md">
                  {currentSlide.subtitle}
                </p>
              )}
              
              <a href="#berita" className="bg-gradient-green text-white font-black py-3 px-8 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 uppercase tracking-wide">
                Jelajahi Program <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (Visible on Hover) */}
      {displaySlides.length > 1 && (
        <>
          <button 
            onClick={() => {
              setDirection(-1);
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white text-primary-dark border-2 border-primary-dark opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => {
              setDirection(1);
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-primary-dark border-2 border-primary-dark opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {displaySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => changeSlide(idx)}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
                  idx === currentIndex ? 'bg-yellow-400 scale-125' : 'bg-transparent hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
