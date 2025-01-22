import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import colors from '../config/colors';
import TopComponent from '../components/TopComponent';
import language from '../languages/index';
import ButtonComponent from '../components/ButtonComponent';
import Fonts from '../config/Fonts';
import screenNames from '../config/ScreenNames';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import useAuth from '../auth/useAuth';
const MailPacket = ({navigation}) => {
  const insect = useSafeAreaInsets();
  const Auth_ = useAuth();
  const welcomeFunction = async () => {
    const user = await auth().currentUser;
    Auth_.Login(user);
  };
  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={[styles.mainView, {marginTop: insect.top}]}>
        <Image
          style={styles.img}
          source={require('../assets/mailPacket.png')}
        />
        <View style={styles.textView}>
          <Text style={styles.heading}>{language.t('mailPacket')}</Text>
          <Text style={styles.description}>{language.t('mailPacketDec')}</Text>
        </View>
        <ButtonComponent
          onPress={() => {
            welcomeFunction();
          }}
          style={{width: '50%'}}
          title={language.t('start')}
        />
      </ScrollView>
    </View>
  );
};

export default MailPacket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mainView: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  img: {
    height: 200,
    width: '80%',
    resizeMode: 'contain',
  },
  textView: {
    alignItems: 'center',
    width: '70%',
  },
  heading: {
    fontSize: 30,
    fontFamily: Fonts.bold24,
    fontWeight: 'bold',
    color: colors.black,
  },
  description: {
    marginTop: 30,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey,
    textAlign: 'center',
  },
});
