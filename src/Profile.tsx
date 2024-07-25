import React, { useState, useEffect, useRef ,ChangeEvent, FormEvent} from 'react';

import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaHome, FaPowerOff, FaBell, FaCamera, FaCheck, FaTimes } from 'react-icons/fa';
import Navigation_Emp from './Navigation_Emp';
import './Main.css';

type UserProfileFields = 'contact' | 'personal_email' | 'address' | 'date_of_birth' | 'blood_group' | 'emergency_contact';

interface UserProfile {
  code: string;
  username: string;
  last_name: string;
  employee_code: string;
  departmentname: string;
  profile: string;
  email: string;
  contact: string;
  reporting_to_name: string;
  shift_name: string;
  shift_duration: string;
  shift_start_time: string;
  shift_end_time: string;
  shift_enable: number;
  password: string;
  personal_email: string;
  address: string;
  date_of_birth: string;
  blood_group: string;
  emergency_contact: string;
}

const Profile: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingField, setEditingField] = useState<UserProfileFields | null>(null); // Track which field is being edited
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    code: '',
    username: '',
    last_name: '',
    employee_code: '',
    departmentname: '',
    profile: '',
    email: '',
    contact: '',
    reporting_to_name: '',
    shift_name: '',
    shift_duration: '',
    shift_start_time: '',
    shift_end_time: '',
    shift_enable: 0,
    password: '',
    personal_email: '',
    address: '',
    date_of_birth: '',
    blood_group: '',
    emergency_contact: '',
  });



  useEffect(() => {
    const getUserID = async () => {
      try {
        const userid = await AsyncStorage.getItem('user_id');
        console.log('userid', userid);

        if (!userid) {
          console.log('User ID not found. Please log in again.');
          return;
        }
        const formData = new FormData();
        formData.append('userid', userid);
        const response = await axios.post(`https://dev.techkshetra.ai/office_webApi/public/index.php/Dashboard/profile_details`,
          formData, {
            headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" }
          });

        console.log('Response data:', response.data);

        if (response.status === 200 && response.data.status) {
          const data = response.data;
          console.log('Fetched user details:', data);
          setCurrentUser({
            code: data.code,
            username: data.username,
            last_name: data.last_name,
            employee_code: data.code,
            departmentname: data.department_name,
            profile: data.user_profile,
            email: data.email,
            contact: data.contact,
            reporting_to_name: data.reporting_to_name,
            shift_name: data.shift_name,
            shift_duration: data.shift_duration,
            shift_start_time: data.shift_start_time,
            shift_end_time: data.shift_end_time,
            password: '',
            personal_email: data.personal_email,
            address: data.address,
            date_of_birth: data.date_of_birth,
            blood_group: data.blood_group,
            emergency_contact: data.emergency_contact,
            shift_enable: Number(data.shift_enable)
          });
        
        } else {
          console.log(response.data.message || 'User details not found. Please log in again.');
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
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

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile_photo', file);

      try {
        const response = await axios.post('https://your-server-endpoint/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Assuming the server returns the updated profile image URL
        const updatedProfileUrl = response.data.profile_url;
        setCurrentUser(prevState => ({ ...prevState, profile: updatedProfileUrl }));

        // Optionally, save the updated profile URL to AsyncStorage
        await AsyncStorage.setItem('profile', updatedProfileUrl);
      } catch (error) {
        console.error('Error uploading profile photo:', error);
      }
    }
  };

  const handleFieldChange = (field: UserProfileFields, value: string) => {
    setCurrentUser(prevState => ({ ...prevState, [field]: value }));
  };

 
  
  
  const handleCancelClick = () => {
    setEditingField(null);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userid = await AsyncStorage.getItem('user_id');
      if (!userid) {
        console.log('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('user_id', userid);
      // formData.append('first_name', currentUser.username);
      // formData.append('email', currentUser.email);
      formData.append('contact_number', currentUser.contact);
      formData.append('password', currentUser.password);
      formData.append('user_id', userid);
      formData.append('personal_email', currentUser.personal_email);
      formData.append('address', currentUser.address);
      formData.append('date_of_birth', currentUser.date_of_birth);
      formData.append('blood_group', currentUser.blood_group);
      formData.append('emergency_contact', currentUser.emergency_contact);
      const response = await axios.post('https://dev.techkshetra.ai/office_webApi/public/index.php/Setting/update_user_mobile',
        formData, {
          headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" }
        });

      console.log('Response data:', response.data);

      if (response.status === 200 && response.data.status) {
        console.log('User details updated successfully.');
        setMessage('Details updated successfully.');
      } else {
        console.log(response.data.message || 'Failed to update user details.');
        setMessage('Failed to update details.');
      }
    } catch (error) {
      console.log('An error occurred. Please try again.', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
              <TouchableOpacity style={styles.cameraIcon} onPress={handleCameraClick}>
                <FaCamera size={15} color="#fff" />
              </TouchableOpacity>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </View>
          </ImageBackground>
          <View style={styles.cardBottom}>
            <Text style={styles.cardTitle}>{currentUser.username} {currentUser.last_name}</Text>
            <Text style={styles.cardSubtitle}>{currentUser.departmentname}</Text>
            <Text style={styles.cardSubtitle}>{currentUser.email}</Text>
          </View>
        </View>

        {currentUser.shift_enable == 1 && (
          <View style={styles.ShiftCard}>
            <View style={styles.detailsText}>
              <View style={styles.statusShift}>
                <Text style={styles.ShiftHeading}>{currentUser.shift_name}</Text>
                <Text style={styles.ShiftStatus}>Default</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.infoShiftnames}>Start Time</Text>
                <Text style={styles.infoShiftnames}>End Time</Text>
                <Text style={styles.infoShiftnames}>Duration</Text>
              </View>
              <View style={styles.statusShift}>
                <Text style={styles.infoShift}>{currentUser.shift_start_time}</Text>
                <Text style={styles.infoShift}>{currentUser.shift_end_time}</Text>
                <Text style={styles.infoShift}>{currentUser.shift_duration} Hours</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.employeeDetailsCard}>
          <View style={styles.detailsText}>
            <View style={styles.statusShift}>
              <Text style={styles.infoTextID}>{currentUser.code}</Text>
              {/* <Text style={styles.infoShiftdoj}>{currentUser.doj} </Text> */}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.infoTextData}>Reporting To</Text>
              <Text style={styles.infoTextReport}>{currentUser.reporting_to_name} </Text>
            </View>
          </View>
        </View>
        {/* <h2>Update User Details</h2> */}
        {message && <p>{message}</p>}
        <View style={styles.employeeDetailsCard}>
     
      <form onSubmit={handleSubmit} style={{ }}>
      <div style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        {/* <div>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={currentUser.username}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={currentUser.email}
              onChange={handleChange}
              required
            />
          </label>
        </div> */}
        <div>
          <label>
            Contact
            <input
              type="text"
              name="contact"
              value={currentUser.contact}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Personal Email 
            <input
              type="text"
              name="personal_email"
              value={currentUser.personal_email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
           Address 
            <input
              type="text"
              name="address"
              value={currentUser.address}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
          Date of Birth 
            <input
              type="date"
              name="date_of_birth"
              value={currentUser.date_of_birth}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
        Blood Group
            <input
              type="text"
              name="blood_group"
              value={currentUser.blood_group}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
        Emergency Contact
            <input
              type="text"
              name="emergency_contact"
              value={currentUser.emergency_contact}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={currentUser.password}
              onChange={handleChange}
              
            />
          </label>
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
        </div>
      </form>
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
  dateStatusRow_name: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    marginBottom: 3,
    marginTop:5,
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
  ShiftCard:{
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#c9c9c9',

  },
  statusShift: {
    flexDirection: 'row',
    justifyContent: 'space-between',
   
   

  },
  input: {
  
    textAlign: 'right',
  },
  ShiftStatus:{
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#931313',
    color:'#fff',
    fontSize: 11,
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#c9bdbd',
    borderRadius: 20,
    padding: 7,
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
  infoTextLabel: {
    fontSize: 15,
    // marginBottom: 5,
    color: '#535353',

  },
 
  infoTextData: {
    fontSize: 15,
    marginTop: 6,
    color: '#8d8282',
    fontWeight: 'bold',
  },
  infoTextReport: {
    fontSize: 15,
    marginTop: 6,
    color: '#000',
    fontWeight: 'bold',
  },
  infoTextID: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
 
  infoShiftnames:{
    fontSize: 12,
    marginTop: 10,
    color: '#715c5c',
  },
  infoShiftdoj:{
    fontSize: 14,
    fontWeight: 'bold',
    color: '#715c5c',
   
  },
 
  infoShift: {
    fontSize: 15,
    marginTop: 10,
    color: '#931313',
    fontWeight: 'bold',
  },
  ShiftHeading:{
    fontSize: 16,
    marginTop: 2,
    color: '#6d2323',
    fontWeight: 'bold',
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