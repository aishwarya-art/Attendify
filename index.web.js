import { AppRegistry } from 'react-native';
import App from './App';  // Ensure App.tsx exists
import { name as appName } from './app.json';
import { createRoot } from 'react-dom/client';
// import '@fortawesome/fontawesome-free/css/all.min.css';

const rootTag = document.getElementById('root') || document.getElementById(appName);
createRoot(rootTag).render(<App />);
