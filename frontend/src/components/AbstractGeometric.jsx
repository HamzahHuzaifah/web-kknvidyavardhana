import React from 'react';

export default function AbstractGeometric({ className = '', opacity = 'opacity-10' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${opacity} ${className}`}>
      <svg 
        className="w-full h-full object-cover" 
        viewBox="0 0 500 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin slice"
      >
        <circle cx="480" cy="180" r="200" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="480" cy="180" r="260" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="480" cy="180" r="320" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="480" cy="180" r="380" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="480" cy="180" r="440" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
