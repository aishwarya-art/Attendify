import React, { useState, useEffect, useRef } from 'react';
import { NavLink,Link, useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPowerOff } from 'react-icons/fa';
import axios from 'axios';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Dimensions } from 'react-native';
import './Navigation.css';

interface UserProfile {
  code: string;
  username: string;
  last_name: string;
  employee_code: string;
  departmentname: string;
  profile: string;
  email: string;

}

const Navigation_Emp = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    code: '',
    username: '',
    last_name: '',
    employee_code: '',
    departmentname: '',
    profile: '',
    email: '',
    
  });


  useEffect(() => {
    const getUserID = async () => {
      try {
        const userid = await AsyncStorage.getItem('user_id');
        console.log('userid', userid);

        if (!userid) {
          console.log('User ID not found. Please log in again.');
          return;
        }
        const formData = new FormData();
        formData.append('userid', userid);
        const response = await axios.post(`https://dev.techkshetra.ai/office_webApi/public/index.php/Dashboard/profile_details`,
          formData, {
            headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" }
          });

        console.log('Response data:', response.data);

        if (response.status === 200 && response.data.status) {
          const data = response.data;
          console.log('Fetched user details:', data);
          setCurrentUser({
            code: data.code,
            username: data.username,
            last_name: data.last_name,
            employee_code: data.code,
            departmentname: data.department_name,
            profile: data.user_profile,
            email: data.email,
           
          });
         
        } else {
          console.log(response.data.message || 'User details not found. Please log in again.');
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    };

    getUserID();
  }, []);
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
      {currentUser.profile ? (
     
     <Link to="/Profile">
     <Image 
       source={{ uri: `https://dev.techkshetra.ai/office_webApi/public/photos/${currentUser.profile}` }} 
       style={styles.avatarImage} 
     />
   </Link>
      
   
    ) : (
      <Text style={styles.username}>{currentUser.username}</Text>
    )}
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
const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Adjust to match half of width/height for a circular image
    marginRight: 10, // Space between image and text
  },
  username: {
fontSize:16,
fontWeight:'bold',

  },
});

export default Navigation_Emp;
