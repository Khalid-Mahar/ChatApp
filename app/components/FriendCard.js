import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Fonts from '../config/Fonts';
import colors from '../config/colors';
import {useNavigation} from '@react-navigation/native';
import screenNames from '../config/ScreenNames';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import FastImage from 'react-native-fast-image';
import generateUserId from '../screens/chat/chatComponents/generateUserId';
const FriendCard = ({item, isFromHome = false}) => {
  const navigation = useNavigation();
  function handleNavigate() {
    if (isFromHome) {
      const routeData = generateUserId(auth().currentUser.uid, item.userId);
      navigation.navigate('Chat', {routeData, userData: item.userData});
    } else {
      const routeData = generateUserId(auth().currentUser.uid, item.userId);
      navigation.navigate(screenNames.chat, {routeData, userData: item});
    }
  }
  return (
    <TouchableOpacity
      onPress={() => {
        handleNavigate();
      }}
      style={styles.mainView}>
      <View style={styles.imageTextView}>
        <View>
          <FastImage style={styles.img} source={{uri: item.userImg}} />
          {item?.activeStatus == 'online' ? (
            <View
              style={{
                height: 12,
                width: 12,
                backgroundColor: colors.green,
                position: 'absolute',
                alignSelf: 'flex-end',
                bottom: 0,
                right: 5,
                borderRadius: 10,
              }}
            />
          ) : null}
        </View>
        <View style={styles.textView}>
          <Text style={styles.heading}>{item.name}</Text>
          <Text style={styles.desc}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FriendCard;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  img: {height: 60, width: 60, borderRadius: 30},
  imageTextView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textView: {
    marginLeft: 10,
  },
  timeView: {
    alignItems: 'center',
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
  remainMsgs: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.white,
  },
  msg: {
    backgroundColor: colors.caret,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 5,
  },
});
