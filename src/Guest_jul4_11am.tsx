import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaEnvelope, FaHome, FaPowerOff, FaClock, FaArrowLeft,FaRegClock } from 'react-icons/fa';
import axios from 'axios';
import Navigation from './Navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Main.css';

interface VisitorData {
  guest_photo: string;
  attendance_date: string;
  first_check_in:string;
  last_check_in:string;
  id: string;
  email?: string;
  first_name?: string;
  contact?: string;
  guestfrom?: string;
  purpose_of_visit?: string;
  user_first_name?: string;
}

const Guest: React.FC = () => {
  const [data, setData] = useState<VisitorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [scrollContainerMargin, setScrollContainerMargin] = useState(0);
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
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/get_knownguest_records_for_mobile?user_id=${storedUserId}`);
          setData(response.data.data);
          console.log('Fetched data:', response.data.data); // Log the fetched data
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    const itemDate = new Date(item.attendance_date).toLocaleDateString();
    const selectedDateString = selectedDate ? selectedDate.toLocaleDateString() : '';
    return (
      (item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      itemDate === selectedDateString
    );
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB');
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setScrollContainerMargin(0); 
  };

  return (
    <div>
      <Navigation />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.datePickerWrapper}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd MMM yyyy"
              className="date-picker"
              popperPlacement="top-end"
              onCalendarOpen={() => setScrollContainerMargin(260)} // Adjust the margin when the date picker is open
              onCalendarClose={() => setScrollContainerMargin(0)} // Reset the margin when the date picker is closed
            />
          </View>
        </View>
        <View style={[styles.scrollContainer, { marginTop: scrollContainerMargin }]}>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <View key={index} style={styles.card}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${item.guest_photo}` }}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.textName}>{item.first_name}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.textContact}>{item.contact || 'N/A'}</Text>
                  </View>
                 
                  <View style={styles.dateStatusRow}>
                  <View style={styles.infoRow}>
                  <FaRegClock style={styles.icon} />
                    <Text style={styles.textTime}>{formatTime(item.first_check_in)}</Text>
                   
                  </View>
                  <View style={styles.infoRow}>
                  <FaRegClock style={styles.icon} />
                  
                    <Text style={styles.textTime}>{formatTime(item.last_check_in)}</Text>
                  </View>
                  </View>
                </View>
                </View>
            ))
          ) : (
            <View style={styles.card}>
            <Text>No data available</Text>
            </View>
          )}
        </View>
      </View>
      <div className="footer">
        <FaArrowLeft className="footer-icon" onClick={() => navigate('/Visitors')}/>
        <FaHome className="footer-icon" onClick={() => navigate('/Visitors')}/>
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50, 
    backgroundColor: '#fff',
  },
 
  dateStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1, 
    borderTopColor: 'rgb(215 213 213)', 
    marginBottom:0,
    marginTop:5,
   
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flex: 1,
  },
  datePickerWrapper: {
    zIndex: 1000, 
    position: 'relative', 
    flex: 1,
   
   
  },
  searchBar: {
    height: 39,
    borderColor: 'rgb(215 213 213)',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    flex: 1,
    marginRight: 10,
  },
  input: {
   
   
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: '#807878',
   
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop: 0, 
  },
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 20,
  },
  infoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  icon: {
    marginRight: 10,
    color: 'gray',
    fontSize: 12,
    marginTop:7,
  },
  text: {
    fontSize: 16,
  },
  textName: {
    fontSize: 20,
  },
  textContact: {
    color: '#818589',
    fontSize: 12,
  },
  textContact1: {
    color: '#818589',
    fontSize: 12,
    marginBottom: 1,
  },
  textDate: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginLeft:65,
  },
  textTime: {
    fontSize: 14,
    marginLeft:-6,
    color: 'gray',
    marginTop:5,
  },
});

export default Guest;

