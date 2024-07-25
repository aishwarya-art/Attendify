import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation'; // Import the Navigation component
import { FaThLarge, FaClock, FaUsers, FaHome, FaPowerOff, FaPhone } from 'react-icons/fa';
import './Dashboard_Rec.css'; 
import './Dashboard.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard_Rec: React.FC = () => {
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
      <div className="card-container_new">
        <div className="card1" onClick={() => navigate('/Dashboard_new')}>
          <FaThLarge className="card-icon1" />
          <p className="card-text">Dashboard</p>
        </div>
        <div className="card1" onClick={() => navigate('/attendance')}>
          <FaClock className="card-icon1" />
          <p className="card-text">My Attendance</p>
        </div>
        <div className="card1" onClick={() => navigate('/visitors')}>
          <FaUsers className="card-icon1" />
          <p className="card-text">Visitor Management</p>
        </div>
      </div>
      <div className="attendance-info">
        <p>Wed, 06th June</p>
        <div className="clock-in-out">
          <p><FaClock />  Clock-In: 09:30</p>
          <p><FaClock />  Clock-Out: 06:30</p>
        </div>
        <p>Working Hours: 08:00 hours</p>
      </div>
      <div className="footer">
        <FaPhone className="footer-icon" />
        <FaHome className="footer-icon" />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Dashboard_Rec;
