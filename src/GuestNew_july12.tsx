import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, TouchableOpacity, FlatList, Modal, Alert, StyleSheet,Dimensions } from 'react-native';
import axios from 'axios';
import { FaCheck, FaTimes, FaArrowLeft, FaHome, FaPowerOff, FaBell } from 'react-icons/fa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

// Define screen height
const screenHeight = Dimensions.get('window').height;

// Define types for guest data
interface GuestData {
  guestid: string;
  guest_photo: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  check_in_time: string;
}

interface RecordData {
  id: string;
  detected_face: string;
  attendance_date: string;
  first_check_in: string;
  last_check_in: string;
  guestfrom: string;
  emp_firstname: string;
  emp_lastname: string;
  purpose_of_visit: string;
}
interface VisitorData {
  // detected_face: string;
  // first_check_in: string;
  // id: string;
  // email?: string;
  // name?: string;
  // first_name?: string;
  // contact?: string;
  // guestid: string;
  guestid: string;
  guest_photo: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  check_in_time: string;
}
const GuestsNew: React.FC = () => {
  const [capturedVisitors, setCapturedVisitors] = useState<GuestData[]>([]);
  const [identifiedVisitors, setIdentifiedVisitors] = useState<GuestData[]>([]);
  const [trustedVisitors, setTrustedVisitors] = useState<GuestData[]>([]);
  const [filteredCapturedVisitors, setFilteredCapturedVisitors] = useState<GuestData[]>([]);
  const [filteredIdentifiedVisitors, setFilteredIdentifiedVisitors] = useState<GuestData[]>([]);
  const [filteredTrustedVisitors, setFilteredTrustedVisitors] = useState<GuestData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [personalDetails, setPersonalDetails] = useState<any>({});
  const [records, setRecords] = useState<RecordData[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string>('');

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [guestId, setGuestId] = useState<string>('');
  const [gid, setGId] = useState<string>('');
  const [oldImagename, setOldImage] = useState<string>('');

  const [editingRecordIdFrom, setEditingRecordIdFrom] = useState<string | null>(null);
  const [editingRecordIdPurpose, setEditingRecordIdPurpose] = useState<string | null>(null);
  const [newPurposeOfVisit, setNewPurposeOfVisit] = useState<string>('');
  const [newFrom, setNewFrom] = useState<string>('');

  const itemsPerPage = 5; // For captured visitors
  const itemsPerPagethree = 3; // For identified and trusted visitors
  const [currentPageCaptured, setCurrentPageCaptured] = useState<number>(0);
  const [currentPageIdentified, setCurrentPageIdentified] = useState<number>(0);
  const [currentPageTrusted, setCurrentPageTrusted] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();
  const [data, setData] = useState<VisitorData[]>([]);
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
    const fetchUserId = async () => {
      const storedId = await AsyncStorage.getItem('cid'); // Replace with appropriate storage method in React Native
      setUserId(storedId);
      fetchData(storedId);
    };
    fetchUserId();
  }, []);

  const fetchData = async (storedId: string | null) => {
    try {
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/get_knownguest_records?user_id=${storedId}`);
      setCapturedVisitors(response.data.captured);
      setIdentifiedVisitors(response.data.identified);
      setTrustedVisitors(response.data.trusted);
      setFilteredCapturedVisitors(response.data.captured);
      setFilteredIdentifiedVisitors(response.data.identified);
      setFilteredTrustedVisitors(response.data.trusted);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleShow = async (guestId: string) => {
    try {
      const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/get_guestdata?guestID=${guestId}`);
      const guestData = response.data;

      if (guestData) {
        setPersonalDetails(guestData.info || {});
        setCurrentImage(guestData.cimg || '');
        setOriginalImage(guestData.cimg || '');
        setRecords(guestData.dataforList || []);

        setFirstName(guestData.info?.first_name || '');
        setLastName(guestData.info?.last_name || '');
        setEmail(guestData.info?.email || '');
        setContact(guestData.info?.contact || '');
        setGuestId(guestData.info?.guestid || '');
        setGId(guestData.info?.id || '');
        setOldImage(guestData.cimgvalue || '');

        setShowModal(true);
      } else {
        console.error('No guest data returned');
      }
    } catch (error) {
      console.error('Error fetching guest details:', error);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('contact', contact);
    formData.append('guestid', guestId);
    formData.append('gid', gid);
    formData.append('oldImagename', oldImagename);

    try {
      const response = await axios.post(
        `https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/update_guestByID`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      Alert.alert('Success', 'Guest details updated successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating guest details:', error);
    }
  };

  const handleEditClickFrom = (record: RecordData) => {
    setEditingRecordIdFrom(record.id);
    setNewFrom(record.guestfrom);
    setNewPurposeOfVisit(record.purpose_of_visit);
    setEditingRecordIdPurpose(null);
  };

  const handleEditClickPurpose = (record: RecordData) => {
    setEditingRecordIdPurpose(record.id);
    setNewFrom(record.guestfrom);
    setNewPurposeOfVisit(record.purpose_of_visit);
    setEditingRecordIdFrom(null);
  };

  const handleSaveClick = async (recordId: string) => {
    try {
      const formDataGuest = new FormData();
      formDataGuest.append('id', recordId);
      formDataGuest.append('from', newFrom);
      formDataGuest.append('purpose_of_visit', newPurposeOfVisit);

      const response = await axios.post(
        `https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/update_guestRecord`,
        formDataGuest,
        {
          headers: {
            'Content-Type': 'form-data',
          },
        }
      );

      setRecords(records.map(record => {
        if (record.id === recordId) {
          return { ...record, guestfrom: newFrom, purpose_of_visit: newPurposeOfVisit };
        }
        return record;
      }));

      setEditingRecordIdFrom(null);
      setEditingRecordIdPurpose(null);
      setNewFrom('');
      setNewPurposeOfVisit('');
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleCancelClickFrom = () => {
    setEditingRecordIdFrom(null);
    setNewFrom('');
  };

  const handleCancelClickPurpose = () => {
    setEditingRecordIdPurpose(null);
    setNewPurposeOfVisit('');
  };

  const handleNextPageCaptured = () => {
    if ((currentPageCaptured + 1) * itemsPerPage < filteredCapturedVisitors.length) {
      setCurrentPageCaptured(currentPageCaptured + 1);
    }
  };

  const handlePreviousPageCaptured = () => {
    if (currentPageCaptured > 0) {
      setCurrentPageCaptured(currentPageCaptured - 1);
    }
  };

  const handleNextPageIdentified = () => {
    if ((currentPageIdentified + 1) * itemsPerPagethree < filteredIdentifiedVisitors.length) {
      setCurrentPageIdentified(currentPageIdentified + 1);
    }
  };

  const handlePreviousPageIdentified = () => {
    if (currentPageIdentified > 0) {
      setCurrentPageIdentified(currentPageIdentified - 1);
    }
  };

  const handleNextPageTrusted = () => {
    if ((currentPageTrusted + 1) * itemsPerPagethree < filteredTrustedVisitors.length) {
      setCurrentPageTrusted(currentPageTrusted + 1);
    }
  };

  const handlePreviousPageTrusted = () => {
    if (currentPageTrusted > 0) {
      setCurrentPageTrusted(currentPageTrusted - 1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterData(query, selectedDate);
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    filterData(searchQuery, date);
  };

  useEffect(() => {
    const fetchVisitorData = async () => {
      const cid = await AsyncStorage.getItem('cid');
      try {
        const response = await axios.get(`https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/get_knownguest_records?user_id=${cid}`);
        // setData(response.data.data);
        setData(response.data.identified);
        console.log("Identified data fetched:", response.data.identified);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchVisitorData();
    
  }, []);
  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPagethree < data.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const visibleVisitors = data.slice(currentPage * itemsPerPagethree, (currentPage + 1) * itemsPerPagethree);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB');
  };

  const filterData = (query: string, date: string) => {
    const lowerCaseQuery = query.toLowerCase();
    const filteredCaptured = capturedVisitors.filter(visitor =>
      (visitor.first_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.last_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.email.toLowerCase().includes(lowerCaseQuery) ||
        visitor.contact.toLowerCase().includes(lowerCaseQuery)) &&
      (date ? new Date(visitor.check_in_time).toDateString() === new Date(date).toDateString() : true)
    );

    const filteredIdentified = identifiedVisitors.filter(visitor =>
      (visitor.first_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.last_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.email.toLowerCase().includes(lowerCaseQuery) ||
        visitor.contact.toLowerCase().includes(lowerCaseQuery)) &&
      (date ? new Date(visitor.check_in_time).toDateString() === new Date(date).toDateString() : true)
    );

    const filteredTrusted = trustedVisitors.filter(visitor =>
      (visitor.first_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.last_name.toLowerCase().includes(lowerCaseQuery) ||
        visitor.email.toLowerCase().includes(lowerCaseQuery) ||
        visitor.contact.toLowerCase().includes(lowerCaseQuery)) &&
      (date ? new Date(visitor.check_in_time).toDateString() === new Date(date).toDateString() : true)
    );

    setFilteredCapturedVisitors(filteredCaptured);
    setFilteredIdentifiedVisitors(filteredIdentified);
    setFilteredTrustedVisitors(filteredTrusted);
  };

  const currentCapturedData = filteredCapturedVisitors.slice(currentPageCaptured * itemsPerPage, (currentPageCaptured + 1) * itemsPerPage);
  const currentIdentifiedData = filteredIdentifiedVisitors.slice(currentPageIdentified * itemsPerPagethree, (currentPageIdentified + 1) * itemsPerPagethree);
  const currentTrustedData = filteredTrustedVisitors.slice(currentPageTrusted * itemsPerPagethree, (currentPageTrusted + 1) * itemsPerPagethree);

  return (
    <View   style={styles.containernew}>
      <Navigation />
      <View  style={styles.container} >
        <Text style={{  marginBottom: 10 }}>Captured Visitors</Text>
        {/* <Text>Captured Visitors</Text> */}
        <FlatList
          data={currentCapturedData}
          keyExtractor={(item) => item.guestid.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleShow(item.guestid)} style={{ marginBottom: 0, flexBasis: '20%' }}>
              <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${item.guest_photo}` }} style={styles.image} />
                <View style={styles.textContainer}>
                  <Text>{item.first_name} {item.last_name}</Text>
                  <Text>{item.email}</Text>
                  <Text>{item.contact}</Text>
                 
                  <Text>{item.check_in_time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          numColumns={5} // Display 5 visitors in a line
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
          <Button title="<<" onPress={handlePreviousPageCaptured} disabled={currentPageCaptured === 0} color="rgb(152, 5, 5)"/>
          <Button title=">>" onPress={handleNextPageCaptured} disabled={(currentPageCaptured + 1) * itemsPerPage >= filteredCapturedVisitors.length} color="rgb(152, 5, 5)"/>
        </View>

        <Text style={{ marginTop: 10, marginBottom: 0 }}>Identified Visitors</Text>
        {/* <Text >Identified Visitors</Text> */}
        {visibleVisitors.length > 0 ? (
            visibleVisitors.map((visitor, index) => (
             
              <TouchableOpacity key={index}  onPress={() => handleShow(visitor.guestid)}>
                 <View  style={styles.visitorCard}>
                <Image
                  style={styles.avatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${visitor.guest_photo}` }}
                />
                <View style={styles.info}>
               
                <View style={styles.dateStatusRow_name}>
                <Text style={styles.textName}><b>{visitor.first_name} {visitor.last_name}</b></Text>
                <Text style={styles.textContact}>{formatDate(visitor.check_in_time)}</Text>
               
                </View>
                <View style={styles.dateStatusRow_name}>
                <Text style={styles.secondrow}>{visitor.contact} </Text>
                <Text style={styles.secondrow}><b>{formatTime(visitor.check_in_time)}</b></Text>
              
             
                </View>
                <Text style={styles.textContact}>{visitor.email} </Text>
                {/* <Text>{visitor.check_in_time}</Text> */}
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
  <Button title=">>" onPress={handleNextPage} disabled={(currentPage + 1) * itemsPerPagethree >= data.length} color="rgb(152 5 5)" />
</View>
        
        <Text style={{ marginTop: 0, marginBottom: 10 }}>Trusted Visitors</Text>
        {/* <Text>Trusted Visitors</Text> */}
        <FlatList
          data={currentTrustedData}
          keyExtractor={(item) => item.guestid.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleShow(item.guestid)} style={{ marginBottom: 10 }}>
              <View style={styles.cardMargin}>
                <View style={styles.card}>
                  <Image source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/application/uploads/${item.guest_photo}` }} style={styles.image} />
                  <View style={styles.info}>
                  <View style={{ marginLeft: 16 }}>
                  
               
                <View style={styles.dateStatusRow_name}>
                <Text style={styles.textName}><b>{item.first_name} {item.last_name}</b></Text>
                <Text style={styles.textContact}>{formatDate(item.check_in_time)}</Text>
               
                </View>
                <View style={styles.dateStatusRow_name}>
                <Text style={styles.secondrow}>{item.contact} </Text>
                <Text style={styles.secondrow}><b>{formatTime(item.check_in_time)}</b></Text>
              
             
                </View>
                <Text style={styles.textContact}>{item.email} </Text>
                
                </View>
                </View>
                
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0,marginBottom:40}}>
          <Button title="<<" onPress={handlePreviousPageTrusted} disabled={currentPageTrusted === 0} color="rgb(152, 5, 5)"/>
          <Button title=">>" onPress={handleNextPageTrusted} disabled={(currentPageTrusted + 1) * itemsPerPagethree >= filteredTrustedVisitors.length} color="rgb(152, 5, 5)"/>
        </View>

        <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            {/* <Text style={styles.modalTitle}>Visitor Details</Text> */}
            {/* <Text>Visitor Details</Text> */}
            <Text style={{ marginTop: 0, marginBottom: 10 }}>Visitor Details</Text>
            <View style={styles.modalContentbox}>
            <View style={styles.modalContent}>
           
              <Image source={{ uri: currentImage }} style={styles.modalImage} />
              <View style={styles.modalDetails}>
                <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.modalInput} />
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.modalInput} />
                <TextInput placeholder="Contact" value={contact} onChangeText={setContact} style={styles.modalInput} />
                {/* <Button title="Save Changes"  onPress={handleSubmit} /> */}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
  <Text style={styles.buttonText}>Save Changes</Text>
</TouchableOpacity>

              </View>
            </View>
            </View>
           
            <Text style={{ marginTop: 10, marginBottom: -5 }}>Visitor History</Text>
            <FlatList
              data={records}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalHistoryItem}>
                  <Image source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${item.detected_face}` }} style={styles.modalHistoryImage} />
                  <View style={styles.modalHistoryDetails}>
                  <View style={styles.dateStatusRow_name}>
                    <Text style={styles.textName}><b>{formatDate(item.attendance_date)}</b></Text>
                    <Text>{(new Date(item.first_check_in)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {(new Date(item.last_check_in)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    {/* <Text></Text> */}
                    {editingRecordIdFrom === item.id ? (
                      <>
                        <TextInput value={newFrom} onChangeText={setNewFrom} style={styles.modalInput} />
                        <View style={styles.dateStatusRow_name}>
                        <TouchableOpacity onPress={() => handleSaveClick(item.id)}>
                          <FaCheck size={24} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelClickFrom}>
                          <FaTimes size={24} color="red" />
                        </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text onPress={() => handleEditClickFrom(item)} style={styles.modalInput}>{item.guestfrom || 'Enter From'}</Text>
                    )}
                    {/* <Text style={styles.modalInput}>To meet: {item.emp_firstname} {item.emp_lastname}</Text> */}
                    {editingRecordIdPurpose === item.id ? (
                      <>
                        <TextInput value={newPurposeOfVisit} onChangeText={setNewPurposeOfVisit} style={styles.modalInput} />
                        <View style={styles.dateStatusRow_name}>
                        <TouchableOpacity onPress={() => handleSaveClick(item.id)}>
                          <FaCheck size={24} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelClickPurpose}>
                          <FaTimes size={24} color="red" />
                        </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text onPress={() => handleEditClickPurpose(item)} style={styles.modalInput}>{item.purpose_of_visit || 'Enter Purpose'}</Text>
                    )}
                  </View>
                </View>
              )}
            />
           
          </View>
          <div className="footer">
              <FaArrowLeft className="footer-icon" onClick={() => navigate('/Guestnew')} />
              <FaHome className="footer-icon" onClick={() => navigate('/Visitors')} />
              <FaPowerOff className="footer-icon" onClick={handleLogout} />
            </div>
        </Modal>
      </View>
      <div className="footer">
        <FaBell className="footer-icon" />
        <FaHome className="footer-icon" onClick={() => navigate('/Visitors')} />
        <FaPowerOff className="footer-icon" onClick={handleLogout} />
      </div>
    </View>
  );
};


const styles = StyleSheet.create({
  container:{
    padding: 16,
    // marginBottom: 45,
    // backgroundColor:'#f0f6f7',
  },
  containernew:{
    flex: 1 ,
    backgroundColor:'#f1f4f4',
    minHeight: screenHeight, 
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'white',
  },
  textContainer: {
    alignItems: 'center',
    textAlign: 'center',
  },
  card: {
    width: '98%',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 5,
  },
  cardMargin: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor:'#f1f4f4',
   
    
    borderRadius: 8,
  },
  modalContentbox:{
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor:'#fff',
    padding: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: 'rgb(126, 24, 24)', 
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 110,
    borderRadius: 10,
    marginRight: 16,
  },
  modalDetails: {
    flex: 1,
   
  },
  // modalInput: {
  //   borderBottomWidth: 1,
  //   marginBottom: 16,
  // },
  modalInput: {
    width: '100%',
    padding: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor:'#fff',
  },
  modalHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor:'#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
    borderRadius: 8,
  },
  modalHistoryImage: {
    width: 100,
    height: 90,
    borderRadius: 10,
    marginRight: 16,
  },
  modalHistoryDetails: {
    flex: 1,
  },
  info: {
    flex: 1,
  },
  text: {
    fontSize: 14,

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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop:10,
    padding:5,
  },
  infoContainer: {
    flex: 1,
  },
  dateStatusRow_name: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    marginBottom:3,
    // borderTopWidth: 1,
    // borderTopColor: 'rgb(215 213 213)',
   
  },
  textName: {
    fontSize: 14,
    textTransform: 'uppercase', // Add this line to capitalize the first letter
  },
  textContact: {
    color: 'rgb(116 122 129)',
    fontSize: 14,
    
    // marginBottom: 3,
  },
  secondrow: {
    color: '#652828',
    fontSize: 14,
    fontWeight:500,
    // marginBottom: 3,
  },
});

export default GuestsNew;
