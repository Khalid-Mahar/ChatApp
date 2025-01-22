import React, {useContext, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LanguageContext} from '../languages/LanguageContext';
import ButtonComponent from '../components/ButtonComponent';
import language from '../languages/index';
import screenNames from '../config/ScreenNames';
import TopComponent from '../components/TopComponent';
import Fonts from '../config/Fonts';
import InputText from '../components/InputText';
import colors from '../config/colors';
import localeKeys from '../config/localeKeys';
import useAuth from '../auth/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MyIndicator from '../components/MyIndicator';
const Login = ({navigation}) => {
  const {changeLanguage} = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const Auth_ = useAuth();
  const loginUser = async () => {
    try {
      let hasErr = false;
      if (email == '') {
        setEmailErr('required');
        hasErr = true;
      } else {
        setEmailErr('');
        hasErr = false;
      }
      if (password == '') {
        setPasswordErr('required');
        hasErr = true;
      } else {
        setPasswordErr('');
        hasErr = false;
      }
      if (!hasErr) {
        setLoading(true);
        await auth()
          .signInWithEmailAndPassword(email, password)
          .then(async () => {
            Auth_.Login(auth().currentUser);
          });
        // const val = JSON.stringify({email, password});
        // await AsyncStorage.setItem(localeKeys.user, val);
        setLoading(false);
      } else {
        Alert.alert(language.t('warning'), language.t('allFieldRequired'));
      }
    } catch (error) {
      setLoading(false);
      console.log('====ERROR IN LOGIN USER====', error);
      if (error.code === 'auth/user-not-found') {
        setEmailErr(true);
        alert(language.t('loginErr'));
        setLoading(false);
      }
      if (error.code === 'auth/invalid-email') {
        setEmailErr(true);
        alert(language.t('loginErr1'));
        setLoading(false);
      }
      if (error.code === 'auth/invalid-login') {
        setLoading(false);
        alert(language.t('loginErr2'));
      }
      if (error.code === 'auth/wrong-password') {
        setPassword(true);
        alert(language.t('loginErr3'));
        setLoading(false);
      }
      if (error.code === 'auth/invalid-credential') {
        setLoading(false);
        alert(language.t('loginErr4'));
      }
      if (error.code === 'auth/internal-error') {
        setLoading(false);
        alert(language.t('loginErr5'));
      }
      if (error.code === 'auth/network-request-failed') {
        setLoading(false);
        alert(language.t('loginErr5'));
      }
      if (error.code === 'auth/requires-recent-login') {
        setLoading(false);
        alert(language.t('loginErr7'));
      }
    }
  };

  function togglePassword() {
    setShowPassword(!showPassword);
  }
  return (
    <View style={styles.container}>
      <TopComponent />
      <KeyboardAvoidingView
        style={{flex: 1, width: '100%'}}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS ? 10 : 0}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <Text style={styles.welcomeMsg}>{language.t('welcomeMsg')}</Text>

          <View style={styles.inputView}>
            <InputText
              value={email}
              setValue={setEmail}
              erorrText={emailErr}
              placeholder={language.t('email')}
              inputViewStyle={{}}
              autoCapitalize="none"
            />
            <InputText
              value={password}
              setValue={setPassword}
              autoCapitalize="none"
              erorrText={passwordErr}
              secureTextEntry={showPassword}
              placeholder={language.t('password')}
              inputViewStyle={{
                marginTop: 20,
              }}
              rightIconStyle={{
                resizeMode: 'contain',
                tintColor: colors.grey,
              }}
              onRightIconPress={togglePassword}
              rightIcon={
                showPassword
                  ? require('../assets/ic_hidePassword.png')
                  : require('../assets/ic_showPassword.png')
              }
            />
            <ButtonComponent
              onPress={() => loginUser()}
              title={language.t('login')}
              style={styles.btn}
            />
            <TouchableOpacity
              style={{alignSelf: 'flex-end', marginRight: 10, marginTop: 10}}
              onPress={() => navigation.navigate(screenNames.forgotPassword)}>
              <Text style={styles.btnTxt}> {language.t('forgotPassword')}</Text>
            </TouchableOpacity>
            <View style={styles.bottomView}>
              <Text style={styles.textStyles}>
                {language.t('dontHaveAccount')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(screenNames.signup)}>
                <Text style={styles.btnTxt}> {language.t('signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <MyIndicator visible={loading} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: colors.white,
  },
  welcomeMsg: {
    fontSize: 32,
    fontFamily: Fonts.bold24,
    color: colors.black,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 30,
  },
  inputView: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: '25%',
  },
  btn: {
    marginTop: 25,
  },
  bottomView: {
    marginTop: 20,
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textStyles: {
    fontSize: 15,
    fontFamily: Fonts.medium24,
    color: colors.black,
  },
  btnTxt: {
    fontSize: 15,
    fontFamily: Fonts.bold24,
    color: colors.primaryColor,
    fontWeight: '700',
  },
});
