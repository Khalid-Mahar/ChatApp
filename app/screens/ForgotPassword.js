import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import TopComponent from '../components/TopComponent';
import ButtonComponent from '../components/ButtonComponent';
import language from '../languages/index';
import InputText from '../components/InputText';
import auth from '@react-native-firebase/auth';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginFunctionality = async () => {
    try {
      if (email === '') {
        setEmailErr('Email Required');
      } else {
        setEmailErr(false);
        setEmailErr('');
      }

      if (email) {
        setLoading(true);
        await auth()
          .sendPasswordResetEmail(email)
          .then(res => {
            setEmail('');
            alert(language.t('checkPasswordResetEmail'));
            setLoading(false);
          });
      }
    } catch (error) {
      setLoading(false);
      console.log('======ERROR IN CREATING NEW USER======', error);

      // Handle specific error codes
      if (error.code === 'auth/user-not-found') {
        setEmailErr(true);
        alert(language.t('loginErr'));
      }
      if (error.code === 'auth/invalid-email') {
        setEmailErr(true);
        alert(language.t('loginErr1'));
      }
      if (error.code === 'auth/invalid-login') {
        alert(language.t('loginErr2'));
      }
      if (error.code === 'auth/wrong-password') {
        setPassword(true);
        alert(language.t('loginErr3'));
      }
      if (error.code === 'auth/invalid-credential') {
        alert(language.t('loginErr4'));
      }
      if (error.code === 'auth/internal-error') {
        alert(language.t('loginErr5'));
      }
      if (error.code === 'auth/network-request-failed') {
        alert(language.t('loginErr5'));
      }
      if (error.code === 'auth/requires-recent-login') {
        alert(language.t('loginErr7'));
      }
      if (error.code === 'auth/email-already-in-use') {
        alert(language.t('loginErr8'));
      }
    }
  };
  return (
    <View style={styles.container}>
      <TopComponent leftIcon={true} />
      <KeyboardAvoidingView
        style={{flex: 1, width: '100%'}}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS ? 10 : 0}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <Text style={styles.welcomeMsg}>{language.t('forgotPassword')}</Text>

          <View style={styles.inputView}>
            <InputText
              value={email}
              setValue={setEmail}
              keyboardType="email-address"
              erorrText={emailErr}
              autoCapitalize="none"
              placeholder={language.t('email')}
              inputViewStyle={{
                marginTop: 20,
              }}
            />

            <ButtonComponent
              onPress={() => {
                handleLoginFunctionality();
              }}
              title={language.t('submit')}
              loader={loading}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPassword;

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
    width: '50%',
  },
  inputView: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: '10%',
  },
  btn: {
    marginTop: 25,
  },
});
