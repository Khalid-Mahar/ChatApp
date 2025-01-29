import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState, useEffect} from 'react';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Fonts from '../config/Fonts';
import colors from '../config/colors';
import {useNavigation} from '@react-navigation/native';
import generateUserId from '../screens/chat/chatComponents/generateUserId';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import screenNames from '../config/ScreenNames';
const CallCard = ({item, showCallIcons = true, activeOpacity = 0.5}) => {
  const currentDate = item?.time?.toDate();
  const navigation = useNavigation();
  const [currenUserData, setCurrenUserData] = useState('');

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
    console.log(routeData);
    navigation.navigate(screenNames.callDetailScreen, {
      routeData,
      userData: item.userData,
    });
  };

  const sendMessages = async type => {
    try {
      await firestore()
        .collection('chat')
        .doc(item.chatID)
        .set(
          {
            message: '',
            time: new Date(),
            senderId: auth().currentUser.uid,
            receiverId: item.userData.userId,
            chatID: item.chatID,
            mediaFile: '',
            isRead: false,
            status: 'ongoing',
            type: type,
            replyId: '',
            from_num_message: firestore.FieldValue.increment(1),
            extraText: '',
          },
          {merge: true},
        );
      const id = await firestore()
        .collection('chat')
        .doc(item.chatID)
        .collection('messages')
        .doc().id;

      chatData = {
        message: '',
        time: new Date(),
        senderId: auth().currentUser.uid,
        receiverId: item.userData.userId,
        chatID: item.chatID,
        mediaFile: '',
        type: type,
        id: id,
        extraText: '',
        replyText: '',
        previouseMessageType: '',
        replyId: '',
        replyMessage: '',
      };

      await firestore()
        .collection('chat')
        .doc(item.chatID)
        .collection('messages')
        .doc(id)
        .set(chatData);
    } catch (error) {
      console.log('==============ERROR IN SEDING MESSAGE=======', error);
    }
  };

  const getUserData = async () => {
    try {
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

      await firestore()
        .collection('users')
        .doc(senderId)
        .onSnapshot(snap => {
          if (snap.exists) {
            const _data = snap.data();
            setCurrenUserData(_data);
          }
        });
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={() => {
        showCallIcons ? handleNavigationIntoChat(item.chatID) : null;
      }}
      style={styles.mainView}>
      <View style={styles.imageView}>
        <View>
          <FastImage
            style={styles.mainImage}
            source={{uri: item.userData.userImg}}
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

        <View style={styles.txtView}>
          <Text style={styles.userName}>{item.userData.name}</Text>
          <Text style={styles.date}>{_date}</Text>
        </View>
      </View>
      {showCallIcons ? (
        <View style={styles.btnView}>
          <TouchableOpacity
            onPress={async () => {
              navigation.navigate(screenNames.callScreen, {
                userData: item.userData,
                chatID: item.chatID,
                currentUserData: currenUserData,
                isFromVoice: true,
              });
              await sendMessages('call', '', '');
            }}
            style={{marginRight: 10}}>
            <Image
              style={styles.iconStyle}
              source={require('../assets/call.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              navigation.navigate(screenNames.callScreen, {
                userData: item.userData,
                chatID: item.chatID,
                currentUserData: currenUserData,
                isFromVoice: false,
              });
              await sendMessages('videoCall');
            }}>
            <Image
              style={styles.iconStyle}
              source={require('../assets/video.png')}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.btnView}>
          <Image
            style={[styles.callIcon]}
            source={require('../assets/hangup.png')}
          />
          <Text style={styles.btnText}>
            {item.type == 'videoCall' ? 'Video Call' : 'Audio Call'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CallCard;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 25,
    borderBottomColor: '#F5F6F6',
  },
  imageView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
  },
  txtView: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: '#000E08',
  },
  date: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.lightGray,
  },
  btnView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    height: 30,
    width: 30,
  },
  callIcon: {
    height: 20,
    width: 20,
    tintColor: colors.green,
    marginRight: 10,
  },
  btnText: {
    color: colors.green,
  },
});
