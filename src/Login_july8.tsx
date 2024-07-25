import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './Login.css'; // Import the CSS file


const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loginType, setLoginType] = useState('1'); // State for login type
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'danger' | 'success'>('danger');
  const navigate = useNavigate();


  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        const department = await AsyncStorage.getItem('department');
        if (department === '5') {
          navigate('/Visitors');
        } else if (department === '2') {
          navigate('/Dashboard_HR');
        } else {
          navigate('/Dashboard_Emp');
        }
      }
    };
    checkUserLoggedIn();
  }, [navigate]);
  const generateRandomCaptcha = () => {
    const strResult = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += strResult.charAt(Math.floor(Math.random() * strResult.length));
    }
    return rand;
  };


  function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function handleEmailBlur() {
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  }
  const refreshCaptcha = () => {
    const newCaptchaValue = generateRandomCaptcha();
    setCaptcha(newCaptchaValue);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleLogin = async () => {
    if (!email) {
      setAlertVariant('danger');
      setAlertMessage('Email is required');
      return;
    }

    if (!password) {
      setAlertVariant('danger');
      setAlertMessage('Password is required');
      return;
    }

    // if (!captchaInput) {
    //   setAlertVariant('danger');
    //   setAlertMessage('CAPTCHA is required');
    //   return;
    // }

    // if (captchaInput !== captcha) {
    //   setAlertVariant('danger');
    //   setAlertMessage('CAPTCHA does not match');
    //   refreshCaptcha();
    //   return;
    // }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('login_type', '2');

      const response = await axios.post(
        'https://dev.techkshetra.ai/office_webApi/public/index.php/Login_api/verify_login',
        formData,
        {
          headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" }
        }
      );

      if (response.data.status) {
        const userDetails = {
          token: response.data.token,
          user_id: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          contact: response.data.contact,
          employe_code: response.data.code,
          level_id: response.data.level_id,
          designation: response.data.designation,
          access_val: response.data.access_val,
          department: response.data.department,
          departmentname: response.data.department_name,
          reporting_to: response.data.reporting_to,
          profile: response.data.user_profile
        };

        for (const [key, value] of Object.entries(userDetails)) {
          await AsyncStorage.setItem(key, value);
        }

        console.log('User details:', userDetails);
        
        // navigate('/dashboard');

        if (userDetails.department === '5') {
          navigate('/Visitors');
        } else if (userDetails.department === '2') {
          navigate('/Dashboard_HR');
        } else {
          navigate('/Dashboard_Emp');
        }
      } else {
        setAlertVariant('danger');
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertVariant('danger');
      setAlertMessage('Some error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* <h1 className="login-title">Attendify</h1> */}
        <img src={'https://techkshetra.ai/Attendify/images/attendify_new_logo.png'} alt="Logo" className="login-logo" /> 
        {alertMessage && (
          <div className={`alert ${alertVariant}`}>
            {alertMessage}
          </div>
        )}
       
       <div className="input-group" style={{ position: 'relative' }}>
  <input
    className="input"
    type="text"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    onBlur={handleEmailBlur}
    maxLength={50}
  />
  <label className="user-label">Email</label>
  {/* {emailError && <span className="error-message">{emailError}</span>} */}
</div>

<div className="input-group" style={{ position: 'relative' }}>
  <input
    className="input"
    type={passwordVisible ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    maxLength={20}
  />
   <label className="user-label">Password</label>
  <span className="password-toggle" onClick={() => setPasswordVisible(!passwordVisible)}>
    <i className={passwordVisible ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
      {/* {passwordVisible ? "👁" : "🙈"} */}
  </span>
 
</div>

<div className="input-group" style={{ position: 'relative' }}>
  <input
    className="input"
    type="text"
    value={captchaInput}
    onChange={(e) => setCaptchaInput(e.target.value)}
    required
    maxLength={6}
  />
  <label className="user-label">Captcha</label>
  <span className="captcha">{captcha}</span>
  <span className="refresh-captcha" onClick={refreshCaptcha}>&#x21bb;</span>
  
</div>

        {/* <div className="select-group">
          <select value={loginType} onChange={(e) => setLoginType(e.target.value)}>
            <option value="1">Authorities</option>
            <option value="2">Employees</option>
          </select>
        </div> */}
        <button className="login-button" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <a href="#" className="sign-up-link">Forgot Password?</a>
      </div>
  
      <footer className="footer_login">
        © Attendify 2024 | Powered by Techkshetra Info Solutions Pvt. Ltd
      </footer>
    </div>
  );
};

export default Login;
