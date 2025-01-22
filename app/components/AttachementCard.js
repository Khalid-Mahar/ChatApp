import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import colors from '../config/colors';

const AttachementCard = ({
  icon,
  title,
  substitle,
  showSubtitle = true,
  style,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.mainView, style]}>
      <TouchableOpacity onPress={onPress} style={styles.iconView}>
        <Image style={styles.iconStyle} source={icon} />
      </TouchableOpacity>
      <View style={styles.textView}>
        <Text style={styles.heading}>{title}</Text>
        {showSubtitle && <Text style={styles.desc}>{substitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default AttachementCard;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    marginHorizontal: 30,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  iconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    tintColor: colors.black,
  },
  iconView: {
    height: 50,
    width: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightWhite,
  },
  heading: {
    fontSize: 18,
    fontFamily: Fonts.regular24,
    color: colors.black,
  },
  desc: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.boderColor,
    marginTop: 2,
  },
  textView: {
    marginLeft: 10,
  },
});
