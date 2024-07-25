import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaHome, FaPowerOff, FaBell, FaArrowLeft } from 'react-icons/fa';
import './Navigation.css';
import axios from 'axios';

interface GuestRecord {
  detected_face: string;
  check_in_time?: string;
  guestfrom?: string;
  purpose_of_visit?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
}

const Approval = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [guestData, setGuestData] = useState<GuestRecord[] | null>(null);

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

  const fetchEmployeeData = async (userid: string) => {
    try {
      console.log(userid);
      const response = await axios.post(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/guest_requests?user_id=${userid}`);
      setGuestData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Error fetching data. Please try again later.');
    }
  };

  useEffect(() => {
    const getUserID = async () => {
      const userid = await AsyncStorage.getItem('user_id');
      if (userid) {
        fetchEmployeeData(userid);
        console.log('User ID found!!');
        console.log(userid);
      } else {
        setError('User ID not found. Please log in again.');
      }
    };
    getUserID();
  }, []);

  useEffect(() => {
    if (guestData) {
      console.log('Fetched Guest Data:', guestData);
    }
  }, [guestData]);

  return (
    <div>
      <div style={styles.modalScrollContainer}>
       
        {guestData && guestData.map((guest, index) => (
          <div key={index} style={styles.guestContainer}>
             <div style={styles.modalHeader}>
        <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${guest.detected_face}` }}
                />
        </div>
            <p style={styles.guestText}><strong>Name:</strong> {guest.first_name} {guest.last_name}</p>
            <p style={styles.guestText}><strong>Email:</strong> {guest.email}</p>
            <p style={styles.guestText}><strong>Contact:</strong> {guest.contact}</p>
            <p style={styles.guestText}><strong>Check-in Time:</strong> {guest.check_in_time}</p>
            <p style={styles.guestText}><strong>Guest From:</strong> {guest.guestfrom}</p>
            <p style={styles.guestText}><strong>Purpose of Visit:</strong> {guest.purpose_of_visit}</p>
          </div>
        ))}
      </div>
      <div className="footer">
        <FaBell className="footer-icon" />
        <FaHome className="footer-icon" onClick={() => navigate('/Visitors')}/>
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
      
    </div>
  );
};

const styles = {
  modalScrollContainer: {
    padding: 20,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
  },
  guestContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f7f5f5d2',
    borderRadius: 8,
  },
  guestText: {
    fontSize: 16,
    marginBottom: 5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderTop: '1px solid #ccc',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    
  },
};

export default Approval;
