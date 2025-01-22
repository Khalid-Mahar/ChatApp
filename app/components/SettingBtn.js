import {StyleSheet, Text, Image, View, TouchableOpacity} from 'react-native';
import React from 'react';
import language from '../languages/index';
import colors from '../config/colors';
import Fonts from '../config/Fonts';
const SettingBtn = ({title, subtitle, icon, onPress, subtitleShown = true}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.mainView}>
      <View style={styles.iconView}>
        <Image style={styles.iconStyle} source={icon} />
      </View>
      <View style={styles.textView}>
        <Text style={styles.heading}>{title}</Text>
        {subtitleShown && <Text style={styles.normalText}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default SettingBtn;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  iconView: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 30,
  },
  iconStyle: {
    height: 30,
    width: 30,
    tintColor: colors.black,
  },
  textView: {
    marginLeft: 15,
  },
  heading: {
    fontSize: 16,
    fontFamily: Fonts.medium24,
    color: colors.black,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.grey,
    marginTop: 5,
  },
});
