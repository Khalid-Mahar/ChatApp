import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, AppState} from 'react-native';
import {LanguageProvider} from './app/languages/LanguageContext';
import AuthNavigator from './app/navigations/AuthNavigation';
import {NavigationContainer} from '@react-navigation/native';
import Splash from './app/screens/Splash';
import AppNavigation from './app/navigations/AppNavigation';
import localeKeys from './app/config/localeKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import AuthContext from './app/auth/AuthContext';
import auth from '@react-native-firebase/auth';
import firebaseKeys from './app/config/firebaseKeys';
const App = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [user, setUser] = useState(null);
  useEffect(() => {
    checkUserStatus();
    setTimeout(() => {
      setShowSplash(true);
    }, 1000);
  }, []);

  const checkUserStatus = async () => {
    const status = await auth().currentUser;
    if (status !== null && status !== '') {
      setUser(status);
    } else {
      setUser(null);
    }
  };

  // const handleUserOnlineStatus = async val => {
  //   try {
  //     if (val !== 'offline') {
  //       await firestore()
  //         .collection(firebaseKeys.user)
  //         .doc(auth().currentUser.uid)
  //         .update({activeStatus: val});
  //     } else {
  //       await firestore()
  //         .collection(firebaseKeys.user)
  //         .doc(auth().currentUser.uid)
  //         .update({activeStatus: firestore.FieldValue.serverTimestamp()});
  //     }
  //   } catch (error) {
  //     console.log(
  //       '======ERROR IN UPDATING USER ONLINE AND OFFLINE STATUS=====',
  //       error,
  //     );
  //   }
  // };
  return (
    <LanguageProvider>
      {showSplash ? (
        <AuthContext.Provider value={{user, setUser}}>
          <NavigationContainer>
            {user ? <AppNavigation /> : <AuthNavigator />}
          </NavigationContainer>
        </AuthContext.Provider>
      ) : (
        <Splash />
      )}
    </LanguageProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
  },
});

// org.reactjs.native.example.PawNest;
