import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../config/colors';
import TopComponent from '../components/TopComponent';
import language from '../languages/index';
import CommonStyle from '../config/CommonStyle';
import ButtonComponent from '../components/ButtonComponent';
import Fonts from '../config/Fonts';
import screenNames from '../config/ScreenNames';
import useAuth from '../auth/useAuth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import UpgradePassword from '../components/UpgradePassword';
import MyIndicator from '../components/MyIndicator';
import firebaseKeys from '../config/firebaseKeys';
import CusotmPrompt from '../components/CusotmPrompt';

const Account = ({navigation}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const commonSty = CommonStyle();
  const Auth_ = useAuth();

  // change password
  const [passwordShowModal, setPasswordShowModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setnewPassword] = useState('');
  // delete account
  const [password, setPassword] = useState('');
  const [deleteShowModal, setDeleteShowModal] = useState(false);

  const changePassword = async (_password, _newPassword, _confirmPassword) => {
    try {
      if (_newPassword == confirmPassword) {
        setShowModal(false);
        setLoading(true);
        setPasswordShowModal(false);
        if (_password === null) {
          console.log('==========Password update cancelled by user');
          setLoading(false);
          return;
        }
        const passwordCre = await auth.EmailAuthProvider.credential(
          auth().currentUser.email,
          _password,
        );
        await auth().currentUser.reauthenticateWithCredential(passwordCre);
        await auth().currentUser.updatePassword(_newPassword);
        setLoading(false);
        alert(language.t('passwordUpdated'));
      } else {
        alert(language.t('passwordMismatch'));
      }
    } catch (error) {
      if (error.code) {
        setLoading(false);
        alert(language.t('invalidCrediantials'));
      }
      setLoading(false);
      setShowModal(false);
      console.log('========ERROR IN PASSWORD UPDATE==========', error);
    }
  };

  const togglepasswordModal = () => {
    setPasswordShowModal(!passwordShowModal);
  };

  const askForDeleteAccount = () => {
    const userWithGoogle = auth().currentUser.emailVerified;
    console.log('========', userWithGoogle);
    if (userWithGoogle) {
      Alert.alert(language.t('deleteAcc'), language.t('areYouSureDeleteAcc'), [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteMyAccount(''),
        },
      ]);
    } else {
      if (Platform.OS === 'ios') {
        Alert.prompt('', language.t('enterPassCurrPassword'), [
          {
            text: language.t('no'),
            onPress: () => setPassword(''),
            style: 'cancel',
          },
          {
            text: language.t('yes'),
            onPress: password => {
              deleteMyAccount(password);
            },
          },
        ]);
      } else {
        setDeleteShowModal(true);
      }
    }
  };

  // delete user account
  const deleteMyAccount = async currPassword => {
    try {
      setLoading(true);
      const userWithGoogle = auth().currentUser.emailVerified;
      const user = auth().currentUser;
      const uid = await auth().currentUser.uid;
      const providerId = user.providerData[0]?.providerId;
      if (currPassword !== '') {
        await user.reauthenticateWithCredential(
          auth.EmailAuthProvider.credential(user.email, currPassword),
        );
        await proceedToDeleteAccount();
      } else {
        setLoading(false);
        alert('Please enter current password!');
        return;
      }
    } catch (error) {
      setLoading(false);
      console.error('Error deleting user account:', error);
      if (error.code === 'auth/internal-error') {
        setLoading(false);
        alert(language.t('loginErr3'));
      }
      if (error.code === 'auth/too-many-requests') {
        setLoading(false);
        alert(language.t('loginErr9'));
      }
      if (error.code === 'auth/invalid-login') {
        setLoading(false);
        alert(language.t('loginErr3'));
      }
    }
  };

  const proceedToDeleteAccount = async () => {
    try {
      const user = auth().currentUser;
      const uid = await auth().currentUser.uid;
      const userCollection = firestore().collection(firebaseKeys.user);
      if (user) {
        user
          .delete()
          .then(() => {
            Auth_.setUser(null);
            setLoading(false);
            return userCollection.doc(uid).update({
              status: 'accoutStatus',
            });
          })
          .then(() => {
            setLoading(false);
            setDeleteShowModal(false);
            alert(language.t('accDeletedSuccessfull'));
          })
          .catch(error => {
            setLoading(false);
            console.error('Error deleting user account:', error);
          });
      }
    } catch (error) {}
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} title={language.t('account')} />
      <View style={commonSty.mainView}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <View style={{marginTop: '7%', marginHorizontal: 20}}>
            <TouchableOpacity
              onPress={() => navigation.navigate(screenNames.addFriends)}
              style={styles.buttonView}>
              <Image
                style={styles.iconStyle}
                source={require('../assets/addAcc.png')}
              />
              <Text style={[styles.buttonText]}>
                {language.t('addAccount')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(screenNames.editProfiles)}
              style={styles.buttonView}>
              <Image
                style={styles.iconStyle}
                source={require('../assets/editAcc.png')}
              />
              <Text style={[styles.buttonText]}>
                {language.t('editAccount')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => togglepasswordModal()}
              style={[styles.buttonView]}>
              <View style={styles.lockIcon}>
                <Image
                  style={{height: 25, width: 25, tintColor: colors.black}}
                  source={require('../assets/lock.png')}
                />
              </View>

              <Text style={[styles.buttonText]}>
                {language.t('changePassword')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => askForDeleteAccount()}
              style={styles.buttonView}>
              <Image
                style={styles.iconStyle}
                source={require('../assets/delete.png')}
              />
              <Text style={[styles.buttonText]}>
                {language.t('deleteAccount')}
              </Text>
            </TouchableOpacity>
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
      {changePasswordModal()}
      {deleteAccModal()}
      <MyIndicator visible={loading} />
    </View>
  );

  function changePasswordModal() {
    return (
      <Modal style={{flex: 1}} visible={passwordShowModal} transparent>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'rgba(0, 0, 0, 0.5)'}
        />
        <UpgradePassword
          setModal={setPasswordShowModal}
          modal={passwordShowModal}
          setCurrentPassword={setCurrentPassword}
          currentPassword={currentPassword}
          setPassword={setnewPassword}
          password={newPassword}
          setConfirmPassword={setConfirmPassword}
          confirmPassword={confirmPassword}
          buttonPressed={() => {
            if (
              currentPassword.length &&
              newPassword.length &&
              confirmPassword.length > 0
            ) {
              changePassword(currentPassword, newPassword, confirmPassword);
            } else {
              alert(language.t('allFieldsAreRequired'));
            }
          }}
        />
      </Modal>
    );
  }

  function deleteAccModal() {
    return (
      <Modal visible={deleteShowModal} transparent animationType="fade">
        <CusotmPrompt
          setModal={setDeleteShowModal}
          modal={deleteAccModal}
          setValue={setPassword}
          deleteMyAccount={() => deleteMyAccount(password)}
          value={password}
        />
      </Modal>
    );
  }
};

export default Account;

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
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.regular24,
    color: colors.black,
    marginLeft: 20,
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  iconStyle: {
    height: 50,
    width: 50,
  },
  lockIcon: {
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
