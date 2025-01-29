import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TopComponent from '../components/TopComponent';
import language from '../languages/index';
import colors from '../config/colors';
import ImagePicker from '../utils/ImagePicker';
import InputText from '../components/InputText';
import ButtonComponent from '../components/ButtonComponent';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import uploadImage from '../utils/UploadImage';
import FastImage from 'react-native-fast-image';
const EditProfiles = () => {
  const [email, setEmail] = useState('');
  const [imageChange, setImageChange] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [status, setStatus] = useState('');
  const [image, setImage] = useState('');
  const [imageType, setImageType] = useState('');
  const [_editAble, setEditAble] = useState(false);
  const [imageErr, setImageErr] = useState('');
  const [statusErr, setStatusErr] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    try {
      setLoading(true);
      await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            const data = snapshot?.data();
            setName(data?.name);
            setEmail(data?.email);
            setImage(data?.userImg);
            setImageChange(data?.userImg);
            setStatus(data?.status);
            setTimeout(() => {
              setLoading(false);
            }, 500);
          }
        });
    } catch (error) {
      setLoading(false);
      console.log('======ERROR=====', error);
    }
  };

  const handleUploadImage = async () => {
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
      if (!status.trim()) {
        setStatus('required');
        hasErr = true;
      } else {
        setStatusErr('');
      }

      if (!hasErr) {
        setLoading(true);
        if (image !== imageChange) {
          const imageRes = await uploadImage('users', image, imageType);
          await upDateUserData(imageRes);
          console.log('----------', imageRes);
        } else {
          await upDateUserData(image);
        }
      }
    } catch (error) {
      console.log('error in uplaodin image', error);
    }
  };

  const upDateUserData = async img => {
    try {
      await firestore().collection('users').doc(auth().currentUser.uid).update({
        name: name,
        email: email,
        status: status,
        userImg: img,
      });
      setLoading(false);
      setEditAble(false);
    } catch (error) {
      setLoading(false);
      console.log('=======ERROR=====', error);
    }
  };
  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: colors.white}}>
      <View style={styles.topView}>
        <TopComponent
          titleSty={{color: colors.black}}
          circleLeft={true}
          title={language.t('editAccount')}
          editBtn={true}
          onEditPress={() => setEditAble(!_editAble)}
        />
        <View style={styles.avatarMainView}>
          <View style={styles.avatarView}>
            {image !== '' ? (
              <FastImage style={styles.defaultImg} source={{uri: image}} />
            ) : (
              <Image
                style={styles.defaultImg}
                source={require('../assets/defaultImg.jpg')}
                resizeMode="contain"
              />
            )}
          </View>
          {_editAble ? (
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
          ) : null}
        </View>
      </View>
      <KeyboardAvoidingView
        style={{flex: 1, width: '100%', zIndex: -1}}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS ? 10 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            marginTop: '20%',
            zIndex: -1,
          }}>
          <View style={styles.inputView}>
            <InputText
              value={name}
              setValue={setName}
              erorrText={nameErr}
              placeholder={language.t('name')}
              inputViewStyle={{}}
              editable={_editAble}
              autoCapitalize="none"
            />

            <InputText
              value={email}
              setValue={setEmail}
              keyboardType="email-address"
              erorrText={emailErr}
              autoCapitalize="none"
              placeholder={language.t('email')}
              editable={false}
              inputViewStyle={{
                marginTop: 20,
              }}
            />

            <InputText
              value={status}
              setValue={setStatus}
              autoCapitalize="none"
              erorrText={statusErr}
              editable={_editAble}
              placeholder={language.t('status')}
              inputViewStyle={{
                marginTop: 20,
              }}
            />
            {_editAble ? (
              <ButtonComponent
                onPress={() => {
                  handleUploadImage();
                }}
                title={language.t('update')}
                loader={loading}
                style={styles.btn}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfiles;

const styles = StyleSheet.create({
  topView: {
    height: 200,
    width: '100%',
    backgroundColor: colors.caret,
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
    zIndex: 999,
    marginTop: Platform.OS == 'android' ? 60 : 30,
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
  inputView: {
    flex: 1,
    marginHorizontal: 20,
    // marginTop: '10%',
  },
  btn: {
    marginTop: 25,
    height: 60,
  },
});
