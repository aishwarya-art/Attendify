import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaEnvelope, FaHome, FaPowerOff, FaClock, FaArrowLeft, FaRegClock,FaUser,FaBriefcase,FaEllipsisH } from 'react-icons/fa';
import axios from 'axios';
import Navigation from './Navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Main.css';
import { MdAccessTime, MdOutlineAccessTime } from 'react-icons/md';
import { IoMdTime, IoMdStarOutline } from 'react-icons/io';
import { FiClock } from 'react-icons/fi';
import { BiTimeFive, BiTime } from 'react-icons/bi';
interface VisitorData {
  guest_photo: string;
  attendance_date: string;
  first_check_in: string;
  last_check_in: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<VisitorData | null>(null);
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

  const openModal = (guest: VisitorData) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
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
              <TouchableOpacity key={index} style={styles.card} onPress={() => openModal(item)}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${item.guest_photo}` }}
                />
                <View style={styles.infoContainer}>
                <View style={styles.dateStatusRow_name}>
                  <Text style={styles.textName}><b>{item.first_name}</b></Text>
                  {/* <FaEllipsisH/> */}
                  <Text style={styles.textContact}>{item.contact || 'N/A'}</Text>
                </View>
                  {/* <View style={styles.infoRow}> 
                    <Text style={styles.textContact}>{item.contact || 'N/A'}</Text>
                  </View> */}
                  <View style={styles.dateStatusRow}>
                    <View style={styles.infoRow_clock}>
                      <BiTime style={styles.icon} />
                      <Text style={styles.textTime}>{formatTime(item.first_check_in)}</Text>
                    </View>
                    <View style={styles.infoRow_clock}>
                      <FaRegClock style={styles.icon_clock} />
                      {/* <MdAccessTime />
    <MdOutlineAccessTime />
    <IoMdTime />
    <IoMdStarOutline />
    <FiClock />
    <BiTimeFive /> */}
    {/* <BiTime /> */}
    
                      <Text style={styles.textTime}>{formatTime(item.last_check_in)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.card}>
              <Text>No data available</Text>
            </View>
          )}
        </View>
      </View>
      <div className="footer">
        <FaArrowLeft className="footer-icon" onClick={() => navigate('/Visitors')} />
        <FaHome className="footer-icon" onClick={() => navigate('/Visitors')} />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
     
      <Modal
  visible={isModalOpen}
  transparent={true}
  onRequestClose={closeModal}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      {selectedGuest && (
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Image
              style={styles.modalAvatar}
              source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${selectedGuest.guest_photo}` }}
            />
            <Text style={styles.modalTextName}>{selectedGuest.first_name}</Text>
            <Text style={styles.modalTextSub}>{formatDate(selectedGuest.attendance_date)}</Text>
          </View>
          <View style={styles.modalDetails}>
            <Text style={styles.modalDetailText}><FaPhone style={styles.modalIcon} /> {selectedGuest.contact || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaEnvelope style={styles.modalIcon} /> {selectedGuest.email || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaHome style={styles.modalIcon} /> {selectedGuest.guestfrom || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaBriefcase style={styles.modalIcon} /> {selectedGuest.purpose_of_visit || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaUser style={styles.modalIcon} /> {selectedGuest.user_first_name || 'N/A'}</Text>
          </View>
          <View style={styles.modalHistory}>
            <Text style={styles.modalHistoryTitle}>{formatDate(selectedGuest.attendance_date)}</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineRow}>
                <View style={styles.timelineDotGreen} />
                <Text style={styles.timelineText}>Clock In: {formatTime(selectedGuest.first_check_in)}</Text>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineRow}>
                <View style={styles.timelineDotRed} />
                <Text style={styles.timelineText}>Clock Out: {formatTime(selectedGuest.last_check_in)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
</Modal>



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
    // borderTopWidth: 1,
    // borderTopColor: 'rgb(215 213 213)',
    // marginBottom: 0,
    // marginTop: 0,
    // shadowColor: '#000',
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 2,
    padding: 6,
    borderRadius: 7,
    backgroundColor:'rgb(252 240 240)',
  },
  dateStatusRow_name: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    // borderTopWidth: 1,
    // borderTopColor: 'rgb(215 213 213)',
   
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
    // height: 39,
    // borderColor: 'rgb(215 213 213)',
    // borderWidth: 1,
    // borderRadius: 4,
    // paddingLeft: 10,
   
   
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
  infoRow_clock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  icon: {
    marginRight: 8,
    color: 'black',
    fontSize: 15,
    marginTop: 0,
  },
  icon_clock: {
    marginRight: 9,
    color: 'black',
    fontSize: 13,
    marginTop: 1,
  },
  text: {
    fontSize: 16,
  },
  textName: {
    fontSize: 20,
  },
  textContact: {
    color: 'rgb(25 36 48)',
    fontSize: 14,
    // marginBottom: 3,
  },
  textContact1: {
    color: 'rgb(25 36 48)',
    fontSize: 14,
    // marginBottom: 3,
  },
  textDate: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginLeft: 65,
  },
  textTime: {
    fontSize: 14,
    marginLeft: -6,
    color: 'black',
    marginTop: 0,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  // modalContainer: {
  //   width: 300,
  //   backgroundColor: 'white',
  //   borderRadius: 8,
  //   padding: 20,
  //   alignItems: 'center',
  // },
  modalContent: {
    alignItems: 'center',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalTextName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    width:'100%',
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },


  modalTextSub: {
    fontSize: 16,
    color: 'gray',
  },
  modalDetails: {
    width: '100%',
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    marginRight: 10,
  },
  modalIcon_time:{
    marginRight: 10,
    fontSize:18,
  },
  modalHistory: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft:5,
  },
  modalHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHistoryText: {
    fontSize: 16,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
  },

  timeline: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineDotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    marginRight: 10,
    zIndex: 1,
    marginBottom: 2,
  },
  timelineDotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 10,
    zIndex: 1,
    marginBottom: 2,
  },
  timelineLine: {
    // position: 'absolute',
    left: 18,  
    top: 10,
    bottom: 10,
    width: 1,
    // backgroundColor: '#fff',
    zIndex: 0,
  },
  timelineText: {
    fontSize: 16,
  },
});

export default Guest;
