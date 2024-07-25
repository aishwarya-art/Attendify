import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPowerOff } from 'react-icons/fa';

import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Dimensions } from 'react-native';
import './Navigation.css';
const Navigation_Emp = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      try {
        await AsyncStorage.clear();
        navigate('/');
      } catch (error) {
        console.error('Error clearing local storage:', error);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={'https://app.attendify.ai/logos/attendify_logo.png'} alt="Logo" className="navigation-logo" />
      </div>
      <div className="menu-icon" onClick={handleShowNavbar}>
        ☰
      </div>
      <div className={`nav-elements ${showNavbar && 'active'}`}>
        <ul>
          <li>
            <NavLink to="/Dashboard_Emp">Home</NavLink>
          </li>
          <li>
            <NavLink to="/Approval">Visitor</NavLink>
          </li>
          
          <li>
            <NavLink to="/Profile">Profile</NavLink>
          </li>
          <li>
            <span onClick={handleLogout}>
            Logout
            </span>
          </li>
        </ul>
      </div>
    </nav>
  );
};


export default Navigation_Emp;
