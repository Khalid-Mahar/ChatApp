import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
} from 'react-native';
import React from 'react';
import colors from '../config/colors';
import Fonts from '../config/Fonts';
import language from '../languages/index';
const {height, width} = Dimensions.get('screen');
const CusotmPrompt = ({deleteMyAccount, setModal, modal, value, setValue}) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.modalBackground}>
      <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
        <View style={{padding: 20}}>
          <Text style={styles.modalText}>
            {language.t('enterPassCurrPassword')}
          </Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize={'none'}
            value={value}
            cursorColor={'#007aff'}
            onChangeText={txt => setValue(txt)}
            secureTextEntry={true}
          />
        </View>

        <View style={styles.btnView}>
          <TouchableOpacity
            onPress={() => {
              setModal(false);
              setValue('');
            }}
            style={[
              styles.btn,
              {borderRightWidth: 1, borderRightColor: '#D4D4D7'},
            ]}>
            <Text style={[styles.btnText]}>{language.t('no')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              deleteMyAccount();
            }}
            style={styles.btn}>
            <Text style={[styles.btnText]}>{language.t('yes')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default CusotmPrompt;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#EDEDEF',
    borderRadius: 10,
    height: Dimensions.get('screen').height * 0.21,
    width: '70%',
  },
  modalText: {
    fontSize: 15,
    fontFamily: Fonts.poppins_bold,
    color: colors.black,
    textAlign: 'center',
    width: Dimensions.get('screen').width * 0.4,
    alignSelf: 'center',
  },
  textInput: {
    height: 40,
    borderRadius: 10,
    color: colors.black,
    backgroundColor: colors.pureWhite,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D4D4D7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnView: {
    flexDirection: 'row',
  },
  btn: {
    height: 41,
    width: '50%',
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
});
