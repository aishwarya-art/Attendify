import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TextInput as RNTextInput } from 'react-native';
import Navigation from './Navigation'; 
import Footer from './Footer'; 
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaPhone, FaEnvelope, FaHome, FaPowerOff, FaClock, FaArrowLeft, FaRegClock,FaUserTie,FaUser,FaBriefcase,FaBell,FaUserFriends,FaWalking,FaUsers } from 'react-icons/fa';
import { Keyboard, Platform } from 'react-native';

interface VisitorData {
  detected_face: string;
  first_check_in: string;
  id: string;
  email?: string;
  name?: string;
  first_name?: string;
  contact?: string;
  guestid: string;
}

interface GuestData {
  detected_face: string;
  first_check_in: string;
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  contact?: string;
  status: number;
  guestfrom?: string;
  attendance_date?: string;
  purpose_of_visit?: string;
  user_first_name?: string;
  
}

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
}

const Visitors: React.FC = () => {
  const [data, setData] = useState<VisitorData[]>([]);
  const [empList, setEmpList] = useState<EmployeeData[]>([]);
  const [guestList, setGuestList] = useState<GuestData[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalvisitorCount, setVisitorCounts] = useState(0);
  const [visitorStatusCount, setVisitorStatusCount] = useState(0);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // Define itemsPerPage here
  const [currentGuestPage, setCurrentGuestPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [visitorHistory, setVisitorHistory] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState({
    username: '',
    employee_code: '',
    departmentname: '',
    profile: '', 
  });


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
  const handleNavigateToVisitors = () => {
    setSelectedVisitor(null);
    navigate('/Visitors');
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
  
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  useEffect(() => {
    const fetchVisitorData = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/Guest_index?user_id=${user_id}`);
        setData(response.data.data);
        setVisitorCount(response.data.data.length); // Set visitor count
        console.log("Visitor data fetched:", response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchVisitorData();
    const intervalId = setInterval(fetchVisitorData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Dashboard/getUsers?user_id=${user_id}`)
        .then(response => {
          setEmpList(response.data.data); // Set the fetched data to the state
        })
        .catch(error => console.error('Error fetching data:', error));
    };
 
    fetchEmployeeData();
    const intervalId = setInterval(fetchEmployeeData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    const fetchVisitorStatusData = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/Guest_Approval_status?user_id=${user_id}`);
        setGuestList(response.data.data);
        setVisitorStatusCount(response.data.data.length); // Set visitor count
        console.log("Visitor Status data fetched:", response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchVisitorStatusData();
    const intervalId = setInterval(fetchVisitorStatusData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Dashboard/getEmployeeCount_mobile?user_id=${user_id}`);
        console.log(response.data);
        if (response.data.status) {
          setEmployeeCount(response.data.empcount);
        } else {
          setEmployeeCount(0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchVisitorCounts = async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Dashboard/getGuestCount_mobile?user_id=${user_id}`);
        console.log(response.data);
        if (response.data.status) {
          setVisitorCounts(response.data.guestcount);
        } else {
          setVisitorCounts(0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    // fetchVisitorCounts();
    fetchVisitorCounts();

    // Set up interval to fetch counts every 3 seconds
    const intervalId = setInterval(fetchVisitorCounts, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);




  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // const handleCardClick = (visitor: VisitorData) => {
  //   console.log("Card clicked:", visitor);
  //   setSelectedVisitor(visitor);
  // };
  const handleCardClick = (visitor: VisitorData) => {
    console.log("Card clicked:", visitor);
  
    const fetchVisitorhistory = async () => {
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/get_guesthistory_for_mobile?guestID=${visitor.guestid}`);
        console.log(response.data);
        console.log(response.data.data);
        setVisitorHistory(response.data.data || []);
      } catch (error) {
        console.error('Error fetching visitor history:', error);
      }
    };
  
    // Call fetchVisitorhistory directly
    fetchVisitorhistory();
  
    setSelectedVisitor({
      ...visitor,
      first_name: visitor.first_name || visitor.name || '',
      email: visitor.email || '',
      contact: visitor.contact || ''
    });
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
      
      }
      if (userid) {
       
      } else {
       
      }
    };
    getUserID();
  }, []);
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .matches(/^[a-zA-Z_ ]*$/, 'First name can only contain letters, underscores, and spaces')
      .required('Full name is required'),
    // lastName: Yup.string()
    //   .matches(/^[a-zA-Z_ ]*$/, 'Last name can only contain letters, underscores, and spaces')
    //   .required('Last name is required'),
    contact: Yup.string()
      .matches(/^[0-9]*$/, 'Contact number can only contain numbers')
      .required('Contact number is required')
      .min(10, 'Contact number must be at least 10 digits')
      .max(10, 'Contact number must be at most 10 digits'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    guestfrom: Yup.string().required('Guest from is required'),
    purpose: Yup.string().required('Purpose is required'),
    user_id: Yup.string().required('Employee selection is required'),
  });

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append('first_name', values.firstName);
    // formData.append('last_name', values.lastName);
    formData.append('purpose', values.purpose);
    formData.append('guestID', selectedVisitor!.id);
    formData.append('email', values.email);
    formData.append('contact', values.contact);
    formData.append('guestfrom', values.guestfrom);
    formData.append('user_id', values.user_id);

    try {
      const response = await axios.post(
        'https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/update_guest',
        formData,
        {
          headers: {
            "Accept": "application/json",
          }
        }
      );

      if (response.status === 200) {
        setData(data.filter(visitor => visitor.id !== selectedVisitor!.id));
        console.log("Data submitted successfully:", response.data);
        Alert.alert('Success', 'Data submitted successfully');
        setSelectedVisitor(null); // Close the modal
      } else {
        console.error('Error submitting data:', response);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const openModal = (guest_status: GuestData) => {
    setSelectedGuest(guest_status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
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

  const filterInput = (value: string, pattern: RegExp) => {
    return value.replace(pattern, '');
  };
  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < data.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextGuestPage = () => {
    if ((currentGuestPage + 1) * itemsPerPage < guestList.length) {
      setCurrentGuestPage(currentGuestPage + 1);
    }
  };

  const handlePreviousGuestPage = () => {
    if (currentGuestPage > 0) {
      setCurrentGuestPage(currentGuestPage - 1);
    }
  };



  
  const visibleVisitors = data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const visibleGuests = guestList.slice(currentGuestPage * itemsPerPage, (currentGuestPage + 1) * itemsPerPage);
  return (
    <div> 
    <View style={styles.wrapper}>
      <Navigation />
   
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <View style={styles.timeContainer}>
      <View style={styles.timeContainerdiv}>
            <Text style={styles.timeText}>
            {currentTime.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })} {currentTime.toLocaleTimeString()}
    </Text>
         </View>
        </View>
          </View>
          <View style={styles.cardContainer}>
          <View style={styles.card}>
           
            <Text style={styles.cardTitle}>
              <FaUserTie style={{ fontSize: '10', display: 'inline-block' }} /> {employeeCount}
          </Text>
          </View>
         
          <View style={styles.card}>
            <Text style={styles.cardTitle}><FaWalking/> {totalvisitorCount}</Text>
            
          </View>
        </View>
        </View>
        
        <Text>Action Required</Text>
        
       
        
          {visibleVisitors.length > 0 ? (
            visibleVisitors.map((visitor, index) => (
             
              <TouchableOpacity key={index} onPress={() => handleCardClick(visitor)}>
                 <View  style={styles.visitorCard}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${visitor.detected_face}` }}
                />
                <View style={styles.info}>
                 
                  <Text style={styles.text}>{formatDate(visitor.first_check_in)}</Text>
                  <Text style={styles.text}>{formatTime(visitor.first_check_in)}</Text>
                </View>
                </View>
              </TouchableOpacity>
             
            ))
          ) : (
            <View style={styles.noVisitorsCard}>
              <Text style={styles.noVisitorsText}>No visitors today!</Text>
            </View>
          )}
        
       
        <View style={styles.buttonsContainer}>
  <Button title="<<" onPress={handlePreviousPage} disabled={currentPage === 0} color="rgb(152 5 5)" />
  <Button title=">>" onPress={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= data.length} color="rgb(152 5 5)" />
</View>
        <Text>Registered Visitors</Text>
       
         <ScrollView>
          {visibleGuests.length > 0 ? (
            visibleGuests.map((guest, index) => (
             
              <TouchableOpacity
              key={index} onPress={() => openModal(guest)}
             
            >
                  <View   style={[
                styles.visitorCard,
                {
                  backgroundColor:
                    guest.status == 1 ? 'rgb(224, 233, 219)' : guest.status == 2 ? 'rgb(235, 224, 224)' : '#fff',
                },
              ]}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${guest.detected_face}` }}
                />
                
                <View style={styles.info}>
                  <Text style={styles.visitorTitle}>{guest.first_name}</Text>
                 
                  <View style={styles.dateStatusRow}>
            <View>
              <Text style={styles.textdate}>{formatDate(guest.first_check_in)}</Text>
              <Text style={styles.textdate}>{formatTime(guest.first_check_in)}</Text>
            </View>
            <Text
              style={[
                styles.textStatus,
                { color: guest.status == 1 ? 'green' : guest.status == 2 ? 'red' : 'black' },
              ]}
            >
              <b>{guest.status == 1 ? 'Approved' : guest.status == 2 ? 'Rejected' : 'Pending'}</b>
            </Text>
          </View>
        
                </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noVisitorsCard}>
              <Text style={styles.noVisitorsText}>No visitors today!</Text>
            </View>
          )}
        </ScrollView>
       
        <View style={styles.buttonsContainer}>
  <Button title="<<" onPress={handlePreviousGuestPage} disabled={currentGuestPage === 0} color="rgb(152 5 5)" />
  <Button title=">>" onPress={handleNextGuestPage} disabled={(currentGuestPage + 1) * itemsPerPage >= guestList.length} color="rgb(152 5 5)" />
</View>
        {selectedVisitor && (
         <Modal
         animationType="slide"
         transparent={false}
         visible={!!selectedVisitor}
         onRequestClose={() => setSelectedVisitor(null)}
       >
         <ScrollView contentContainerStyle={styles.modalScrollContainer}>
           <View style={styles.modalHeader}>
             <Image
               style={styles.modalAvatar}
               source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedVisitor.detected_face}` }}
             />
           </View>
           <View style={styles.modalContainer}>
           {selectedVisitor && (
  <Formik
    enableReinitialize
    initialValues={{
      firstName: selectedVisitor.first_name || '',
      email: selectedVisitor.email || '',
      contact: selectedVisitor.contact || '',
      guestfrom:  '', 
      purpose:  '', 
      user_id: '', 
    }}
    validationSchema={validationSchema}
    onSubmit={handleSubmit}
  >
               {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                 <View style={styles.form}>
                   <RNTextInput
                     style={styles.input}
                     placeholder="Enter full name"
                     onChangeText={(value) => setFieldValue('firstName', filterInput(value, /[^a-zA-Z_ ]/g))}
                     onBlur={handleBlur('firstName')}
                     value={values.firstName}
                   />
                           

                   {errors.firstName && touched.firstName ? (
                     <Text style={styles.errorText}>{errors.firstName}</Text>
                   ) : null}
                  
                  <RNTextInput
                    style={styles.input}
                    placeholder="Enter contact number"
                    onChangeText={(value) => setFieldValue('contact', filterInput(value, /[^0-9]/g))}
                    onBlur={handleBlur('contact')}
                    value={values.contact}
                    inputMode="tel"
                    maxLength={10}
                  />
                   {errors.contact && touched.contact ? (
                     <Text style={styles.errorText}>{errors.contact}</Text>
                   ) : null}
                   <RNTextInput
                     style={styles.input}
                     placeholder="Enter email"
                     onChangeText={handleChange('email')}
                     onBlur={handleBlur('email')}
                     value={values.email}
                     keyboardType="email-address"
                   />
                   {errors.email && touched.email ? (
                     <Text style={styles.errorText}>{errors.email}</Text>
                   ) : null}
                   <RNTextInput
                     style={styles.input}
                     placeholder="Enter from"
                     onChangeText={handleChange('guestfrom')}
                     onBlur={handleBlur('guestfrom')}
                     value={values.guestfrom}
                   />
                   {errors.guestfrom && touched.guestfrom ? (
                     <Text style={styles.errorText}>{errors.guestfrom}</Text>
                   ) : null}
                   <RNTextInput
                     style={styles.input}
                     placeholder="Enter purpose of visit"
                     onChangeText={handleChange('purpose')}
                     onBlur={handleBlur('purpose')}
                     value={values.purpose}
                     multiline
                     numberOfLines={2}
                   />
                   {errors.purpose && touched.purpose ? (
                     <Text style={styles.errorText}>{errors.purpose}</Text>
                   ) : null}
                   <View>
                     <select style={styles.select}
                       value={values.user_id}
                       onChange={handleChange('user_id')}
                       required
                     >
                       <option value="">Select an employee</option>
                       {empList.map(emp => (
                         <option key={emp.id} value={emp.id}>
                           {emp.first_name} {emp.last_name}
                         </option>
                       ))}
                     </select>
                   </View>
                   {errors.user_id && touched.user_id ? (
                     <Text style={styles.errorText}>{errors.user_id}</Text>
                   ) : null}
                   <TouchableOpacity style={styles.buttonSubmit} onPress={handleSubmit as any}>
                     <Text style={styles.buttonText}>Submit</Text>
                   </TouchableOpacity>
                 </View>
               )}
             </Formik>
           )}
             <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Visitor History</Text>
          <View style={styles.historyTable}>
            {visitorHistory.length > 0 ? (
              <>
                <View style={styles.historyRow}>
                  <Text style={styles.historyHeaderCell}>Date</Text>
                  <Text style={styles.historyHeaderCell}>Check-in</Text>
                  <Text style={styles.historyHeaderCell}>Check-out</Text>
                  <Text style={styles.historyHeaderCell}>Purpose</Text>
                </View>
                {visitorHistory.map((entry, index) => (
                  <View key={index} style={styles.historyRow}>
                    <Text style={styles.historyCell}>{formatDate(entry.attendance_date)}</Text>
                    <Text style={styles.historyCell}>{formatTime(entry.check_in_time)}</Text>
                    <Text style={styles.historyCell}>{formatTime(entry.last_check_in)}</Text>
                    <Text style={styles.historyCell}>{entry.purpose_of_visit || 'N/A'}</Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.noVisitorsCard}>
                <Text style={styles.historyCell} >No history, new visitor here!</Text>
              </View>
            )}
          </View>
        </View>
                
           </View>
          
         </ScrollView>
         {!isKeyboardVisible && (
             <div className="footer">
               <FaArrowLeft className="footer-icon" onClick={handleNavigateToVisitors} />
               <FaHome className="footer-icon" onClick={handleNavigateToVisitors} />
               <FaBell className="footer-icon" />
             </div>
           )}
       </Modal>
       
        )}
      </ScrollView>
   
    </View>
    <div className="footer">
      <FaBell className="footer-icon" />
      <FaHome className="footer-icon" onClick={() => navigate('/Visitors')}/>
      <FaPowerOff className="footer-icon" onClick={handleLogout} />
    </div>

    <Modal
        visible={isModalOpen}
        transparent={true}
        onRequestClose={closeModal}
      >
      
        <View style={styles.modalBackground}>
    <View style={styles.modalContainer_guest_status}>
      {selectedGuest && (
        <View style={styles.modalContent}>
          <View style={styles.modalHeader_guest_status}>
            <Image
              style={styles.modalAvatar}
              source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedGuest.detected_face}` }}
            />
            <Text style={styles.modalTextName}>{selectedGuest.first_name}</Text>
            <Text style={styles.modalTextSub}>{formatDate(selectedGuest.first_check_in)}</Text>
          </View>
          <View style={styles.modalDetails}>
            <Text style={styles.modalDetailText}><FaPhone style={styles.modalIcon} /> {selectedGuest.contact || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaEnvelope style={styles.modalIcon} /> {selectedGuest.email || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaHome style={styles.modalIcon} /> {selectedGuest.guestfrom || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaBriefcase style={styles.modalIcon} /> {selectedGuest.purpose_of_visit || 'N/A'}</Text>
            <Text style={styles.modalDetailText}><FaUser style={styles.modalIcon} /> {selectedGuest.user_first_name || 'N/A'}</Text>
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
  wrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    marginTop: 0, 
    paddingBottom: 50, 
  },
  employeeDetailsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    padding: 10,
    borderRadius: 8,
    marginTop:-5,
  },
  modalHeader_guest_status: {
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
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
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
  buttonSubmit: {
    backgroundColor: 'rgb(126 24 24)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeContainer: {
    alignItems: 'flex-start',
   width:'72%',
   padding:5,
    marginBottom: 0,
    borderRadius:5,
    backgroundColor: 'rgb(239 239 239)',
  },
  timeContainerdiv:{
    marginLeft:0,
  },
  timeText: {
    fontSize: 12,
  },
  select :{
  marginBottom:15,
  },
  cardContainer: {
    flexDirection: 'column',
    marginBottom: 0,
    marginTop:0,
  },
  card: {
    width: '100%',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginBottom:10,
    marginTop:5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 0,
  }, 
  cardValue: {
    fontSize: 12,
  },
  visitorCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 0,
    marginTop:10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
    
  },
  info: {
    flex: 1,
  },
  visitorTitle: {
    fontSize: 18,

  },
  text: {
    fontSize: 14,

  },
  dateStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textStatus: {
    fontSize: 14,
    textAlign: 'right', 

  },
  textName: {
    fontSize: 16,
  },
  
  textdate: {
    fontSize: 14,
    color:'#818589',
  },
  noVisitorsCard: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginLeft:5,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    width:'98%',
  
  },
  noVisitorsText: {
    fontSize: 14,
    color: '#000',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:20,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: 'rgb(224 224 225)', 
    padding: 30,
    width: '90%',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'rgb(224 224 225)',
    borderRadius: 10,
    marginTop: -30, 
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    
  },
  modalContainer_guest_status: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 0,
    marginTop:-70,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor:'#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop:10,
  },
 
  button: {
    backgroundColor: 'rgb(126, 24, 24)', 
    color: '#fff', 
    padding: 5,
    borderRadius: 5,
    borderWidth: 0,
  },
  buttonDisabled: {
    backgroundColor: '#f0f0f0', 
    color: '#ccc', 
    padding: 5,
    borderRadius: 5,
    borderWidth: 0,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer_guest: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalAvatar_guest: {
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
    textAlign: 'center',
    alignItems: 'center',
  },

  historyContainer: {
    marginTop: 20,
    width: '100%',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyCell: {
    width: '25%',
    textAlign: 'center',
    fontSize: 14,
  },
  historyHeaderCell: {
    width: '25%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },

});

export default Visitors;
