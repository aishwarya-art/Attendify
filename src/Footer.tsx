// Footer component with fixed position
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FaPhone, FaHome, FaPowerOff,FaBell } from 'react-icons/fa';
import './Login.css';
const Footer: React.FC = () => {
  return (
    <View style={styles.footer1}>
      <TouchableOpacity>
        <FaBell style={styles.footerIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <FaHome style={styles.footerIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <FaPowerOff style={styles.footerIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eaeaea',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginTop:20,
    
  },
  footerIcon: {
    fontSize: 24,
    color: '#000',
  },
});

export default Footer;