import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaEnvelope, FaHome, FaPowerOff, FaClock,FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import Navigation from './Navigation';

interface VisitorData {
  guest_photo: string;
  registered_date: string;
  id: string;
  email?: string;
  first_name?: string;
  contact?: string;
}

const Guest: React.FC = () => {
  const [data, setData] = useState<VisitorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
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

  const filteredData = data.filter(item =>
    item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
      <Navigation />
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.scrollContainer}>
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
                    {/* <FaPhone style={styles.icon} /> */}
                    <Text style={styles.textContact}>{item.contact || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    {/* <FaEnvelope style={styles.icon} /> */}
                    <Text style={styles.textContact1}>{item.email || 'N/A'}</Text>
                  </View>
                 
                  <View style={styles.infoRow}>
                    {/* <FaClock style={styles.icon} /> */}
                    {/* <Text style={styles.textDate}>{item.registered_date}</Text> */}
                    <Text style={styles.textDate}>{formatDate(item.registered_date)}</Text>
                  
                  </View>
                  <View style={styles.infoRow}>
                    {/* <FaClock style={styles.icon} /> */}
                    {/* <Text style={styles.textDate}>{item.registered_date}</Text> */}
                
                    <Text style={styles.textTime}>{formatTime(item.registered_date)}</Text>
                  </View>
                  
                </View>
              </View>
            ))
          ) : (
            <Text>No data available</Text>
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
    paddingBottom: 50, // Added to account for the fixed footer height
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop: 0, // Added to account for the fixed navbar height
  },
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000', // Black shadow color
    shadowOffset: { width: 0, height: 1 }, // Offset for the shadow
    shadowOpacity: 0.4, // Opacity for the shadow
    shadowRadius: 1.41, // Radius for the shadow blur
    elevation: 2, // Elevation for Android shadow
  },
  avatar: {
    width: 100,
    height: 100,
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
  },
  text: {
    fontSize: 16,
  },
  textName: {
    fontSize: 20,
  },
  
  textContact: {
    color: '#818589',
    fontSize: 16,
  },

  textContact1: {
    color: '#818589',
    fontSize: 16,
    marginBottom:1 ,
  },
  textDate: {
    fontSize: 16,
    color: '#000',
    alignItems: 'center',
  },
  textTime: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Guest;
