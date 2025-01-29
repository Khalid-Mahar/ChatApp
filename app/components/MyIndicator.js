import React from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import colors from '../config/colors';

export default function MyIndicator({visible, style, color, size}) {
  if (!visible) {
    return null;
  }
  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
      ]}>
      <ActivityIndicator
        animating={visible}
        style={{width: 100, height: 100, zIndex: 99999}}
        size={size == '' || size == undefined ? 'large' : size}
        color={color == '' || color == undefined ? colors.primaryColor : color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
});
