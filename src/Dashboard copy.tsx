import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FaBell, FaUserCircle, FaThLarge, FaClock, FaUsers, FaHome, FaPowerOff, FaPhone } from 'react-icons/fa';

const Dashboard: React.FC = () => {
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
    <div className="dashboard-container">
      <div className="top-nav">
        <FaBell className="nav-icon" />
        <h1 className="title">Categories</h1>
        <FaUserCircle className="nav-icon" />
      </div>

      <div className="card-container">
        <div className="card" onClick={() => navigate('/dashboard')}>
          <FaThLarge className="card-icon" />
          <p>Dashboard</p>
        </div>
        <div className="card" onClick={() => navigate('/attendance')}>
          <FaClock className="card-icon" />
          <p>Employee Attendance</p>
        </div>
        <div className="card" onClick={() => navigate('/visitors')}>
          <FaUsers className="card-icon" />
          <p>Visitor Management</p>
        </div>
      </div>

      <div className="attendance-info">
        <p>Wed, 06th June</p>
        <div className="clock-in-out">
          <p><FaClock /> Clock-In: 09:30</p>
          <p><FaClock /> Clock-Out: 06:30</p>
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

export default Dashboard;
