import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../config/colors';
import Fonts from '../config/Fonts';
import language from '../languages/index';
const {height, width} = Dimensions.get('screen');
const UpgradePassword = ({
  setModal,
  modal,
  buttonPressed,
  currentPassword,
  setCurrentPassword,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [showcurrentPassword, setShowcurrentPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const toggleCurrentPassword = () => {
    setShowcurrentPassword(!showcurrentPassword);
  };
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <TouchableOpacity
      onPress={() => {
        setModal(!modal);
      }}
      activeOpacity={1}
      style={styles.modalBackground}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View
            style={{
              padding: 20,
            }}>
            <Text style={styles.modalText}>{language.t('updatePassword')}</Text>
            <View style={styles.textInputView}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter current password"
                autoCapitalize={'none'}
                placeholderTextColor={colors.lightGray}
                value={currentPassword}
                cursorColor={'#007aff'}
                onChangeText={txt => setCurrentPassword(txt)}
                secureTextEntry={showcurrentPassword}
              />
              <TouchableOpacity
                onPress={() => {
                  toggleCurrentPassword();
                }}
                activeOpacity={0.5}>
                <Image
                  resizeMode="contain"
                  style={styles.iconStyle}
                  source={
                    showcurrentPassword == false
                      ? require('../assets/ic_password.png')
                      : require('../assets/ic_hidden.png')
                  }
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.textInputView, {marginTop: 10}]}>
              <TextInput
                style={[styles.textInput]}
                placeholder="New Password"
                value={password}
                placeholderTextColor={colors.lightGray}
                cursorColor={'#007aff'}
                autoCapitalize={'none'}
                onChangeText={txt => setPassword(txt)}
                secureTextEntry={showPassword}
              />
              <TouchableOpacity
                onPress={() => {
                  toggleShowPassword();
                }}
                activeOpacity={0.5}>
                <Image
                  resizeMode="contain"
                  style={styles.iconStyle}
                  source={
                    showPassword == false
                      ? require('../assets/ic_password.png')
                      : require('../assets/ic_hidden.png')
                  }
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.textInputView, {marginTop: 10}]}>
              <TextInput
                style={styles.textInput}
                autoCapitalize={'none'}
                placeholder="Confirm new password"
                placeholderTextColor={colors.lightGray}
                value={confirmPassword}
                cursorColor={'#007aff'}
                onChangeText={txt => setConfirmPassword(txt)}
                secureTextEntry={showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => {
                  toggleConfirmPassword();
                }}
                activeOpacity={0.5}>
                <Image
                  resizeMode="contain"
                  style={styles.iconStyle}
                  source={
                    showConfirmPassword == false
                      ? require('../assets/ic_password.png')
                      : require('../assets/ic_hidden.png')
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.btnView}>
            <TouchableOpacity
              onPress={() => {
                setModal(false);
              }}
              style={[styles.btn, {}]}>
              <Text style={[styles.btnText, {color: colors.red}]}>
                {language.t('cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={buttonPressed} style={styles.btn}>
              <Text style={[styles.btnText]}>{language.t('update')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
};

export default UpgradePassword;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#EDEDEF',
    borderRadius: 10,
    height: Dimensions.get('screen').height * 0.3,
    overflow: 'hidden',
    width: '70%',
  },
  modalText: {
    fontSize: 15,
    fontFamily: Fonts.bold24,
    color: colors.black,
    textAlign: 'center',
    width: Dimensions.get('screen').width * 0.4,
    alignSelf: 'center',
    bottom: '5%',
  },
  textInputView: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    borderRadius: 10,
    color: colors.black,
    backgroundColor: colors.pureWhite,
    borderWidth: 1,
    borderColor: '#D4D4D7',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  textInput: {
    height: 40,
    width: '92%',
    color: colors.black,
  },
  btnView: {
    flexDirection: 'row',
    height: height * 0.05,
  },
  btn: {
    width: '50%',
    height: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D4D4D7',
  },
  btnText: {
    color: '#007aff',
    fontSize: 15,
    fontFamily: Fonts.poppin_medium,
  },
  iconStyle: {
    height: 17,
    width: 17,
    marginLeft: 3,
    tintColor: colors.grey,
  },
});
