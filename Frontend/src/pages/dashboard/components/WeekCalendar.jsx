import React, { useEffect, useState } from 'react';

import { getStartOfWeek } from '../dashboardShared';

const WeekCalendar = ({ selectedDate, onDateChange, onWeekChange }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const start = new Date(date);
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    start.setDate(date.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  useEffect(() => {
    if (!selectedDate) return;
    setCurrentWeekStart(getStartOfWeek(selectedDate));
  }, [selectedDate]);

  const weekDays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

  const getSelectedOffset = () => {
    if (!selectedDate) return 0;
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const getWeekDates = () => {
    const dates = [];
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      dates.push(date);
    }
    return dates;
  };

  const prevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
    if (onWeekChange) onWeekChange(newStart);
    if (onDateChange) {
      const newSelectedDate = new Date(newStart);
      newSelectedDate.setDate(newStart.getDate() + getSelectedOffset());
      onDateChange(newSelectedDate);
    }
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    if (onWeekChange) onWeekChange(newStart);
    if (onDateChange) {
      const newSelectedDate = new Date(newStart);
      newSelectedDate.setDate(newStart.getDate() + getSelectedOffset());
      onDateChange(newSelectedDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    const start = new Date(today);
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    start.setDate(today.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
    if (onWeekChange) onWeekChange(start);
    if (onDateChange) onDateChange(today);
  };

  const weekDates = getWeekDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="week-calendar">
      <div className="week-nav">
        <button className="nav-btn" onClick={prevWeek}><i className="fas fa-chevron-left"></i> Előző hét</button>
        <button className="nav-btn today-btn" onClick={goToToday}><i className="fas fa-calendar-day"></i> Ma</button>
        <button className="nav-btn" onClick={nextWeek}>Következő hét <i className="fas fa-chevron-right"></i></button>
      </div>
      <div className="week-days-header">
        {weekDays.map((day, index) => {
          const date = weekDates[index];
          const isSelected = selectedDate && date.toDateString() === new Date(selectedDate).toDateString();
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div key={day} className={`day-header ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => onDateChange && onDateChange(date)}>
              <div className="day-name">{day}</div>
              <div className="day-date">{date.getDate()}</div>
              <div className="day-month">{date.toLocaleString('hu', { month: 'short' })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;