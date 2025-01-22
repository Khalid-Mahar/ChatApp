import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import TopComponent from '../../components/TopComponent';
import colors from '../../config/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import languge from '../../languages/index';
import CommonStyle from '../../config/CommonStyle';
import auth from '@react-native-firebase/auth';
import generateUserId from './chatComponents/generateUserId';
import BackgroundTimer from 'react-native-background-timer';
import SoundPlayer from 'react-native-sound-player';
import * as Progress from 'react-native-progress';
import screenNames from '../../config/ScreenNames';
import moment from 'moment';
import firestore, {doc} from '@react-native-firebase/firestore';
import Fonts from '../../config/Fonts';
import VidComponents from '../../components/VidComponents';
import CallCard from '../../components/CallCard';
import MyIndicator from '../../components/MyIndicator';
const {height, width} = Dimensions.get('screen');
const CallDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const commonSty = CommonStyle();
  const {routeData, userData} = route.params;
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [callData, setCallData] = useState([]);
  const [docs, setDocs] = useState([]);
  const [audios, setAudios] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(0);
  const [TotalDuration, setTotalDuration] = useState(0);
  const [data, setData] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currenUserData, setCurrenUserData] = useState('');
  const [loading, setloading] = useState(false);

  const currentUser = auth().currentUser.uid;
  const [vedios, setVedios] = useState([]);
  const [formatedMessages, setFormatedMessages] = useState([]);
  const [audioLoading, setAudioLoading] = useState(false);
  let allIDs = routeData.chatID.split('&');
  let senderId = '';
  let reciverId = '';
  if (allIDs[0] === auth().currentUser.uid) {
    senderId = allIDs[0];
    reciverId = allIDs[1];
  } else {
    senderId = allIDs[1];
    reciverId = allIDs[0];
  }

  function handleNavigate() {
    const routeData = generateUserId(auth().currentUser.uid, userData.userId);
    navigation.navigate(screenNames.chat, {
      routeData,
      userData: userData,
    });
  }
  // get all messages form the firebase
  //   const getAllMessages = async () => {
  //     try {
  //       setloading(true);
  //       await firestore()
  //         .collection('chat')
  //         .doc(routeData.chatID)
  //         .collection('messages')
  //         .orderBy('time', 'asc')
  //         .onSnapshot(async snapshot => {
  //           const _data = snapshot.docs.map(doc => ({
  //             ...doc.data(),
  //             _id: doc.id,
  //             isPlaying: false,
  //             _time: doc.data().time.toDate(),
  //           }));

  //           setMessages(_data);

  //           const _res = formatMessages(_data);

  //           const _calls = _res
  //             .filter(e => e.type === 'call' || e.type === 'videoCall')
  //             .map(call => ({
  //               ...call,
  //               userData,
  //             }));

  //           setCallData(_calls); // Update the state with enriched call data
  //           setFormatedMessages(_res);
  //         });
  //       setloading(false);
  //     } catch (error) {
  //       setloading(false);
  //       console.log(
  //         '============ERROR IN FETCHING ALL MESSAGES==========',
  //         error,
  //       );
  //     }
  //   };

  const getAllMessages = async () => {
    try {
      setloading(true);

      await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .collection('messages')
        .orderBy('time', 'asc')
        .onSnapshot(async snapshot => {
          const _data = snapshot.docs.map(doc => ({
            ...doc.data(),
            _id: doc.id,
            isPlaying: false,
            _time: doc.data().time.toDate(),
          }));

          setMessages(_data);

          const _res = formatMessages(_data);

          // Filter and map calls (voice/video) with user data
          const _calls = _res.filter(
            e => e.type === 'call' || e.type === 'videoCall',
          );

          // Fetch user data for each call
          const chatsWithUser = await Promise.all(
            _calls.map(async call => {
              const receiverId = call.senderId; // Use senderId from the database

              try {
                // Fetch receiver user data from Firestore
                const userSnapshot = await firestore()
                  .collection('users')
                  .doc(receiverId)
                  .get();

                const userData = userSnapshot.data(); // Get user data
                return {
                  ...call,
                  userData, // Attach user data to the call object
                };
              } catch (userError) {
                console.error('Error fetching user data:', userError);
                return {
                  ...call,
                  userData: null, // Handle error by returning call with null userData
                };
              }
            }),
          );

          setCallData(chatsWithUser); // Update callData state with enriched data
          setFormatedMessages(_res); // Update formatted messages state
          setloading(false); // Set loading to false after completion
        });
    } catch (error) {
      setloading(false); // Handle errors by disabling loading
      console.error(
        '============ERROR IN FETCHING ALL MESSAGES==========',
        error,
      );
    }
  };

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
      const messageDate = message._time;
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
    getAllMessages();
    getUserData();
  }, []);
  // open the document link
  const openWebLink = link => {
    const formattedLink =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `http://${link}`;

    Linking.openURL(formattedLink)
      .then(() => console.log('Web link opened successfully'))
      .catch(error => console.error('Error opening web link: ', error));
  };

  // converting the milliseconds into seconds
  const convertMilliSecondsIntoMinutes = milli => {
    var minutes = Math.floor(milli / 6000);
    var seconds = ((milli % 60000) / 1000).toFixed(0);
    return seconds == 60
      ? minutes + 1 + ':00'
      : minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  // getting the information of the currently playing audio
  const getInfo = async () => {
    const info = await SoundPlayer.getInfo();
    if (info.duration !== undefined) {
      setTotalDuration(Math.ceil(info.duration));
    }
    if (info.currentTime !== undefined) {
      if (info.currentTime !== 0) {
        setAudioLoading(false);
      }
      var tim = Math.ceil(info.currentTime);
      var tot = Math.ceil(info.duration);

      var final = tim / tot;
      setCurrentPlaying(final);
    }
  };

  var _onFinishedPlayingSubscription = null;
  var _onFinishedLoadingURLSubscription = null;

  // starting the audio
  const startTimer = async item => {
    BackgroundTimer.stopBackgroundTimer();
    try {
      SoundPlayer.playUrl(item.mediaFile);
      BackgroundTimer.runBackgroundTimer(() => {
        getInfo();
        _onFinishedPlayingSubscription = SoundPlayer.addEventListener(
          'FinishedPlaying',
          ({success}) => {
            setCurrentPlaying(1);
            stopPlaying(item);
            BackgroundTimer.stopBackgroundTimer();
          },
          'FinishedLoading',
          ({success}) => {},
          'FinishedLoadingURL',
          ({success}) => {},
        );
      }, 1000);
    } catch (e) {
      console.log(`cannot play the sound file`, e);
    }
  };

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

  const sendMessages = async type => {
    try {
      await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .set(
          {
            message: '',
            time: new Date(),
            senderId: auth().currentUser.uid,
            receiverId: userData.userId,
            chatID: routeData.chatID,
            mediaFile: '',
            status: 'ongoing',
            isRead: false,
            type: type,
            replyId: '',
            from_num_message: firestore.FieldValue.increment(1),
            extraText: '',
          },
          {merge: true},
        );
      const id = await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .collection('messages')
        .doc().id;

      chatData = {
        message: '',
        time: new Date(),
        senderId: auth().currentUser.uid,
        receiverId: userData.userId,
        chatID: routeData.chatID,
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
        .doc(routeData.chatID)
        .collection('messages')
        .doc(id)
        .set(chatData);
    } catch (error) {
      console.log('==============ERROR IN SEDING MESSAGE=======', error);
    }
  };

  const getUserData = async () => {
    try {
      let allIDs = routeData.chatID.split('&');
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

  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} />
      <View style={styles.avatar}>
        <FastImage style={styles.avatarImge} source={{uri: userData.userImg}} />
      </View>
      <Text style={styles.heading}>{userData.name}</Text>
      <View style={styles.iconMainView}>
        <TouchableOpacity onPress={handleNavigate} style={styles.IconBtn}>
          <Image
            style={styles.iconStyles}
            source={require('../../assets/Message.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            navigation.navigate(screenNames.callScreen, {
              userData: userData,
              chatID: routeData.chatID,
              currentUserData: currenUserData,
              isFromVoice: false,
            });
            await sendMessages('videoCall');
          }}
          style={styles.IconBtn}>
          <Image
            style={styles.iconStyles}
            source={require('../../assets/video.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            navigation.navigate(screenNames.callScreen, {
              userData: userData,
              chatID: routeData.chatID,
              currentUserData: currenUserData,
              isFromVoice: true,
            });
            await sendMessages('call', '', '');
          }}
          style={styles.IconBtn}>
          <Image
            style={styles.iconStyles}
            source={require('../../assets/call.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={[commonSty.mainView, {marginTop: 15}]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <View style={styles.border} />
          <View style={styles.textView}>
            <Text style={styles.title}>{languge.t('emailAddress')}</Text>
            <Text style={[styles.normalText, {marginTop: 10}]}>
              {userData.email}
            </Text>
          </View>

          <View style={styles.headerView}>
            <Text style={[styles.normalText]}>
              {languge.t('videoAndCallHis')}
            </Text>
          </View>
          <ScrollView
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{flex: 1}}>
            <FlatList
              data={callData}
              showsHorizontalScrollIndicator={false}
              renderItem={({item, index}) => {
                return (
                  <CallCard
                    activeOpacity={1}
                    showCallIcons={false}
                    item={item}
                  />
                );
              }}
            />
          </ScrollView>
        </ScrollView>
      </View>
      <MyIndicator visible={loading} />
    </View>
  );
};

