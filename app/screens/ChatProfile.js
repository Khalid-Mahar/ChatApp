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
import TopComponent from '../components/TopComponent';
import colors from '../config/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import CommonStyle from '../config/CommonStyle';
import languge from '../languages/index';
import generateUserId from './chat/chatComponents/generateUserId';
import auth from '@react-native-firebase/auth';
import BackgroundTimer from 'react-native-background-timer';
import SoundPlayer from 'react-native-sound-player';
import * as Progress from 'react-native-progress';
import screenNames from '../config/ScreenNames';
import moment from 'moment';
import firestore, {doc} from '@react-native-firebase/firestore';
import Fonts from '../config/Fonts';
import VidComponents from '../components/VidComponents';
const {height, width} = Dimensions.get('screen');
const ChatProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const commonSty = CommonStyle();
  const {routeData, userData} = route.params;
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [docs, setDocs] = useState([]);
  const [audios, setAudios] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(0);
  const [TotalDuration, setTotalDuration] = useState(0);
  const [currenUserData, setCurrenUserData] = useState('');

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
  const getAllMessages = async () => {
    try {
      await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .collection('messages')
        .orderBy('time', 'asc')
        .onSnapshot(snapshot => {
          const _data = snapshot.docs.map(doc => ({
            ...doc.data(),
            _id: doc.id,
            isPlaying: false,
            time: doc.data().time.toDate(),
          }));
          setMessages(_data);
          const _res = formatMessages(_data);
          const _images = _res.filter(e => {
            return 'image' === e.type;
          });
          const _audio = _res.filter(e => {
            return 'audio' === e.type;
          });
          const _doc = _res.filter(e => {
            return 'doc' === e.type;
          });
          const _video = _res.filter(e => {
            return 'video' === e.type;
          });
          setImages(_images);
          setAudios(_audio);
          setDocs(_doc);
          setVedios(_video);
          setFormatedMessages(_res);
        });
    } catch (error) {
      console.log(
        '============ERRROR IN FETCING ALL MESSAGES==========',
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
            isRead: false,
            type: type,
            status: 'ongoing',
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
            source={require('../assets/Message.png')}
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
            source={require('../assets/video.png')}
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
            source={require('../assets/call.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={[commonSty.mainView, {marginTop: 15}]}>
        <ScrollView style={{flex: 1}}>
          <View style={styles.border} />
          <View style={styles.textView}>
            <Text style={styles.title}>{languge.t('emailAddress')}</Text>
            <Text style={[styles.normalText, {marginTop: 10}]}>
              {userData.email}
            </Text>
          </View>
          {/* images */}
          <View style={styles.headerView}>
            <Text style={[styles.normalText]}>{languge.t('images')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(screenNames.specificChats, {
                  userData: userData,
                  messageData: images,
                })
              }>
              <Text style={[styles.title]}>{languge.t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => {
              return (
                <View
                  style={[
                    styles.imageMainView,
                    {
                      marginLeft: index == 0 ? 20 : 10,
                      marginRight: index == images.length - 1 ? 10 : 0,
                      borderColor:
                        item.senderId === currentUser
                          ? colors.primaryColor
                          : // : '#f0f0f0',
                            colors.lightGray,
                    },
                  ]}>
                  <FastImage
                    style={styles.imageView}
                    source={{uri: item.mediaFile}}
                  />
                </View>
              );
            }}
          />
          {/* videos */}
          <View style={styles.headerView}>
            <Text style={[styles.normalText]}>{languge.t('video')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(screenNames.specificChats, {
                  userData: userData,
                  messageData: vedios,
                })
              }>
              <Text style={[styles.title]}>{languge.t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={vedios}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => {
              return <VidComponents data={audios} index={index} item={item} />;
            }}
          />
          {/* docs */}
          <View style={styles.headerView}>
            <Text style={[styles.normalText]}>{languge.t('document')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(screenNames.specificChats, {
                  userData: userData,
                  messageData: docs,
                })
              }>
              <Text style={[styles.title]}>{languge.t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={docs}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  onPress={() => openWebLink(item.mediaFile)}
                  style={[
                    styles.docView,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.primaryColor
                          : '#f0f0f0',
                      marginLeft: index == 0 ? 20 : 10,
                      marginRight: index == docs.length - 1 ? 10 : 0,
                    },
                  ]}>
                  <View
                    style={[
                      styles.docInnerView,
                      {
                        backgroundColor:
                          item.senderId === currentUser
                            ? colors.caret
                            : colors.lightGray,
                        borderLeftColor:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    <Image
                      style={[styles.iconStyles]}
                      source={require('../assets/ic_document.png')}
                    />
                    <Text>{item.extraText}</Text>
                  </View>
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}></Text>
                </TouchableOpacity>
              );
            }}
          />
          {/* video */}
          <View style={styles.headerView}>
            <Text style={[styles.normalText]}>{languge.t('audios')}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(screenNames.specificChats, {
                  userData: userData,
                  messageData: audios,
                })
              }>
              <Text style={[styles.title]}>{languge.t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={audios}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => {
              return (
                <>
                  <View
                    style={[
                      styles.audioContainer,
                      {
                        backgroundColor:
                          item.senderId === currentUser
                            ? colors.caret
                            : '#f0f0f0',
                        marginLeft: index == 0 ? 20 : 10,
                        marginRight: index == audios.length - 1 ? 10 : 0,
                      },
                    ]}>
                    <View
                      style={[
                        styles.audioInnerView,
                        {
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.primaryColor
                              : colors.lightGray,
                          borderLeftColor:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {!item.isPlaying ? (
                        <View style={[styles.audioContentView, {}]}>
                          <TouchableOpacity
                            onPress={() => {
                              setAudioLoading(true);
                              startPlaying(item);
                              startTimer(item);
                            }}>
                            <Image
                              style={[
                                styles.iconStyle,
                                {
                                  tintColor:
                                    item.senderId === currentUser
                                      ? colors.white
                                      : colors.black,
                                },
                              ]}
                              source={require('../assets/ic_play.png')}
                            />
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.timeText,
                              {
                                fontSize: 15,
                                marginLeft: 0,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {convertMilliSecondsIntoMinutes(item.extraText)}
                          </Text>
                          <Image
                            style={[
                              styles.soundImage,
                              {
                                tintColor:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}
                            source={require('../assets/ic_sound.png')}
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.audioContentView,
                            {
                              justifyContent: 'center',
                            },
                          ]}>
                          {!audioLoading ? (
                            <TouchableOpacity
                              onPress={() => {
                                BackgroundTimer.stop().then(() => {
                                  stopPlaying(item);
                                });
                                // BackgroundTimer.stopBackgroundTimer();
                              }}>
                              <Image
                                style={[
                                  styles.iconStyle,
                                  {
                                    tintColor:
                                      item.senderId === currentUser
                                        ? colors.white
                                        : colors.black,
                                  },
                                ]}
                                source={require('../assets/ic_pause.png')}
                              />
                            </TouchableOpacity>
                          ) : (
                            <Progress.Circle
                              size={20}
                              indeterminate={true}
                              color={
                                item.senderId === currentUser
                                  ? colors.white
                                  : colors.black
                              }
                            />
                          )}
                          <View style={{height: 30, justifyContent: 'center'}}>
                            <Progress.Bar
                              progress={currentPlaying}
                              width={width / 3}
                              height={4.5}
                              color={
                                item.senderId === currentUser
                                  ? colors.caret
                                  : colors.black
                              }
                              borderColor={
                                item.senderId === currentUser
                                  ? colors.white
                                  : colors.black
                              }
                              unfilledColor={colors.white}
                              style={{
                                alignSelf: 'center',

                                width: width / 5,
                                marginLeft: 10,
                              }}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              );
            }}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default ChatProfile;

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
