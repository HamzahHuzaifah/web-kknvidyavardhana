import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = 'Pilih Tanggal', 
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // If value exists, use it, else default to today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  // 0 = Sunday, 1 = Monday...
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day) => {
    // Construct local date without timezone shift issues
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayStr}`;
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

  // Format value for display
  const displayValue = value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : placeholder;

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      let isSelected = false;
      if (value) {
        const valDate = new Date(value);
        isSelected = valDate.getDate() === d && valDate.getMonth() === currentMonth.getMonth() && valDate.getFullYear() === currentMonth.getFullYear();
      }
      
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(d)}
          className={`p-1.5 text-xs font-black transition-all ${
            isSelected
              ? 'bg-gradient-yellow border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 text-primary-dark'
              : 'border-2 border-transparent text-gray-700 hover:border-primary-dark hover:bg-yellow-50'
          }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-2 border-primary-dark p-2 text-xs bg-white outline-none focus:bg-yellow-50 font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none text-left"
      >
        <span className="truncate text-primary-dark">
          {displayValue}
        </span>
        <CalendarIcon size={14} className="text-primary-dark" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[260px] bg-white border-4 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 left-0">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b-2 border-primary-dark pb-2">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gradient-yellow border-2 border-transparent hover:border-primary-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <ChevronLeft size={16} className="text-primary-dark" />
            </button>
            <div className="text-xs font-black uppercase text-primary-dark">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gradient-yellow border-2 border-transparent hover:border-primary-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <ChevronRight size={16} className="text-primary-dark" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map(day => (
              <div key={day} className="text-[10px] font-black text-gray-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-2 border-t-2 border-dashed border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateClick(today.getDate());
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              className="text-[10px] font-black uppercase text-accent-dark hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[10px] font-black uppercase text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
