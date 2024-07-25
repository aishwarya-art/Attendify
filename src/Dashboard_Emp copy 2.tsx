import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Calendar from '../calendar/Calendar';
import Navigation from './Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaHome, FaPowerOff, FaBell, FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AttendanceRecord {
  attendance_date: string;
  first_check_in?: string;
  last_check_in?: string;
  first_detected_face?: string;
  fullfirst_detected_face?: string;
  last_detected_face?: string;
  fulllast_detected_face?: string;
}

const Dashboard_Emp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [employeeData, setEmployeeData] = useState<AttendanceRecord[] | null>(null);
  const [selectedDateData, setSelectedDateData] = useState<AttendanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dateString = utcDate.toISOString().split('T')[0];

    if (employeeData) {
      const dataForDate = employeeData.find(record => record.attendance_date === dateString);
      setSelectedDateData(dataForDate || null);
    }
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
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Attendance/get_empattendacedata?userid=${userid}`);
      setEmployeeData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Error fetching data. Please try again later.');
    }
  };

  useEffect(() => {
    const getUserID = async () => {
      const userid = await AsyncStorage.getItem('employe_code');
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
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Navigation />
      <View style={styles.container}>
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
        <View style={styles.calendarContainer}>
          <Calendar
            attendanceData={employeeData || []}
            onDateClick={handleDateClick}
          />
          <View style={styles.indicators}>
            <Text><View style={styles.presentIndicator} />Present</Text>
            <Text><View style={styles.absentIndicator} />Absent</Text>
            <Text><View style={styles.inProgressIndicator} />In-progress</Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          {selectedDate ? (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{selectedDate.toDateString()}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardColumn}>
                  <Text><strong>Check-in Time: </strong> {selectedDateData?.first_check_in || '---'}</Text>
                  {selectedDateData?.first_detected_face && (
                    <Image
                      style={styles.image}
                      source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedDateData.first_detected_face}` }}
                    />
                  )}
                </View>
                <View style={styles.cardColumn}>
                  <Text><strong>Check-out Time: </strong> {selectedDateData?.last_check_in || '---'}</Text>
                  {selectedDateData?.last_detected_face && (
                    <Image
                      style={styles.image}
                      source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedDateData.last_detected_face}` }}
                    />
                  )}
                </View>
              </View>
            </View>
          ) : (
            <Text>Select a date to see details.</Text>
          )}
        </View>
      </View>
      <div className="footer">
        <FaBell className="footer-icon" />
        <FaHome className="footer-icon" onClick={() => navigate('/Visitors')} />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  attendanceInfo: {
    backgroundColor: '#6c63ff',
    padding: 20,
    borderRadius: 10,
    textAlign: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 15,
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
  calendarContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 600,
    marginHorizontal: 'auto',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f7f5f5d2',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 16,
  },
  presentIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'green',
  },
  absentIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
  },
  inProgressIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'yellow',
  },
  detailsContainer: {
    flex: 1,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardColumn: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayName: {
    width: '14%',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  calendarDay: {
    width: '14%',
    alignItems: 'center',
    padding: 8,
    textAlign: 'center',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  sunday: {
    opacity: 0.5,
  },
  today: {
    backgroundColor: '#ffa',
  },
  selected: {
    borderBottomWidth: 3,
    borderBottomColor: '#0078ff',
  },
  future: {
    opacity: 0.5,
  },
  selectedDate: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  spanAbsent: {
    width: 6,
    height: 6,
    borderRadius: 50,
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44336',
  },
  spanPresent: {
    width: 6,
    height: 6,
    borderRadius: 50,
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#4CAF50',
  },
  spanInProgress: {
    width: 6,
    height: 6,
    borderRadius: 50,
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#78fbf5',
  },
  indicatorsSpan: {
    width: 6,
    height: 6,
    borderRadius: 50,
    marginRight: 4,
  },
  indicatorsP: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iPresent: {
    backgroundColor: '#4CAF50',
  },
  iAbsent: {
    backgroundColor: '#F44336',
  },
  iInProgress: {
    backgroundColor: '#78fbf5',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Dashboard_Emp;
