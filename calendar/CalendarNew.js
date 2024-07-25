import React, { useState, useEffect } from 'react';
import './calendar.css';

const Calendar = ({ onDateClick, selectedDate }) => {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    generateDaysInMonth(year, month);
  }, [year, month]);

  const generateDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const today = new Date();

    const firstDayOfWeek = date.getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    setDaysInMonth(days);
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (month < today.getMonth() || year < today.getFullYear()) {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  const getStatusForDate = (date) => {
    if (!date) return '';
    return 'absent';
  };

  const handleDateClick = (date) => {
    const today = new Date();
    if (date <= today) {
      onDateClick(date);
    }
  };

  return (
    <div className="calendar-container shadow-sm border-0 col-12">
      <div className="calendar-header">
        <button className="btn btn-lg" onClick={handlePreviousMonth}>{' < '}</button>
        <h2>{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}</h2>
        {!(month === new Date().getMonth() && year === new Date().getFullYear()) && (
          <button className="btn btn-lg" onClick={handleNextMonth}>{' > '}</button>
        )}
      </div>

      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
          <div key={dayName} className="calendar-day-name">{dayName}</div>
        ))}
        {daysInMonth.map((day, index) => {
          const isSunday = day && day.getDay() === 0;
          const isToday = day && day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
          const status = getStatusForDate(day);

          if (isSunday || status === 'absent') {
            return (
              <div key={index} className={`calendar-day disabled ${isSunday ? 'sunday' : status}`}>
                <span className={`span-${status}`}></span>
                {day ? day.getDate() : ''}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`calendar-day ${status} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => day && handleDateClick(day)}
            >
              <span className={`span-${status}`}></span>
              {day ? day.getDate() : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
