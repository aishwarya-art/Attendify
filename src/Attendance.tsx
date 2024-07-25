import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import './Dashboard.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Navigation from './Navigation';
import { FaPhone, FaHome, FaPowerOff } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const events = [
  {
    title: 'Meeting with HR',
    start: new Date(),
    end: new Date(),
  },
  {
    title: 'Project Deadline',
    start: new Date(),
    end: new Date(),
  },
];

const Attendance: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="attendance-container" style={{}}>
        <h2 className="title">Attendance Calendar</h2>
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, width: '100%' }}
          />
        </div>
      </div>
      <div className="footer">
        <FaPhone className="footer-icon" />
        <FaHome className="footer-icon" />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Attendance;
