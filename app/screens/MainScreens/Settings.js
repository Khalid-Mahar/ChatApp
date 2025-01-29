import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colors from '../../config/colors';
import TopComponent from '../../components/TopComponent';
import language from '../../languages/index';
import CommonStyle from '../../config/CommonStyle';
import SetttingScreenHeader from '../../components/SetttingScreenHeader';
import SettingBtn from '../../components/SettingBtn';
import ButtonComponent from '../../components/ButtonComponent';
import Fonts from '../../config/Fonts';
import screenNames from '../../config/ScreenNames';
import useAuth from '../../auth/useAuth';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebaseKeys from '../../config/firebaseKeys';
const Settings = ({navigation}) => {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState('');
  const commonSty = CommonStyle();
  const Auth_ = useAuth();

  const fetchUserData = async () => {
    try {
      await firestore()
        .collection(firebaseKeys.user)
        .doc(auth().currentUser.uid)
        .onSnapshot(snap => {
          const data = snap.data();
          setUserData(data);
        });
    } catch (error) {
      console.log('========ERROR IN GETTING CURRENT USER DATA=======', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Render Modal inline instead of using a separate function
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} title={language.t('settings')} />
      <View style={commonSty.mainView}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <SetttingScreenHeader data={userData} />
          <View style={{marginTop: 10}}>
            <SettingBtn
              title={language.t('account')}
              subtitle={language.t('accountMsg')}
              icon={require('../../assets/keys.png')}
              onPress={() => navigation.navigate(screenNames.account)}
            />
            <SettingBtn
              onPress={() => navigation.navigate(screenNames.chatDetails)}
              title={language.t('chat')}
              subtitle={language.t('chatMsg')}
              icon={require('../../assets/carbon_chat.png')}
            />
            {/* <SettingBtn
              title={language.t('notifications')}
              subtitle={language.t('notificationMsg')}
              icon={require('../../assets/notiications.png')}
            /> */}
            <SettingBtn
              onPress={() => navigation.navigate(screenNames.storage)}
              title={language.t('storageData')}
              subtitle={language.t('storageDataMsg')}
              icon={require('../../assets/db.png')}
            />
            <SettingBtn
              title={language.t('appLanguage')}
              subtitle={language.t('storageDataMsg')}
              icon={require('../../assets/languages.png')}
              onPress={() => navigation.navigate(screenNames.changeAppLanguage)}
            />
            <SettingBtn
              title={language.t('logout')}
              onPress={() => setShowModal(true)}
              subtitleShown={false}
              icon={require('../../assets/logout.png')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Logout Modal */}
      <Modal transparent={true} visible={showModal}>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.heading}>{language.t('logout')}</Text>
            <Text style={styles.normalText}>{language.t('logoutMSG')}</Text>
            <View style={styles.btnView}>
              <ButtonComponent
                style={styles.btn}
                title={language.t('cancel')}
                onPress={() => setShowModal(false)}
              />
              <ButtonComponent
                style={styles.btn}
                title={language.t('logout')}
                onPress={() => {
                  Auth_.Logout();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a translucent background
  },
  modalContent: {
    backgroundColor: '#F3F3F3',
    padding: 20,
    paddingVertical: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.black,
    width: '85%',
  },
  btnView: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-around',
  },
  btn: {
    width: '35%',
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.black,
  },
  heading: {
    fontSize: 16,
    fontFamily: Fonts.medium24,
    color: colors.black,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 14,
    fontFamily: Fonts.regular24,
    color: colors.black,
    marginTop: 10,
  },
});
