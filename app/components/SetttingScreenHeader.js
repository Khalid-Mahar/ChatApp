import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Fonts from '../config/Fonts';
import colors from '../config/colors';
import FastImage from 'react-native-fast-image';
import language from '../languages/index';
const SetttingScreenHeader = ({data}) => {
  return (
    <View style={{flex: 1}}>
      <View style={styles.border} />
      <View style={styles.mainContaier}>
        <View style={styles.imgStyle}>
          {data.userImg !== '' ? (
            <FastImage style={styles.img} source={{uri: data.userImg}} />
          ) : (
            <Image
              style={styles.img}
              source={require('../assets/userImage.jpg')}
            />
          )}

          <View style={styles.textView}>
            <Text style={styles.heading}>
              {data !== '' ? data.name : language.t('laoding_')}
            </Text>
            <Text numberOfLines={1} style={styles.desc}>
              {data !== '' ? data.status : language.t('laoding_')}
            </Text>
          </View>
        </View>

        <View style={styles.iconViewStyle}>
          <Image
            style={[styles.iconStyle, {marginRight: 20}]}
            source={require('../assets/bx_qr-scan.png')}
          />
          <Image
            style={styles.iconStyle}
            source={require('../assets/dropDown.png')}
          />
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default SetttingScreenHeader;

const styles = StyleSheet.create({
  border: {
    height: 5,
    width: 70,
    alignSelf: 'center',
    backgroundColor: colors.somkyWhite,
    marginTop: 10,
    borderRadius: 15,
  },
  mainContaier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  imgStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: 60,
    width: 60,
    borderRadius: 35,
  },
  textView: {
    marginLeft: 10,
  },
  heading: {
    fontFamily: Fonts.regular24,
    fontSize: 20,
    color: colors.black,
  },
  desc: {
    fontFamily: Fonts.regular24,
    fontSize: 12,
    color: colors.boderColor,
  },
  iconViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    height: 25,
    width: 25,
  },
  divider: {
    borderTopWidth: 1,
    marginHorizontal: 20,
    marginTop: 15,
    borderTopColor: colors.boderColor,
  },
});
