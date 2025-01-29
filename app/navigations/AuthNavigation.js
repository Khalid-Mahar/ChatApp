import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import screenNames from '../config/ScreenNames';
import screens from '../config/AllScreens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localeKeys from '../config/localeKeys';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(
    screenNames.onBoardingScreen,
  );

  const handleCheckScreen = async () => {
    try {
      const val = await AsyncStorage.getItem(localeKeys.welcome);
      const res = val ? JSON.parse(val) : null;
      if (res) {
        setInitialRoute(screenNames.login);
      } else {
        setInitialRoute(screenNames.onBoardingScreen);
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCheckScreen();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}>
      <Stack.Screen name={screenNames.login} component={screens.login} />
      <Stack.Screen name={screenNames.signup} component={screens.signup} />
      <Stack.Screen
        name={screenNames.forgotPassword}
        component={screens.forgotPassword}
      />
      <Stack.Screen
        name={screenNames.mailPacket}
        component={screens.mailPacket}
      />
      <Stack.Screen
        name={screenNames.onBoardingScreen}
        component={screens.onBoardingScreen}
      />
      <Stack.Screen name={screenNames.welcome} component={screens.welcome} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

const styles = StyleSheet.create({});
