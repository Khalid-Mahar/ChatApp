import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import Fonts from '../config/Fonts';
import colors from '../config/colors';
import {useNavigation} from '@react-navigation/native';
import screenNames from '../config/ScreenNames';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FastImage from 'react-native-fast-image';
import generateUserId from '../screens/chat/chatComponents/generateUserId';
import language from '../languages/index';
const MsgCard = React.memo(({item, onPress}) => {
  const navigation = useNavigation();
  const currentDate = item?.time?.toDate();

  const _date = useMemo(() => {
    let formattedDate = moment(currentDate).format('DD/MM/YY');
    const today = new Date();
    if (today.toDateString() === currentDate?.toDateString()) {
      formattedDate = 'Today';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === currentDate?.toDateString()) {
      formattedDate = 'Yesterday';
    }

    return formattedDate;
  }, [currentDate]);

  const [data, setData] = useState('');

  const handleNavigationIntoChat = id => {
    let allIDs = item.chatID.split('&');
    let senderId = '';
    let reciverId = '';
    if (allIDs[0] === auth().currentUser.uid) {
      senderId = allIDs[0];
      reciverId = allIDs[1];
    } else {
      senderId = allIDs[1];
      reciverId = allIDs[0];
    }
    const routeData = generateUserId(auth().currentUser.uid, reciverId);
    navigation.navigate('Chat', {routeData, userData: item.userData});
  };
  return (
    <TouchableOpacity
      onPress={() => {
        handleNavigationIntoChat();
      }}
      style={styles.mainView}>
      <View style={styles.imageTextView}>
        <View style={styles.avatarView}>
          <FastImage
            style={styles.img}
            source={{uri: item?.userData?.userImg}}
          />

          {item?.userData?.activeStatus == 'online' ? (
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
          <Text style={styles.heading}>{item?.userData?.name}</Text>
          <View>
            {item.type == 'txt' && (
              <Text numberOfLines={1} style={styles.desc}>
                {item.message}
              </Text>
            )}
            {item.type == 'image' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/media.png')}
                />
                <Text style={styles.miniText}>{language.t('image')}</Text>
              </View>
            )}
            {item.type == 'video' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/videoIcon.png')}
                />
                <Text style={styles.miniText}>{language.t('video')}</Text>
              </View>
            )}
            {item.type == 'audio' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/microphone.png')}
                />
                <Text style={styles.miniText}>{language.t('voice')}</Text>
              </View>
            )}
            {item.type == 'doc' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/doc.png')}
                />
                <Text style={styles.miniText}>{language.t('document')}</Text>
              </View>
            )}
            {item.type == 'call' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/call.png')}
                />
                <Text style={styles.miniText}>
                  {language.t('audio')} {language.t('call')}
                </Text>
              </View>
            )}
            {item.type == 'videoCall' && (
              <View style={styles.imageView}>
                <Image
                  style={styles.iconStyle}
                  source={require('../assets/video.png')}
                />
                <Text style={styles.miniText}>
                  {language.t('video')} {language.t('call')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.timeView}>
        <Text style={styles.desc}>{_date}</Text>
        {item.from_num_message !== 0
          ? auth().currentUser.uid === item.receiverId && (
              <View style={styles.msg}>
                <Text style={[styles.remainMsgs]}>{item.from_num_message}</Text>
              </View>
            )
          : null}
      </View>
    </TouchableOpacity>
  );
});

export default MsgCard;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  avatarView: {
    height: 60,
    width: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.lightGrey,
  },
  img: {height: '100%', width: '100%', borderRadius: 50},
  imageTextView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textView: {
    marginLeft: 10,
    width: '72%',
  },
  timeView: {
    alignItems: 'center',
    right: 10,
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
  imageView: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  iconStyle: {height: 20, width: 20, tintColor: colors.boderColor},
  miniText: {
    fontSize: 12,
    marginLeft: 10,
    color: colors.boderColor,
  },
});
