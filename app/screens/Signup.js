import React, {useContext, useState} from 'react';
import {
  Alert,
  Image,
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
import useAuth from '../auth/useAuth';
import ImagePicker from '../utils/ImagePicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import UploadImage from '../utils/UploadImage';
import MyIndicator from '../components/MyIndicator';

const Signup = ({navigation}) => {
  const {changeLanguage} = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [imageType, setImageType] = useState('');
  const [imageErr, setImageErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const Auth_ = useAuth();

  function togglePassword() {
    setShowPassword(!showPassword);
  }

  const createNewUser = async () => {
    try {
      let hasErr = false;

      // Check if name is empty
      if (!name.trim()) {
        setNameErr('required');
        hasErr = true;
      } else {
        setNameErr('');
      }

      // Check if email is empty
      if (!email.trim()) {
        setEmailErr('required');
        hasErr = true;
      } else {
        setEmailErr('');
      }

      // Check if password is empty
      if (!password.trim()) {
        setPasswordErr('required');
        hasErr = true;
      } else {
        setPasswordErr('');
      }

      // Check if image is empty
      if (!image.trim()) {
        setImageErr('required');
        hasErr = true;
      } else {
        setImageErr('');
      }

      // If no errors, proceed with user creation
      if (!hasErr) {
        setLoading(true);
        await auth().createUserWithEmailAndPassword(email, password);
        const userId = await auth().currentUser.uid;
        const imageRes = await UploadImage('users', image, imageType);
        const data = {
          name: name,
          email: email,
          userId: auth().currentUser.uid,
          userImg: imageRes,
          activeStatus: 'active',
          status: 'Hi i am using Mail Packet',
          accoutStatus: 'active',
          friends: [],
          active: firestore.FieldValue.serverTimestamp(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await firestore().collection('users').doc(userId).set(data);

        Alert.alert(
          language.t('successFull'),
          language.t('accrountCreateMessage'),
          [
            {
              text: language.t('okay'),
              onPress: () => navigation.navigate(screenNames.mailPacket),
            },
          ],
        );

        setLoading(false);
      } else {
        Alert.alert(language.t('warning'), language.t('allFieldRequired'));
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
          <Text style={styles.welcomeMsg}>{language.t('letSGetStarted')}</Text>
          <View style={styles.avatarMainView}>
            <View style={styles.avatarView}>
              {image !== '' ? (
                <Image style={styles.defaultImg} source={{uri: image}} />
              ) : (
                <Image
                  style={styles.defaultImg}
                  source={require('../assets/defaultImg.jpg')}
                  resizeMode="contain"
                />
              )}
            </View>
            <TouchableOpacity
              onPress={async () => {
                const res = await ImagePicker(setImage);
                setImageType(res.type);
              }}
              style={styles.iconBtn}>
              <Image
                style={styles.iconstyle}
                source={require('../assets/ic_edit.png')}
              />
            </TouchableOpacity>
          </View>
          {imageErr && (
            <Text style={styles.warningText}>{language.t('imgRequired')}</Text>
          )}
          <View style={styles.inputView}>
            <InputText
              value={name}
              setValue={setName}
              erorrText={nameErr}
              placeholder={language.t('name')}
              inputViewStyle={{}}
              autoCapitalize="none"
            />
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
              onPress={() => {
                createNewUser();
              }}
              title={language.t('signup')}
              style={styles.btn}
            />
            <View style={styles.bottomView}>
              <Text style={styles.textStyles}>
                {language.t('alreadyHaveAdd')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.replace(screenNames.login)}>
                <Text style={styles.btnTxt}> {language.t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <MyIndicator visible={loading} />
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: colors.white,
  },
  avatarView: {
    height: 120,
    width: 120,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'red',
    borderWidth: 3,
    borderColor: colors.primaryColor,
    alignSelf: 'center',
  },
  avatarMainView: {
    width: 130,
    alignSelf: 'center',
    marginTop: 30,
  },
  defaultImg: {
    height: '100%',
    width: '100%',
  },
  iconBtn: {
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    right: 30,
  },
  iconstyle: {
    height: 20,
    width: 20,
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
  warningText: {
    fontSize: 14,
    color: colors.primaryColor,
    fontWeight: '500',
    alignSelf: 'center',
    top: 10,
  },
});
