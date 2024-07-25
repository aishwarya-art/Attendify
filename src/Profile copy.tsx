import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Button, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaHome, FaPowerOff, FaBell, FaRegClock, FaArrowLeft, FaArrowRight, FaPhone, FaEnvelope } from 'react-icons/fa';

import Navigation_Emp from './Navigation_Emp';
import './Main.css';

const Profile: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({
    username: '',
    employee_code: '',
    departmentname: '',
    profile: '',
    email: '',
    contact: ''
  });
  useEffect(() => {
    const getUserID = async () => {
      const userid = await AsyncStorage.getItem('employe_code');
      const username = await AsyncStorage.getItem('username');
      const departmentname = await AsyncStorage.getItem('departmentname');
      const profile = await AsyncStorage.getItem('profile');
      const contact = await AsyncStorage.getItem('contact');
      const email = await AsyncStorage.getItem('email');


      if (userid && username && departmentname && profile && contact && email) {
        setCurrentUser({ username, employee_code: userid, departmentname, profile, contact, email });

      } else {
        setError('User details not found. Please log in again.');
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
    <div>
      <Navigation_Emp />
      <View style={styles.container}>

        <View style={styles.card}>
          <ImageBackground source={{ uri: 'https://i0.wp.com/backgroundabstract.com/wp-content/uploads/edd/2022/04/223-01-1-e1655933258298.jpg' }} style={styles.cardTopBackground}>
            <View style={styles.cardAvatar}>
              {currentUser.profile ? (
                <Image source={{ uri: `https://dev.techkshetra.ai/office_webApi/public/photos/${currentUser.profile}` }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.placeholderAvatarText}>{currentUser.username.charAt(0).toUpperCase()}</Text>
              )}
            </View>

          </ImageBackground>
          <View style={styles.cardBottom}>
            <Text style={styles.cardTitle}>{currentUser.username}</Text>
            <Text style={styles.cardSubtitle}>{currentUser.departmentname}</Text>
            <Text style={styles.cardSubtitle}> {currentUser.email}</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Reporting To</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Date of Joining</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Shift </Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Date of birth</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Blood group</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Emergency Contact</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>{currentUser.contact}</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Personal Email</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Address</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Current Password</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>New Password</Text>
          </View>
        </View>
        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <Text style={styles.infoText}>Confirm Password</Text>
          </View>
        </View>
      </View>

      <div className="footer">
        <FaBell className="footer-icon" />
        <FaHome className="footer-icon" onClick={() => navigate('/Dashboard_Emp')} />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  ); 
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom:80,
  },
  employeeDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    color: '#fff',
  },
  detailsText: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 15,
    // marginBottom: 5,
    color: 'black',

  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 20,
  },
  card: {
    position: 'relative',
    width: '100%',
    height: 240,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff', // Adjust the background color
    // padding: 16,
    left: '0.5%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopBackground: {
    height: '70%',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottom: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: 0,
  },
  cardImg: {
    height: 192,
    width: '100%',
    borderRadius: 20,
  },
  cardAvatar: {
    position: 'absolute',
    width: 114,
    height: 114,
    backgroundColor: '#fff',
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
    top: '25%',
    // marginTop: -57,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatarText: {
    fontSize: 50,
    color: '#000',
  },
  cardTitle: {
    // marginTop: 80,

    color: '#000',
    top: '-30%',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    // marginTop: 10,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#675358',
    top: '-30%',
  },
  cardWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  cardBtn: {
    width: 76,
    height: 31,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    fontWeight: '700',
    fontSize: 11,
    color: '#000',
    backgroundColor: '#fff',
    textTransform: 'uppercase',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBtnSolid: {
    backgroundColor: '#000',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  footerIcon: {
    fontSize: 24,
    color: '#333',
  },
});

export default Profile;