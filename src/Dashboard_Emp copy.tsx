import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Navigation from './Navigation'; // Import the Navigation component
import { FaPhone, FaEnvelope, FaHome, FaPowerOff, FaClock, FaArrowLeft, FaRegClock, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './Dashboard.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
const Dashboard_Emp: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
  
 
  return (
    <div>
      <Navigation />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.attendanceInfo}>
          <Text style={styles.timeText}>
            {currentTime.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })} {currentTime.toLocaleTimeString()}
          </Text>
          <View style={styles.clockInOut}>
            <View style={styles.timeWrapper}>
              <FaRegClock style={styles.icon1} />
              <Text style={styles.clockText}>09:30</Text>
            </View>
            <View style={styles.timeWrapper}>
              <FaRegClock style={styles.icon1} />
              <Text style={styles.clockText}>06:30</Text>
            </View>
          </View>
          <Text style={styles.workingHours}><b>Working Hours: 08:00 hours</b></Text>
        </View>
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
      </ScrollView>
      <div className="footer">
        <FaBell className="footer-icon"  />
        <FaHome className="footer-icon"  onClick={() => navigate('/Visitors')} />
        <FaPowerOff className="footer-icon"  onClick={handleLogout} />
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    marginTop: 0, // Added to account for the fixed navbar height
    paddingBottom: 50, // Added to account for the fixed footer height
  },
  attendanceInfo: {
    backgroundColor: '#6c63ff',
    padding: 20,
    borderRadius: 10,
    textAlign: 'center',
    width: '100%',
    marginTop: 0,
  },
  clockInOut: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockText: {
    marginLeft: 5,
    color: '#fff',
  },
  timeText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  workingHours: {
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
  },
  icon1: {
    color: '#fff',
  },
});

export default Dashboard_Emp;
