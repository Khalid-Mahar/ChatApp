import React from 'react';
import auth from '@react-native-firebase/auth';
import AuthContext from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localeKeys from '../config/localeKeys';
const useAuth = () => {
  const {user, setUser} = React.useContext(AuthContext);
  const Login = data => {
    setUser(data);
  };

  const Logout = async () => {
    await AsyncStorage.setItem(localeKeys.user, '');
    try {
      await auth().signOut();
      setUser(null);
    } catch (error) {
      console.log('=====ERROR IN LOGOUT=====', error);
    }
  };

  return {Login, user, setUser, Logout};
};

export default useAuth;
