import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import { Doughnut } from 'react-chartjs-2'; // Import Doughnut from react-chartjs-2
import Calendar from '../calendar/Calendar';
import Navigation_Emp from './Navigation_Emp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaHome, FaPowerOff, FaBell, FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiTimeFive, BiTime } from 'react-icons/bi';
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
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [workingDays, setWorkingDays] = useState(0);
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [currentUser, setCurrentUser] = useState({
    username: '',
    employee_code: '',
    departmentname: '',
    profile: '', // Assuming profile is a URL to the image
  });

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
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Attendance/get_empattendacedataMobile?userid=${userid}`);
      setEmployeeData(response.data.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Error fetching data. Please try again later.');
    }
  };

  useEffect(() => {
    const getUserID = async () => {
      const userid = await AsyncStorage.getItem('employe_code');
      const username = await AsyncStorage.getItem('username');
      const departmentname = await AsyncStorage.getItem('departmentname');
      const profile = await AsyncStorage.getItem('profile');
      if (userid && username && departmentname && profile) {
        setCurrentUser({ username, employee_code: userid, departmentname, profile });
      } else {
        // Handle case where any of the required items are not found
        setError('User details not found. Please log in again.');
      }
      if (userid) {
        fetchEmployeeData(userid);
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

  const handleImageClick = (imagePath: string) => {
    setModalImage(`https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${imagePath}`);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage('');
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateMonthlyStats = (working: number, present: number, absent: number) => {
    setWorkingDays(working);
    setPresentDays(present);
    setAbsentDays(absent);
  };

  // Prepare data for Doughnut chart
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentDays, workingDays - presentDays],
        backgroundColor: ['rgb(126 174 106)', '#FF6384'],
        hoverBackgroundColor: ['rgb(126 174 106)', '#FF6384'],
      },
    ],
  };
  const options = {
    cutout: '50%',
    plugins: {
      legend: {
        display: false
      }
    }
  };

 
    const isCurrentDate = selectedDate && currentTime.toDateString() === selectedDate.toDateString();
    const isAfter630PM = currentTime.getHours() > 18 || (currentTime.getHours() === 18 && currentTime.getMinutes() >= 30);
  return (
    <div>
      <Navigation_Emp />
      <View style={styles.container}>
        <View style={styles.employeeDetailsCard}>
          {currentUser.profile ? (
            <Image source={{ uri: `https://dev.techkshetra.ai/office_webApi/public/photos/${currentUser.profile}` }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{currentUser.username.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.detailsText}>
            <Text style={styles.usernameText}>{currentUser.username}</Text>
            <Text style={styles.infoText}> {currentUser.departmentname}</Text>
            
          </View>
          <View style={styles.donutContainer}>
            <Doughnut data={attendanceData} options={options} />
          </View>
        </View>
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
              <BiTime style={styles.icon1} />
              <Text style={styles.clockText}>09:30</Text>
            </View>
            <View style={styles.timeWrapper}>
              <FaRegClock style={styles.icon1} />
              <Text style={styles.clockText}>06:30</Text>
            </View>
          </View>
          <Text style={styles.workingHours}><b>Working Hours: 08:00 hours</b></Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statsCard_working}>
            <Text style={styles.statsHeader}>Working <Text style={styles.statsValue}>{workingDays}</Text></Text>
          </View>
          <View style={styles.statsCard_present}>
            <Text style={styles.statsHeader}>Present <Text style={styles.statsValue}>{presentDays}</Text></Text>
          </View>
          <View style={styles.statsCard_absent}>
            <Text style={styles.statsHeader}>Absent <Text style={styles.statsValue}>{absentDays}</Text></Text>
          </View>
        </View>
        <View style={styles.calendarContainer}>
          <Calendar
            attendanceData={employeeData || []}
            onDateClick={handleDateClick}
            updateStats={updateMonthlyStats}
          />
          <View style={styles.indicators}>
            <Text><View style={styles.presentIndicator} /> Present</Text>
            <Text><View style={styles.absentIndicator} /> Absent</Text>
            <Text><View style={styles.inProgressIndicator} /> In-progress</Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          {selectedDate ? (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{selectedDate.toDateString()}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardColumn}>
                  <Text><strong>Check-In</strong></Text>
                  <Text>{selectedDateData?.first_check_in ? formatTime(selectedDateData.first_check_in) : '---'}</Text>
                  {selectedDateData?.first_detected_face && (
                    <TouchableOpacity onPress={() => handleImageClick(selectedDateData.fullfirst_detected_face!)}>
                      <Image
                        style={styles.image}
                        source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedDateData.first_detected_face}` }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.cardColumn}>
                  <Text><strong>Check-Out</strong></Text>
                  {/* <Text>{selectedDateData?.last_check_in ? formatTime(selectedDateData.last_check_in) : '---'}</Text>
                  {selectedDateData?.last_detected_face && (
                    <TouchableOpacity onPress={() => handleImageClick(selectedDateData.fulllast_detected_face!)}>
                      <Image
                        style={styles.image}
                        source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedDateData.last_detected_face}` }}
                      />
                    </TouchableOpacity>
                  )} */}
                   {isCurrentDate && !isAfter630PM ? (
                <Text>---</Text>
              ) : (
                <>
                  <Text>{selectedDateData?.last_check_in ? formatTime(selectedDateData.last_check_in) : '---'}</Text>
                  {selectedDateData?.last_detected_face && (
                    <TouchableOpacity onPress={() => handleImageClick(selectedDateData.fulllast_detected_face!)}>
                      <Image
                        style={styles.image}
                        source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedDateData.last_detected_face}` }}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
            <Text>Please select a date to view details.</Text>
            </View>
          )}
        </View>
        <Modal
          visible={showModal}
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: modalImage }} style={styles.modalImage} />
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
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
  },
  employeeDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    padding: 15,
    borderRadius: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color:'gray',
  },
  attendanceInfo: {
    backgroundColor: 'rgb(212 212 237)',
    padding: 20,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    marginTop: 0,
    // marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    color:'#000',
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
    color: '#000',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  workingHours: {
    marginTop: 10,
    color: '#000',
    textAlign: 'center',
  },
  icon1: {
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  
  },
  statsCard: {
    backgroundColor: '#f7f5f5d2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsCard_present: {
    backgroundColor: 'rgb(208 223 201)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '32.1%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsCard_absent: {
    backgroundColor: 'rgb(230 205 205)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '32.1%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsCard_working: {
    backgroundColor: 'rgb(198 198 206)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '32.1%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsHeader: {
    fontSize: 12,
    // marginBottom: 8,
  },
  statsValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  calendarContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 600,
    marginHorizontal: 'auto',
    padding: 10,
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f7f5f5d2',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    borderRadius: 4,
    backgroundColor: 'green',
  },
  absentIndicator: {
    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  inProgressIndicator: {
    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: 'yellow',
  },
  detailsContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom:40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 1,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardColumn: {
    flex: 1,
    alignItems: 'center',
    marginBottom:0,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  modalImage: {
    width: 350,
    height: 200,
    marginBottom:20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  donutContainer: {
    marginLeft: 20,
    width: 60,
    height: 60,
  },
});

export default Dashboard_Emp;
