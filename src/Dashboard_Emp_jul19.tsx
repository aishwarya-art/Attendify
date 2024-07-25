import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { Doughnut } from 'react-chartjs-2';
import Calendar from '../calendar/Calendar';
import Navigation_Emp from './Navigation_Emp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaHome, FaPowerOff, FaBell, FaRegClock, FaArrowLeft,FaChevronRight, FaChevronLeft, FaArrowRight } from 'react-icons/fa';
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

interface HolidayRecord {
  date: string;
  name: string;
}

const Dashboard_Emp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
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
  const [holidayDays, setHolidayDays] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // getMonth() returns month index (0-11), so adding 1
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);

  const [currentUser, setCurrentUser] = useState({
    username: '',
    employee_code: '',
    departmentname: '',
    profile: '',
  });
  const [attendanceInfo, setAttendanceInfo] = useState({
    checkIn: '09:30',
    checkOut: '06:30',
    workingHours: '08:00',
    status: '',
    statusNew:'',
  });

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dateString = utcDate.toISOString().split('T')[0];
    
    if (employeeData) {
      const dataForDate = employeeData.find(record => record.attendance_date === dateString);
      setSelectedDateData(dataForDate || null);

      if (dataForDate) {
        const checkIn = dataForDate.first_check_in ? formatTime(dataForDate.first_check_in) : '---';
        const checkOut = dataForDate.last_check_in ? formatTime(dataForDate.last_check_in) : '---';
        const workingHours = dataForDate.first_check_in && dataForDate.last_check_in ? calculateWorkingHours(dataForDate.first_check_in, dataForDate.last_check_in) : '---';
        setAttendanceInfo({
          checkIn,
          checkOut,
          workingHours,
          status: 'Present',
          statusNew:'Present',
        });
      } else {
        const holiday = holidays.find(holiday => holiday.date === dateString);
        if (holiday) {
          setAttendanceInfo({
            checkIn: '---',
            checkOut: '---',
            workingHours: '',
            status: holiday.name,
            statusNew:'Holiday',
          });
        } else if (date.getDay() === 0) {
          setAttendanceInfo({
            checkIn: '---',
            checkOut: '---',
            workingHours: '',
            status: 'Sunday Holiday',
            statusNew: 'Sunday Holiday',
          });
        } else {
          setAttendanceInfo({
            checkIn: '---',
            checkOut: '---',
            workingHours: '',
            status: 'Absent',
            statusNew: 'Absent',
          });
        }
      }
    }

    if (date.getMonth() + 1 !== month || date.getFullYear() !== year) {
      setMonth(date.getMonth() + 1);
      setYear(date.getFullYear());
    }
    
    // Fetch holidays for the new month
    await fetchHolidays(date.getFullYear(), date.getMonth() + 1);
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

  const fetchHolidays = async (year: number, month: number) => {
    const user_id = await AsyncStorage.getItem('cid');
    const deptID = await AsyncStorage.getItem('department');
    try {
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Setting/get_daysholiday?user_id=${user_id}`, {
        params: { year, month, deptID },
      });
      if (response.data.data) {
        const holidayDates = response.data.data.map((holiday: HolidayRecord) => holiday);
        setHolidays(holidayDates);
        console.log(response.data.data);
      } else {
        console.error('Holidays data is not an array:', response.data);
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHolidays([]);
    }
  };

  const fetchEmployeeData = async (userid: string, selectedMonth: number, selectedYear: number) => {
    try {
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Attendance/get_empattendacedata?userid=${userid}&year=${selectedYear}&month=${selectedMonth}`);
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
      const username = await AsyncStorage.getItem('username');
      const departmentname = await AsyncStorage.getItem('departmentname');
      const profile = await AsyncStorage.getItem('profile');
      if (userid && username && departmentname && profile) {
        setCurrentUser({ username, employee_code: userid, departmentname, profile });
        fetchEmployeeData(userid, month, year);
        fetchHolidays(year, month);
      } else {
        setError('User details not found. Please log in again.');
      }
    };
    getUserID();
  }, [month, year]);

  useEffect(() => {
    if (selectedDate) {
      handleDateClick(selectedDate);
    }
  }, [employeeData]);

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

  const calculateWorkingHours = (checkInTime: string, checkOutTime: string) => {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diff = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} hours`;
  };

  const updateMonthlyStats = (working: number, present: number, absent: number, holidayDays: number) => {
    setWorkingDays(working);
    setPresentDays(present);
    setAbsentDays(absent);
    setHolidayDays(holidayDays);
    console.log(`Holiday Days: ${holidayDays}`);
  };

  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentDays, absentDays,holidayDays],
        backgroundColor: ['rgb(126 174 106)', '#FF6384','rgb(255, 165, 0)'],
        hoverBackgroundColor: ['rgb(126 174 106)', '#FF6384','rgb(255, 165, 0)'],
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

  const compareTimes = (checkInTime: string | undefined, checkOutTime: string | undefined): boolean => {
    if (!checkInTime || !checkOutTime) return false;

    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    return checkInDate.getTime() !== checkOutDate.getTime();
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      handleDateClick(newDate);
    }
  };

  const isNextDisabled = selectedDate ? selectedDate.toLocaleDateString() === currentTime.toLocaleDateString() : false;

  const getCardStyle = (statusNew: string) => {
    switch (statusNew) {
      case 'Present':
        return styles.presentCard;
      case 'Absent':
        return styles.absentCard;
      case 'Ongoing':
        return styles.ongoingCard;
      case 'Sunday Holiday':
        return styles.sundayCard;
        case 'Holiday':
          return styles.holidayCard;
      default:
        return {};
    }
  };

  const handlePress = () => {
    navigate('/Profile');
  };

  return (
    <div>
      <Navigation_Emp />
      <View style={styles.container}>
        <TouchableOpacity onPress={handlePress}>
          <View style={styles.employeeDetailsCard}>
            {currentUser.profile ? (
              <Image source={{ uri: `https://dev.techkshetra.ai/office_webApi/public/photos/${currentUser.profile}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                {/* <Text style={styles.placeholderText}>{currentUser.username.charAt(0).toUpperCase()}</Text> */}
              </View>
            )}
            <View style={styles.detailsText}>
              <Text style={styles.usernameText}>{currentUser.username}</Text>
              <Text style={styles.infoText}> {currentUser.employee_code}</Text>
              <Text style={styles.infoText}> {currentUser.departmentname}</Text>
            </View>
            <View style={styles.donutContainer}>
              <Doughnut data={attendanceData} options={options} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={[styles.attendanceInfo, getCardStyle(attendanceInfo.statusNew)]}>
          <View style={styles.dateNavigator}>
            <FaChevronLeft style={styles.navIcon} onClick={() => navigateDate('prev')} />
            <Text style={styles.timeText}>
              {selectedDate ? selectedDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }) : currentTime.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <FaChevronRight
              style={{
                ...styles.navIcon,
                color: isNextDisabled ? 'gray' : 'black',
                pointerEvents: isNextDisabled ? 'none' : 'auto',
              }}
              onClick={() => !isNextDisabled && navigateDate('next')}
            />
          </View>
          <View style={styles.clockInOut}>
            {attendanceInfo.statusNew !== 'Sunday Holiday' && attendanceInfo.statusNew !== 'Absent' && attendanceInfo.statusNew !== 'Holiday' && (
              <>

                <View style={styles.timeWrapper}>
                  <BiTime style={styles.icon1} />
                  <Text style={styles.clockText}>{attendanceInfo.checkIn}</Text>
                </View>


              </>
            )}
            <Text style={[styles.workingHours, (attendanceInfo.statusNew === 'Sunday Holiday' || attendanceInfo.statusNew === 'Absent'  || attendanceInfo.statusNew === 'Holiday') && styles.centeredText]}>
              <b>{isCurrentDate && !isAfter630PM ? 'Ongoing' : attendanceInfo.workingHours} <Text style={styles.status}>{attendanceInfo.status}</Text></b>
            </Text>
            {attendanceInfo.statusNew !== 'Sunday Holiday' && attendanceInfo.statusNew !== 'Absent' &&  attendanceInfo.statusNew !== 'Holiday' &&(
              <>
                <View style={styles.timeWrapper}>
                  <FaRegClock style={styles.icon1} />

                  {compareTimes(attendanceInfo?.checkIn, attendanceInfo?.checkOut) ? (
                    <>
                      <Text style={styles.clockText}>{(attendanceInfo.checkOut)}</Text>
                    </>
                  ) : (
                    <Text>---</Text>
                  )}

                </View>
              </>
            )}
          </View>
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
          <View style={styles.statsCard_holiday}>
            <Text style={styles.statsHeader}>Holiday <Text style={styles.statsValue}>{holidayDays}</Text></Text>
          </View>
        </View>
        <View style={styles.calendarContainer}>
          <Calendar
            attendanceData={employeeData || []}
            selectedDate={selectedDate}
            holidays={holidays}
            onDateClick={handleDateClick}
            updateStats={updateMonthlyStats}
            fetchHolidays={fetchHolidays} // Pass fetchHolidays to Calendar
          />
          <View style={styles.indicators}>
            <Text><View style={styles.presentIndicator} /> Present</Text>
            <Text><View style={styles.absentIndicator} /> Absent</Text>
            <Text><View style={styles.inProgressIndicator} /> In </Text>
            <Text><View style={styles.holidayindicator} /> Holiday</Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          {selectedDate ? (
            <View style={styles.card}>

              <View style={styles.cardBody}>
                <View style={styles.cardColumn}>
                  <Text style={{ marginBottom: 5, }}><strong>Check-In</strong> {selectedDateData?.first_check_in ? formatTime(selectedDateData.first_check_in) : '---'}</Text>

                  {selectedDateData?.first_detected_face && (
                    <TouchableOpacity onPress={() => handleImageClick(selectedDateData.fullfirst_detected_face!)}>
                      <Image
                        style={styles.image}
                        source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${selectedDateData.fullfirst_detected_face}` }}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.cardColumn}>
                  {compareTimes(selectedDateData?.first_check_in, selectedDateData?.last_check_in) ? (
                    <>
                      <Text style={{ marginBottom: 5, }}><strong>Check-Out</strong> {selectedDateData?.last_check_in ? formatTime(selectedDateData.last_check_in) : '---'}</Text>
                      {selectedDateData?.last_detected_face && (
                        <TouchableOpacity onPress={() => handleImageClick(selectedDateData.fulllast_detected_face!)}>
                          <Image
                            style={styles.image}
                            source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${selectedDateData.fulllast_detected_face}` }}
                          />
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <Text>---</Text>
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
    shadowRadius: 4,
    elevation: 2,
    padding: 15,
    borderRadius: 8,
  },
  profileImage: {
    width: 80,
    height: 100,
    // borderRadius: 50,
    marginRight: 20,
    resizeMode: 'cover', // Ensures the image covers the frame while maintaining the aspect ratio
    overflow: 'hidden',
   
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
    color: 'gray',
  },
  attendanceInfo: {
    backgroundColor: 'rgb(212 212 237)',
    padding: 20,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    marginTop: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    color: '#000',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clockInOut: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  statusRow: {
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
    // marginTop: 10,
    color: '#000',
    textAlign: 'center',
  },
  centeredText: {
    flex: 1,
    textAlign: 'center',

  },
  status: {
    marginTop: 10,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
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
    width: '20.5%',
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
    width: '20.5%',
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
    width: '20.5%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsCard_holiday: {
    backgroundColor: '#ffe5cc',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '20.5%',
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
    width: '20.5%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  statsHeader: {
    fontSize: 12,
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
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'green',
  },
  absentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  inProgressIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'yellow',
  },
  holidayindicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'orange',
  },
  detailsContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 10,
    width: '100%',
  },
  image: {
    width: 155,
    height: 155,
    borderRadius: 8,
    marginRight: -5,
    marginLeft: -5,
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
    height: 400,
    marginBottom: 20,
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
  navIcon: {
    cursor: 'pointer',
    fontSize: 14,
    color: '#000',
  },
  presentCard: {
    backgroundColor: 'rgb(208, 223, 201)',
  },
  absentCard: {
    backgroundColor: 'rgb(230, 205, 205)',
  },
  ongoingCard: {
    backgroundColor: 'yellow',
  },
  sundayCard: {
    backgroundColor: 'rgb(212 212 237)',
  },
  holidayCard:{
    backgroundColor: '#fff5d9',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default Dashboard_Emp;
