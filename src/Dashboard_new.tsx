import React from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard_Rec';
import Navigation from './Navigation';
import { FaThLarge, FaClock, FaUsers, FaPhone, FaHome, FaPowerOff } from 'react-icons/fa';

// Register the elements, controllers, scales, and plugins
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard_new: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  const data = {
    labels: ['Present', 'Absent', 'Leaves', 'Visitors'],
    datasets: [
      {
        label: 'Attendance',
        data: [28, 7, 6, 5],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div>
      <Navigation />
      <div className="card-container_new">
        <h2 className="title_new">Dashboard</h2>
        <div className="card1" onClick={() => navigate('/Dashboard_new')}>
          <FaThLarge className="card-icon1" />
          <p className="card-text">Total Visitors</p>
        </div>
        <div className="card1" onClick={() => navigate('/attendance')}>
          <FaClock className="card-icon1" />
          <p className="card-text">Total Employees</p>
        </div>
        
        </div>
        <div className="card-container_new">
        <h2 className="title_new">Action Required</h2>
        <div className="card1" onClick={() => navigate('/visitors')}>
          <FaUsers className="card-icon1" />
          <p className="card-text">Visitors</p>
        </div>
        </div>
        <div className="card-container_new">
       
          {/* <div className="chart"> */}
            <Doughnut data={data} options={options} />
          {/* </div> */}
         
        </div>
      
      <div className="footer">
        <FaPhone className="footer-icon" />
        <FaHome className="footer-icon" />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Dashboard_new;
