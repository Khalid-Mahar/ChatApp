import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import colors from '../config/colors';
import Fonts from '../config/Fonts';

const ButtonComponent = ({
  style,
  onPress,
  title,
  txtStyle,
  loader = false,
  size,
  color,
  activeOpacity = 0.5,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress !== undefined ? onPress : console.log('Pressed')}
      disabled={loader ? true : false}
      style={[styles.btn, style, {opacity: loader ? 0.5 : 1}]}>
      {!loader ? (
        <Text style={[styles.h2, {color: colors.white}, txtStyle]}>
          {title}
        </Text>
      ) : (
        <ActivityIndicator
          color={color === '' || color === undefined ? colors.white : color}
          size={size === '' || size === undefined ? 'small' : size}
        />
      )}
    </TouchableOpacity>
  );
};

export default ButtonComponent;

const styles = StyleSheet.create({
  btn: {
    height: 60,
    width: '100%',
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    alignSelf: 'center',
  },
  h2: {
    fontSize: 15,
    color: colors.white,
    fontFamily: Fonts.bold24,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
