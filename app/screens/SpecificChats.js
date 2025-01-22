import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../config/colors';
import TopComponent from '../components/TopComponent';
import Fonts from '../config/Fonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import CommonStyle from '../config/CommonStyle';
import Messages from './chat/chatComponents/Messages';
import MessageSeperator from './chat/chatComponents/MessageSeperator';
const SpecificChats = () => {
  const commonSty = CommonStyle();
  const route = useRoute();
  const {userData, messageData} = route.params;
  const navigaiton = useNavigation();
  const [formatedMessages, setFormatedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  function checkMessageData() {
    setMessages(messageData);
    const _res = formatMessages(messageData);
    setFormatedMessages(_res);
  }
  // Function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  // formating messages by the date
  const formatMessages = messages => {
    const formattedList = [];
    let currentDate = null;
    messages.forEach(message => {
      const messageDate = message.time;
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        formattedList.push({
          id: `separator_${message._id}`,
          isSeparator: true,
          date: messageDate,
        });
        currentDate = messageDate;
      }
      formattedList.push(message);
    });
    return formattedList;
  };

  useEffect(() => {
    checkMessageData();
  }, []);

  const startPlaying = item => {
    let temp = messages;
    temp?.forEach(each => {
      if (item.mediaFile === each.mediaFile) {
        each.isPlaying = true;
      } else {
        each.isPlaying = false;
      }
    });

    setMessages([...temp]);
  };

  const stopPlaying = item => {
    let _temp = messages;
    _temp?.forEach(each => {
      if (item?.mediaFile === each?.mediaFile) {
        each.isPlaying = false;
      }
    });
    setMessages([..._temp]);
    SoundPlayer.stop();
    BackgroundTimer.stopBackgroundTimer();
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} />
      <View style={styles.avatar}>
        <FastImage style={styles.avatarImge} source={{uri: userData.userImg}} />
      </View>
      <Text style={styles.heading}>{userData.name}</Text>
      <View style={[commonSty.mainView, {overflow: 'hidden'}]}>
        <FlatList
          inverted={true}
          style={{marginVertical: 10}}
          data={[...formatedMessages].reverse()}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            if (!item.isSeparator) {
              return (
                <Messages
                  swipeToReply={() => {}}
                  // swipeToReply={swipeToReply}
                  stopPlaying={stopPlaying}
                  startPlaying={startPlaying}
                  item={item}
                  data={userData}
                />
              );
            } else {
              return <MessageSeperator date={item.date} />;
            }
          }}
          ItemSeparatorComponent={<View style={{marginVertical: 8}} />}
        />
      </View>
    </View>
  );
};

export default SpecificChats;

const styles = StyleSheet.create({
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden',
    bottom: 20,
    alignSelf: 'center',
  },
  avatarImge: {
    height: '100%',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.medium24,
    color: colors.white,
    alignSelf: 'center',
  },
});