export default CallDetailScreen;

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
  IconBtn: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
  },
  iconStyles: {height: 25, width: 25},
  iconMainView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 80,
    marginTop: 20,
  },
  border: {
    height: 5,
    width: 50,
    borderRadius: 5,
    alignSelf: 'center',
    backgroundColor: colors.somkyWhite,
    marginTop: 10,
  },
  normalText: {
    fontSize: 18,
    fontFamily: Fonts.medium24,
    color: colors.black,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.medium24,
    color: colors.boderColor,
  },
  textView: {marginHorizontal: 20},
  imageView: {height: '100%', width: '100%'},
  imageMainView: {
    height: 80,
    width: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.somkyWhite,
    marginTop: 5,
  },
  soundImage: {
    height: 20,
    width: 50,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  docView: {
    flexDirection: 'row',
    backgroundColor: colors.primaryColor,
    minHeight: 80,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 7,
    overflow: 'hidden',
    marginTop: 5,
  },
  docInnerView: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 7,
    borderRightColor: 7,
    borderLeftWidth: 4,
    borderLeftColor: colors.white,
    flexDirection: 'row',
    backgroundColor: colors.caret,
  },

  // audioInnerView: {
  //   maxWidth: '95%',
  //   padding: 5,
  //   height: 60,
  //   justifyContent: 'center',
  //   borderRadius: 7,
  //   borderLeftColor: colors.white,
  //   borderLeftWidth: 5,
  // },
  iconStyle: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  audioContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 5,
  },
  audioInnerView: {
    maxWidth: '100%',
    padding: 5,
    height: 60,
    justifyContent: 'center',
    borderRadius: 7,
    borderLeftColor: colors.white,
    borderLeftWidth: 5,
    backgroundColor: colors.black,
  },
  audioContentView: {
    maxWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    fontFamily: Fonts.monaSans_Medium,
    color: '#888',
    marginLeft: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});
