import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import OneSignal from 'react-native-onesignal';
import Login from './src/Login';
import Dashboard from './src/Dashboard';
import Visitors from './src/Visitors';
import Navigation from './src/Navigation';
import Navigation_Emp from './src/Navigation_Emp';
import Dashboard_HR from './src/Dashboard_HR';
import Dashboard_Rec from './src/Dashboard_Rec';
import Dashboard_Emp from './src/Dashboard_Emp';
import Dashboard_new from './src/Dashboard_new';
import Attendance from './src/Attendance';
import Guest from './src/Guest';
import Approval from './src/Approval';
import GuestsNew from './src/GuestsNew';
import Profile from './src/Profile';
const App: React.FC = () => {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visitors" element={<Visitors />} />
        <Route path="/Navigation" element={<Navigation />} />
        <Route path="/Navigation_Emp" element={<Navigation_Emp />} />
        <Route path="/Dashboard_HR" element={<Dashboard_HR />} />
        <Route path="/Dashboard_Rec" element={<Dashboard_Rec />} />
        <Route path="/Dashboard_Emp" element={<Dashboard_Emp />} />
        <Route path="/Dashboard_new" element={<Dashboard_new />} />
        <Route path="/Attendance" element={<Attendance />} />
        <Route path="/Guest" element={<Guest />} />
        <Route path="/Approval" element={<Approval />} />
        <Route path="/GuestsNew" element={<GuestsNew />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
