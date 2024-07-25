import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPowerOff } from 'react-icons/fa';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

import './Navigation.css';
import './Dashboard.css';
import axios from 'axios';
interface UserProfile {
  code: string;
  username: string;
  last_name: string;
  employee_code: string;
  departmentname: string;
  profile: string;
  email: string;

}
const Navigation = () => {
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
  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };
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
      <View>
    {currentUser.profile ? (
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: `https://dev.techkshetra.ai/office_webApi/public/photos/${currentUser.profile}` }} 
          style={styles.avatarImage} 
        />
        <Text style={styles.username}>{currentUser.username}</Text>
      </View>
    ) : (
      <Text style={styles.username}>{currentUser.username}</Text>
    )}
  </View>
      <div className="menu-icon" onClick={handleShowNavbar}>
        ☰
      </div>
      <div className={`nav-elements ${showNavbar && 'active'}`}>
        <ul>
          <li>
            <NavLink to="/Visitors">Home</NavLink>
          </li>
         
          <li>
            <NavLink to="/GuestsNew">Visitors</NavLink>
          </li>
        
          <li>
            <NavLink to="/contact">Profile</NavLink>
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
    width: 35,
    height: 35,
    borderRadius: 20, // Adjust to match half of width/height for a circular image
    marginRight: 10, // Space between image and text
  },
  username: {
fontSize:16,
fontWeight:'bold',

  },
});
export default Navigation;
