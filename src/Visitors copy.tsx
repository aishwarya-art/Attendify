import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import Navigation from './Navigation'; // Import the Navigation component
import Footer from './Footer'; // Import the Footer component
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VisitorData {
  detected_face: string;
  first_check_in: string;
  id: string;
  email?: string;
  name?: string;
  contact?: string;
}

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
}

const Visitors: React.FC = () => {
  const [data, setData] = useState<VisitorData[]>([]);
  const [empList, setEmpList] = useState<EmployeeData[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [user_id, setUserId] = useState('');
  const [guestfrom, setGuestFrom] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        const response = await axios.get('https://dev.techkshetra.ai/office_webApi/public/index.php/Guest/index?user_id=1');
        setData(response.data.data);
        console.log("Visitor data fetched:", response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchVisitorData();
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
      } else {
        console.error('Error submitting data:', response);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleAccept = async (id: string) => {
    console.log("Accepted visitor with ID:", id);
    setSelectedVisitor(null);
  };

  const handleReject = async (id: string) => {
    console.log("Rejected visitor with ID:", id);
    setSelectedVisitor(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Navigation />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Visitors</Text>
        {data.map((visitor, index) => (
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
        ))}
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
                    {/* <Text>To Meet</Text> */}
                    <select
                      value={user_id}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                    >
                      <option value="">Select to Meet</option>
                      {empList.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </select>
                  </View>
                  {!submitted && (
                    <Button title="Submit" onPress={handleSubmit} />
                  )}
                  {submitted && (
                    <View style={styles.buttonContainer}>
                      <Button title="Accept" onPress={() => handleAccept(selectedVisitor!.id)} />
                      <Button title="Reject" onPress={() => handleReject(selectedVisitor!.id)} />
                    </View>
                  )}
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
  container: {
    flex: 1,
    padding: 20,
    marginTop: 0, // Added to account for the fixed navbar height
    marginBottom: 50, // Added to account for the fixed footer height
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
