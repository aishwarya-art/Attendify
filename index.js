/**
 * @format
 */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);
// index.js
import React, { useEffect } from 'react';
import { AppRegistry, Alert } from 'react-native';
import OneSignal from 'react-native-onesignal';
import App from './App'; // or the main file of your React Native app
import { name as appName } from './app.json';

const MyApp = () => {
  useEffect(() => {
    try {
      // OneSignal Initialization
      OneSignal.initialize("0d95dddf-d27f-46a8-a2b9-e43a744b6423");
      window.alert("OneSignal Initialized");

      // Set log level to get more information about the initialization process
      OneSignal.setLogLevel(6, 0);
      window.alert("Log Level Set");

      // Request permission for notifications
      OneSignal.promptForPushNotificationsWithUserResponse();
      window.alert("Requested Notification Permission");

      // Listener for notification click events
      OneSignal.setNotificationOpenedHandler((notification) => {
        console.log('OneSignal: notification clicked:', notification);
        window.alert("Notification Clicked: " + JSON.stringify(notification));
      });

    } catch (error) {
      window.alert("OneSignal Initialization Error: " + error.message);
      console.error("OneSignal Initialization Error", error);
    }
  }, []);

  return <App />;
};

AppRegistry.registerComponent(appName, () => MyApp);
