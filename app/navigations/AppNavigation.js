import {AppState, StyleSheet} from 'react-native';
import React, {useRef, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import screenNames from '../config/ScreenNames';
import screens from '../config/AllScreens';
import Tabbar from './Tabbar';
import firebaseKeys from '../config/firebaseKeys';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const stack = createNativeStackNavigator();
const AppNavigation = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
      if (appState.current == 'active') {
        handleUserOnlineStatus('online');
      } else {
        handleUserOnlineStatus('offline');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUserOnlineStatus = async val => {
    try {
      if (val == 'online') {
        await firestore()
          .collection(firebaseKeys.user)
          .doc(auth().currentUser.uid)
          .update({activeStatus: val});
      } else {
        await firestore()
          .collection(firebaseKeys.user)
          .doc(auth().currentUser.uid)
          .update({activeStatus: firestore.FieldValue.serverTimestamp()});
      }
    } catch (error) {
      console.log(
        '======ERROR IN UPDATING USER ONLINE AND OFFLINE STATUS=====',
        error,
      );
    }
  };
  return (
    <stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <stack.Screen name={screenNames.homeScreen} component={Tabbar} />
      <stack.Screen name={screenNames.profile} component={Tabbar} />
      <stack.Screen name={screenNames.settings} component={Tabbar} />
      <stack.Screen name={screenNames.call} component={Tabbar} />
      <stack.Screen
        name={screenNames.changeAppLanguage}
        component={screens.changeAppLanguage}
      />
      <stack.Screen name={screenNames.account} component={screens.account} />
      <stack.Screen name={screenNames.chat} component={screens.chat} />
      <stack.Screen
        name={screenNames.specificChats}
        component={screens.specificChats}
      />
      <stack.Screen
        name={screenNames.videoPlaying}
        component={screens.videoPlaying}
      />
      <stack.Screen
        name={screenNames.chatProfile}
        component={screens.chatProfile}
      />
      <stack.Screen
        name={screenNames.addFriends}
        component={screens.addFriends}
      />
      <stack.Screen
        name={screenNames.chatDetails}
        component={screens.chatDetails}
      />
      <stack.Screen name={screenNames.storage} component={screens.storage} />
      <stack.Screen
        name={screenNames.editProfiles}
        component={screens.editProfiles}
      />
      <stack.Screen
        name={screenNames.callScreen}
        component={screens.callScreen}
      />
      <stack.Screen
        name={screenNames.callDetailScreen}
        component={screens.callDetailScreen}
      />
    </stack.Navigator>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({});
