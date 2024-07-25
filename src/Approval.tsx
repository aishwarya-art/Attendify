import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone,FaCalendarAlt,FaClock, FaHome, FaPowerOff, FaBell, FaArrowLeft } from 'react-icons/fa';
// import './Navigation.css';
import { BiTimeFive, BiTime } from 'react-icons/bi';
import axios from 'axios';
import Navigation_Emp from './Navigation_Emp';
interface GuestRecord {
  id: string;
  detected_face: string;
  check_in_time?: string;
  guestfrom?: string;
  purpose_of_visit?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  guest_photo?:string;
}

const Approval = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [guestData, setGuestData] = useState<GuestRecord[] | null>(null);
  const [username, setUsername] = useState<string | null>(null);

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
      const username = await AsyncStorage.getItem('username');
      setUsername(username); 
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

  const handleAccept = (id: string) => {
    axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/update_status/${id}/${'1'}`)
      .then(response => {
        alert(response.data.message);
        setGuestData(guestData?.filter(d => d.id !== id) || null);
        navigate('/Dashboard_Emp');
      })
      .catch(error => console.error('Error updating data:', error));
  };

  const handleReject = (id: string) => {
    axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/update_status/${id}/${'2'}`)
      .then(response => {
        alert(response.data.message);
        setGuestData(guestData?.filter(d => d.id !== id) || null);
        navigate('/Dashboard_Emp');
      })
      .catch(error => console.error('Error updating data:', error));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB');
  };

  return (
    <div>
      <Navigation_Emp />
      <div style={styles.modalScrollContainer}>
       {/* Display username here */}
        {guestData && guestData.length > 0 ? (
          guestData.map((guest, index) => (
            <View style={styles.card}>
            <div key={index} style={styles.guestContainer}>
            <View style={styles.statsContainer}>
              {guest.check_in_time && (
                <>

                  <p style={styles.guestText}> <strong>{formatDate(guest.check_in_time)} </strong></p>
                  
                </>
              )}
               {guest.check_in_time && (
                <>

{/* <BiTime /> */}
                  <p style={styles.guestTime}> {formatTime(guest.check_in_time)} </p>
                </>
              )}
              </View>
              <div style={styles.modalHeader}>
              <View style={styles.statsContainer}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${guest.guest_photo}` }}
                />

<p style={styles.guestHeading}><strong>Hello {username} !!</strong><br></br>{guest.first_name} {guest.last_name} from {guest.guestfrom} is here to meet you.<br></br> {guest.contact}</p>
                  </View>
              </div>
             
              {guest.check_in_time && (
                <>

                  {/* <p style={styles.guestText}><strong> {formatDate(guest.check_in_time)} </strong></p> */}
                  
                </>
              )}
              {/* <p style={styles.guestText}>{guest.first_name} {guest.last_name} from {guest.guestfrom} is here to meet you.</p> */}
              {/* <p style={styles.guestText}> {guest.contact}</p> */}
              {/* <p style={styles.guestText}> {guest.email}</p> */}
              {guest.check_in_time && (
                <>

                
                  {/* <p style={styles.guestTime}>Clock-In: {formatTime(guest.check_in_time)} </p> */}
                </>
              )}
              {/* <p style={styles.guestText}><strong>Check-in Time:</strong> {guest.check_in_time}</p>
              <p style={styles.guestText}><strong>Guest From:</strong> </p>
              <p style={styles.guestText}><strong>Purpose of Visit:</strong> {guest.purpose_of_visit}</p> */}
              <div style={styles.buttonContainer}>
              <button style={styles.buttonReject} onClick={() => handleReject(guest.id)}>Reject</button>
                <button style={styles.button} onClick={() => handleAccept(guest.id)}>Accept</button>
               
              </div>
            </div>
            </View>
          ))
        ) : (
          <View style={styles.card1}>
          {/* <div style={styles.noVisitorsCard}> */}
            <p>No visitors today!</p>
          {/* </div> */}
          </View>
        )}
      </div>
      <div className="footer">
        <FaBell className="footer-icon" />
        <FaHome className="footer-icon" onClick={() => navigate('/Dashboard_Emp')}/>
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  );
};

const styles = {
  modalScrollContainer: {
    padding: 16,
    marginTop: 0,
flex:1,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
    borderTopWidth: 0.7,
    borderTopColor: '#c9c9c9',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Change this to a number
  },
  guestHeading: {
    textAlign: 'left' as 'left',
    fontSize: 16,
    marginBottom: 5,
  },
  guestTime: {
    textAlign: 'right' as 'right',
    fontSize: 16,
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
 width:'100%',
   
  },
  guestContainer: {
  
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Adjust horizontal and vertical offset
    shadowOpacity: 0.3, // Increase opacity for a more pronounced shadow
    shadowRadius: 8, // Increase radius for a softer shadow
    elevation: 5, // Increase elevation for Android devices
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    textAlign: 'center' as 'center',
    marginTop:0,
    marginBottom:16,
  },
  card1: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    textAlign: 'center' as 'center',
    marginTop:0,
  },
  guestText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    width:'48%',
  },
  buttonReject: {
    padding: 10,
    backgroundColor: 'rgb(189 7 7)',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    width:'48%',
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
    textAlign: 'center' as 'center',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Change this to a number
    marginRight: 15,
    // marginTop: -50,
    marginTop:10,
    border: '3px solid green',
  },
  noVisitorsCard: {
    padding: 20,
    backgroundColor: '#f7f5f5d2',
    borderRadius: 8,
    textAlign: 'center' as 'center',
    fontSize: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default Approval;
