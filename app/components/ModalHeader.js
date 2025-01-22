import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const ModalHeader = ({title, onPress}) => {
  return (
    <View style={styles.mainView}>
      <TouchableOpacity onPress={onPress}>
        <Image
          style={styles.close}
          source={require('../assets/ic_close.png')}
        />
      </TouchableOpacity>
      <Text style={styles.heading}>{title}</Text>
      <View />
    </View>
  );
};

export default ModalHeader;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginTop: '8%',
  },
  close: {
    height: 15,
    width: 15,
  },
  heading: {
    fontSize: 19,
    fontFamily: Fonts.regular24,
    color: colors.black,
  },
});
