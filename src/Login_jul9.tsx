import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <img src={'https://techkshetra.ai/Attendify/images/attendify_new_logo.png'} alt="Logo" style={styles.loginLogo} /> 
        {alertMessage && (
          <div style={alertVariant === 'danger' ? styles.alertDanger : styles.alertSuccess}>
            {alertMessage}
          </div>
        )}
       
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onBlur={handleEmailBlur}
            maxLength={50}
            style={styles.input}
          />
          <label style={styles.userLabel}>Email</label>
        </div>

        <div style={styles.inputGroup}>
          <input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={20}
            style={styles.input}
          />
          <label style={styles.userLabel}>Password</label>
          <span onClick={() => setPasswordVisible(!passwordVisible)} style={styles.passwordToggle}>
            <i className={passwordVisible ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
          </span>
        </div>

        <div style={styles.inputGroup}>
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
            maxLength={6}
            style={styles.input}
          />
          <label style={styles.userLabel}>Captcha</label>
          <span style={styles.captcha}>{captcha}</span>
          <span onClick={refreshCaptcha} style={styles.refreshCaptcha}>&#x21bb;</span>
        </div>

        <button onClick={handleLogin} disabled={isLoading} style={isLoading ? styles.loginButtonDisabled : styles.loginButton}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <a href="#" style={styles.signUpLink}>Forgot Password?</a>
      </div>
  
      <footer style={styles.footerLogin}>
        © Attendify 2024 | Powered by Techkshetra Info Solutions Pvt. Ltd
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: 
      'linear-gradient(rgba(232, 232, 232, 0.2), rgba(226, 226, 226, 0.2)), url("https://img.freepik.com/free-vector/line-wave-background-gradient-style-template_483537-5121.jpg")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  loginBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(5px)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '300px',
    marginBottom: '20px', 
  },
  loginLogo: {
    height: 'auto',
    width: '280px',
    marginBottom: '10px',
  },
  alertDanger: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '15px',
  },
  input: {
    border: 'solid 1.5px #9e9e9e',
    borderRadius: '4px',
    background: 'none',
    padding: '0.8rem',
    fontSize: '1rem',
    color: '#080808',
    transition: 'border 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    width: '89%',
  },
  userLabel: {
    position: 'absolute',
    left: '15px',
    color: '#9e9e9e',
    pointerEvents: 'none',
    transform: 'translateY(1rem)',
    transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    marginTop: '-5px',
  },
  passwordToggle: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
  },
  captcha: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#eee',
    padding: '5px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  refreshCaptcha: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
  },
  loginButton: {
    width: '98%',
    padding: '10px',
    backgroundColor: '#8d1727',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  loginButtonDisabled: {
    width: '98%',
    padding: '10px',
    backgroundColor: '#dd4e61',
    cursor: 'not-allowed',
  },
  signUpLink: {
    display: 'block',
    marginTop: '10px',
    color: '#830939',
    textDecoration: 'none',
  },
  footerLogin: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    padding: '10px 0',
    color: '#303030',
    fontSize: '10px',
    position: 'fixed',
    bottom: '0',
  }
};

export default Login;
