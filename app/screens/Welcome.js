import {StyleSheet, Image, Dimensions, Text, View} from 'react-native';
import React from 'react';
const {height, width} = Dimensions.get('screen');
import language from '../languages/index';
import ButtonComponent from '../components/ButtonComponent';
import Fonts from '../config/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import screenNames from '../config/ScreenNames';
import useAuth from '../auth/useAuth';
import auth from '@react-native-firebase/auth';
const Welcome = ({navigation}) => {
  const Auth_ = useAuth();
  const handleLogin = async () => {
    const user = await auth().currentUser;
    Auth_.Login(user);
  };
  return (
    <View style={styles.mainContainer}>
      <Image style={styles.moonImage} source={require('../assets/moon.png')} />
      <View style={styles.textView}>
        <Text style={styles.heading}>{language.t('welcomeScreenTitle')}</Text>
        <Text style={styles.desc}>{language.t('welcomeScreenDesc')}</Text>
        <ButtonComponent
          onPress={() => {
            handleLogin();
          }}
          style={styles.btn}
          title={language.t('getStarted')}
        />
      </View>
      <Image
        style={styles.ellipseImage}
        source={require('../assets/Ellipse.png')}
      />
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  moonImage: {
    height: height * 0.3,
    width: width * 0.3,
    alignSelf: 'flex-end',
  },
  ellipseImage: {
    height: height * 0.3,
    width: width,
  },
  heading: {
    fontFamily: Fonts.bold24,
    color: colors.black,
    fontSize: 40,
    fontWeight: 'bold',
  },
  desc: {
    fontFamily: Fonts.regular24,
    color: colors.black,
    fontSize: 15,
    marginTop: 7,
    width: '80%',
  },
  textView: {
    marginHorizontal: 20,
  },
  btn: {
    marginTop: 20,
  },
});
