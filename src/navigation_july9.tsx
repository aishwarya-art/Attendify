import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigate } from 'react-router-native'; // Use `react-router-native` for navigation in React Native apps
import AsyncStorage from '@react-native-async-storage/async-storage';

const Navigation = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigate('/');
          } catch (error) {
            console.error('Error clearing local storage:', error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.logo}>
        <Image
          source={{ uri: 'https://app.attendify.ai/logos/attendify_logo.png' }}
          style={styles.navigationLogo}
        />
      </View>
      <TouchableOpacity style={styles.menuIcon} onPress={handleShowNavbar}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      <View style={[styles.navElements, showNavbar && styles.active]}>
        <TouchableOpacity onPress={() => navigate('/Visitors')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('/Guest')}>
          <Text style={styles.navText}>Visitors</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('/contact')}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
  },
  logo: {},
  navigationLogo: {
    marginTop: 10,
    width: 42,
    height: 42, // Adjust height to maintain aspect ratio
  },
  menuIcon: {
    display: 'flex',
    cursor: 'pointer',
  },
  menuText: {
    fontSize: 24,
  },
  navElements: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2f234f',
    marginHorizontal: 15,
  },
  active: {
    width: 130,
    marginTop: 10,
   
  },

});


export default Navigation;
