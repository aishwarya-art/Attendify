import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import Navigation from './Navigation'; // Import the Navigation component
import Footer from './Footer'; // Import the Footer component
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VisitorData {
  detected_face: string;
  first_check_in: string;
  id: string;
  email?: string;
  name?: string;
  contact?: string;
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [user_id, setUserId] = useState('');
  const [guestfrom, setGuestFrom] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalvisitorCount, setVisitorCounts] = useState(0);
  const [visitorStatusCount, setVisitorStatusCount] = useState(0);

  const [currentTime, setCurrentTime] = useState(new Date());

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

    fetchVisitorCounts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (visitor: VisitorData) => {
    console.log("Card clicked:", visitor);
    setSelectedVisitor(visitor);
    // Reset the form fields
    setFirstName('');
    setLastName('');
    setContact('');
    setEmail('');
    setUserId('');
    setGuestFrom('');
    setPurpose('');
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !contact || !purpose) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('purpose', purpose);
    formData.append('guestID', selectedVisitor!.id);
    formData.append('email', email);
    formData.append('contact', contact);
    formData.append('guestfrom', guestfrom);
    formData.append('user_id', user_id);

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
        setSubmitted(true);
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

  return (
    <View style={styles.wrapper}>
      <Navigation />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Employees</Text>
            <Text style={styles.cardValue}>{employeeCount}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Visitors</Text>
            <Text style={styles.cardValue}>{totalvisitorCount}</Text>
          </View>
        </View>
        <Text>Action Required</Text>
        {data.length > 0 ? (
          data.map((visitor, index) => (
            <TouchableOpacity key={index} onPress={() => handleCardClick(visitor)} style={styles.visitorCard}>
              <Image
                style={styles.avatar}
                source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${visitor.detected_face}` }}
              />
              <View style={styles.info}>
              <Text style={styles.visitorTitle}>Visitor: {index + 1}</Text>
                <Text style={styles.text}><b>In</b>: {visitor.first_check_in}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noVisitorsCard}>
            <Text style={styles.noVisitorsText}>No visitors today!</Text>
          </View>
        )}
        <Text>Dashboard</Text>
        {guestList.length > 0 ? (
          guestList.map((guest, index) => (
            <View key={index} style={styles.visitorCard}>
              <Image
                style={styles.avatar}
                source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${guest.detected_face}` }}
              />
              <View style={styles.info}>
                <Text style={styles.visitorTitle}>{guest.first_name}</Text>
                <Text style={styles.text}><b>In</b>: {guest.first_check_in}</Text>
                <Text
                  style={[
                    styles.text,
                    { color: guest.status == 1 ? 'green' : guest.status == 2 ? 'red' : 'black' },
                  ]}
                ><b>
                  {guest.status == 1 ? 'Accepted' : guest.status == 2 ? 'Rejected' : 'Pending'}</b>
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noVisitorsCard}>
            <Text style={styles.noVisitorsText}>No visitors today!</Text>
          </View>
        )}
        {selectedVisitor && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={!!selectedVisitor}
            onRequestClose={() => setSelectedVisitor(null)}
          >
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Visitor Details</Text>
                <Image
                  style={styles.modalAvatar}
                  source={{ uri: `https://vision.techkshetra.ai/faceRecognitionEngine/faces/${selectedVisitor.detected_face}` }}
                />
                <View style={styles.form}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter contact number"
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter from"
                    value={guestfrom}
                    onChangeText={setGuestFrom}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter purpose of visit"
                    value={purpose}
                    onChangeText={setPurpose}
                    multiline
                    numberOfLines={3}
                  />
                  <View>
                    <select
                      value={user_id}
                      onChange={(e) => setUserId(e.target.value)}
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
                  <Button title="Submit" onPress={handleSubmit} />
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    // height:100,
    // overflow: 'scroll',
  },
  
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    marginTop: 0, // Added to account for the fixed navbar height
    paddingBottom: 50, // Added to account for the fixed footer height
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 18,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '45%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
  },
  visitorCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  visitorTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
  },
  noVisitorsCard: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  noVisitorsText: {
    fontSize: 18,
    color: '#888',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
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
    marginBottom: 20,
    alignSelf: 'center',
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default Visitors;