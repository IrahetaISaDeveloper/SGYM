// src/components/AccessCalendar.jsx
import React from 'react';
import { Calendar as CalendarIcon, Flame } from 'lucide-react';

const AccessCalendar = ({ logs }) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create a set of days the user accessed the gym this month
  const activeDays = new Set(
    logs.map(log => {
      const d = new Date(log.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        return d.getDate();
      }
      return null;
    }).filter(Boolean)
  );

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const days = [];
  // Empty slots for days before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }
  
  // The actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === currentDate.getDate();
    const hasAccess = activeDays.has(i);
    
    let className = "text-center py-2 rounded-lg text-sm flex items-center justify-center ";
    
    if (hasAccess) {
      className += "bg-neon-green text-gym-darker font-bold shadow-[0_0_10px_rgba(204,255,0,0.3)] ";
    } else if (isToday) {
      className += "border-2 border-slate-600 text-white font-bold ";
    } else {
      className += "text-slate-400 hover:bg-slate-800 ";
    }

    days.push(
      <div key={i} className={className}>
        {i}
      </div>
    );
  }

  // Calculate a simple total visits this month
  const totalVisits = activeDays.size;

  return (
    <div className="bg-gym-card rounded-2xl p-6 mt-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800">
            <CalendarIcon className="h-5 w-5 text-neon-green" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Tu Actividad</h3>
            <p className="text-sm text-slate-400">{monthNames[month]} {year}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="h-5 w-5" />
            <span className="font-bold text-lg">{totalVisits}</span>
          </div>
          <span className="text-xs text-slate-500">visitas este mes</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default AccessCalendar;
