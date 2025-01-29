import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
const {height, width} = Dimensions.get('screen');
import FastImage from 'react-native-fast-image';
import colors from '../../../config/colors';
import ScreenComponent from '../../../components/ScreenComponent';
import Fonts from '../../../config/Fonts';
import BackgroundTimer from 'react-native-background-timer';
import SoundPlayer from 'react-native-sound-player';
import * as Progress from 'react-native-progress';
import language from '../../../languages/index';
import {useNavigation} from '@react-navigation/native';
import {createThumbnail} from 'react-native-create-thumbnail';
import Video from 'react-native-video';
import {
  GestureHandlerRootView,
  FlingGestureHandler,
  Directions,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useSharedValue,
  event,
} from 'react-native-reanimated';
const Messages = ({item, startPlaying, stopPlaying, data, swipeToReply}) => {
  const currentUser = auth().currentUser.uid;
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [TotalDuration, setTotalDuration] = useState(0);
  const [currentPlaying, setCurrentPlaying] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedImageType, setselectedImageType] = useState('');
  const [showplayPuaseIcon, setShowplayPuaseIcon] = useState(true);
  const [progress, setProgress] = useState(null);
  const [mediaBanner, setMediaBanner] = useState('');
  const [replyMediaBanner, setReplyMediaBanner] = useState('');
  const navigation = useNavigation();
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

  let startingPosition = 0;
  const x = useSharedValue(startingPosition);

  const eventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {},
    onActive: (event, ctx) => {
      x.value = 50;
    },
    onEnd: (event, ctx) => {
      x.value = withSpring(startingPosition);
    },
  });

  const useAmiStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: x.value}],
    };
  });
  const format = seconds => {
    let min = parseInt(seconds / 60)
      .toString()
      .padStart(2, '0');
    let sec = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  useEffect(() => {
    createThumbnail({
      url: item.mediaFile,
      timeStamp: 10000,
    })
      .then(response => {
        console.log('=====', response);
        setMediaBanner(response.path);
      })
      .catch(err => {
        // console.log({err});
      });
  }, []);
  useEffect(() => {
    createThumbnail({
      url: item.replyText,
      timeStamp: 10000,
    })
      .then(response => {
        setReplyMediaBanner(response.path);
      })
      .catch(err => {
        // console.log({err});
      });
  }, []);
  return (
    <GestureHandlerRootView>
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onGestureEvent={eventHandler}
        onHandlerStateChange={({nativeEvent}) => {
          if (nativeEvent.state === State.ACTIVE) {
            swipeToReply(item);
          }
        }}>
        <Animated.View style={[styles.chatContainer, useAmiStyle]}>
          <View
            style={[
              styles.message,
              item.senderId === currentUser
                ? styles.senderMessage
                : styles.receiverMessage,
            ]}>
            {/* show text message */}
            {item.type === 'txt' && item.replyId == '' && (
              <View
                style={[
                  styles.messageTextContainer,
                  {
                    backgroundColor:
                      item.senderId === currentUser ? colors.caret : '#f0f0f0',
                    borderBottomLeftRadius:
                      item.senderId === currentUser ? 10 : 0,
                    borderBottomRightRadius:
                      item.senderId === currentUser ? 0 : 10,
                  },
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      color:
                        item.senderId === currentUser
                          ? colors.white
                          : colors.black,
                    },
                  ]}>
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    {
                      color:
                        item.senderId === currentUser
                          ? colors.white
                          : colors.black,
                    },
                  ]}>
                  {moment(item.time).format('h:mm A')}
                </Text>
              </View>
            )}
            {/* show image message */}
            {item.type === 'image' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.messageTextContainer,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowImageModal(true);
                      setSelectedImage(item.mediaFile);
                      setselectedImageType(item.type);
                    }}>
                    <FastImage
                      source={{uri: item.mediaFile}}
                      style={[styles.messageImage]}
                    />
                  </TouchableOpacity>

                  {item.message !== '' && (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          marginTop: 5,
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.caret
                              : '#f0f0f0',
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {item.message}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* show vidoe message */}
            {item.type === 'video' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.messageTextContainer,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      // setShowImageModal(true);
                      // setSelectedImage(item.mediaFile);
                      // setTimeout(() => {
                      //   setShowplayPuaseIcon(false);
                      // }, 3000);
                      navigation.navigate('VideoPlaying', {
                        mediaFile: item.mediaFile,
                      });
                    }}>
                    {/* <Video
                      resizeMode="cover"
                      style={[
                        styles.messageImage,
                        {
                          backgroundColor:
                            item.senderId == currentUser
                              ? colors.caret
                              : colors.lightGray,
                        },
                      ]}
                      // source={{uri: mediaBanner}}
                      source={{uri: item?.mediaFile}}
                      paused={true}
                    /> */}
                    <FastImage
                      source={{uri: mediaBanner}}
                      style={[
                        styles.messageImage,
                        {
                          backgroundColor:
                            item.senderId == currentUser
                              ? colors.caret
                              : colors.lightGray,
                        },
                      ]}
                    />
                    <Image
                      style={[styles.vidoePlayIcon]}
                      source={require('../../../assets/ic_play.png')}
                    />
                  </TouchableOpacity>

                  {item.message !== '' && (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          marginTop: 5,
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.caret
                              : '#f0f0f0',
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {item.message}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* show document message*/}
            {item.type === 'doc' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.audioContainer,
                    {
                      width: '60%',
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => openWebLink(item.mediaFile)}
                    style={[
                      styles.replyInnerDocumentView,
                      {
                        paddingVertical: 10,
                        backgroundColor:
                          item.senderId === currentUser
                            ? colors.primaryColor
                            : colors.lightGrey,
                        borderLeftColor:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    <Image
                      source={require('../../../assets/ic_document.png')}
                      style={[
                        styles.iconStyle,
                        {
                          top: 5,
                          tintColor:
                            item.senderId === currentUser
                              ? '#f0f0f0'
                              : colors.charcoalGray,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        {
                          width: '86%',
                          marginLeft: 5,
                          fontSize: 13,
                          marginTop: 5,
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {item.extraText}
                    </Text>
                  </TouchableOpacity>

                  {item.message !== '' && (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          marginTop: 5,
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.caret
                              : '#f0f0f0',
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {item.message}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* show video message*/}
            {item.type === 'videoCall' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.audioContainer,
                    {
                      width: '60%',
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={[
                      styles.replyInnerDocumentView,
                      {
                        paddingVertical: 10,
                        backgroundColor:
                          item.senderId === currentUser
                            ? colors.primaryColor
                            : colors.lightGrey,
                        borderLeftColor:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    <Image
                      source={require('../../../assets/video.png')}
                      style={[
                        styles.iconStyle,
                        {
                          top: 5,
                          tintColor:
                            item.senderId === currentUser
                              ? '#f0f0f0'
                              : colors.charcoalGray,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        {
                          width: '86%',
                          marginLeft: 5,
                          fontSize: 13,
                          marginTop: 5,
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {language.t('video')} {language.t('call')}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* show call message*/}
            {item.type === 'call' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.audioContainer,
                    {
                      width: '60%',
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => openWebLink(item.mediaFile)}
                    style={[
                      styles.replyInnerDocumentView,
                      {
                        paddingVertical: 10,
                        backgroundColor:
                          item.senderId === currentUser
                            ? colors.primaryColor
                            : colors.lightGrey,
                        borderLeftColor:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    <Image
                      source={require('../../../assets/video.png')}
                      style={[
                        styles.iconStyle,
                        {
                          top: 5,
                          tintColor:
                            item.senderId === currentUser
                              ? '#f0f0f0'
                              : colors.charcoalGray,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        {
                          width: '86%',
                          marginLeft: 5,
                          fontSize: 13,
                          marginTop: 5,
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {language.t('audio')} {language.t('call')}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* show audio message */}
            {item.type === 'audio' && item.replyId == '' && (
              <>
                <View
                  style={[
                    styles.audioContainer,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
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
                            source={require('../../../assets/ic_play.png')}
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
                          source={require('../../../assets/ic_sound.png')}
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
                              source={require('../../../assets/ic_pause.png')}
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
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
            {/* replying the to particular message */}
            {item.replyId !== '' && (
              <>
                <View
                  style={[
                    styles.messageTextContainer,
                    {
                      backgroundColor:
                        item.senderId === currentUser
                          ? colors.caret
                          : '#f0f0f0',
                      borderBottomLeftRadius:
                        item.senderId === currentUser ? 10 : 0,
                      borderBottomRightRadius:
                        item.senderId === currentUser ? 0 : 10,
                    },
                  ]}>
                  {/* reply to any message which type is text */}
                  {item.previouseMessageType == 'txt' && (
                    <View
                      style={[
                        styles.replyMessageInnerView,
                        {
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.darkBlue
                              : colors.lightGray,
                          borderLeftColor:
                            item.senderId === currentUser
                              ? colors._lightBlue
                              : colors.black,
                        },
                      ]}>
                      <View
                        style={[
                          styles.audioContentView,
                          {flexDirection: 'column', alignItems: 'flex-start'},
                        ]}>
                        {item.senderId == auth().currentUser.uid ? (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {'You'}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {data.name}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            {
                              fontSize: 15,
                              marginLeft: 0,
                              alignSelf: 'flex-start',
                              color:
                                item.senderId === currentUser
                                  ? colors.white
                                  : colors.black,
                            },
                          ]}>
                          {item.replyMessage.length > 20
                            ? item.replyMessage.slice(0, 30) + '...'
                            : item.replyMessage}
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* reply to a message which type is image */}
                  {item.previouseMessageType == 'image' && (
                    <View
                      style={[
                        styles.replyMessageInnerView,
                        {
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          height: 70,
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
                      <View
                        style={[styles.replyNameTextView, {maxWidth: '72%'}]}>
                        {item.senderId == auth().currentUser.uid ? (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                marginRight: 10,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {'You'}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                marginRight: 10,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {data.name}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            {
                              fontSize: 15,
                              marginRight: 10,
                              marginLeft: 0,
                              alignSelf: 'flex-start',
                              color:
                                item.senderId === currentUser
                                  ? colors.white
                                  : colors.black,
                            },
                          ]}>
                          {item.replyMessage.length > 10
                            ? item.replyMessage.slice(0, 40) + '...'
                            : item.replyMessage}
                        </Text>
                      </View>
                      <FastImage
                        style={styles.replyImage}
                        source={{uri: item.replyText}}
                      />
                    </View>
                  )}
                  {/* reply to a message which type is Video */}
                  {item.previouseMessageType == 'video' && (
                    <View
                      style={[
                        styles.replyMessageInnerView,
                        {
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          height: 70,
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.lightGray,
                          borderLeftColor:
                            item.senderId === currentUser
                              ? colors._lightBlue
                              : colors.black,
                        },
                      ]}>
                      <View
                        style={[styles.replyNameTextView, {maxWidth: '72%'}]}>
                        {item.senderId == auth().currentUser.uid ? (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                marginRight: 10,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {'You'}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                marginRight: 10,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {data.name}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            {
                              fontSize: 15,
                              marginRight: 10,
                              marginLeft: 0,
                              alignSelf: 'flex-start',
                              color:
                                item.senderId === currentUser
                                  ? colors.white
                                  : colors.black,
                            },
                          ]}>
                          {item.replyMessage.length > 10
                            ? item.replyMessage.slice(0, 40) + '...'
                            : item.replyMessage}
                        </Text>
                      </View>
                      {/* <Video
                        paused={true}
                        resizeMode="cover"
                        style={[
                          styles.replyImage,
                          {
                            backgroundColor:
                              item.senderId == currentUser
                                ? colors.caret
                                : '#f0f0f0',
                          },
                        ]}
                        source={{uri: item.replyText}}
                      /> */}
                      <FastImage
                        style={[
                          styles.replyImage,
                          {
                            backgroundColor:
                              item.senderId == currentUser
                                ? colors.caret
                                : '#f0f0f0',
                          },
                        ]}
                        source={{uri: replyMediaBanner}}
                      />
                    </View>
                  )}
                  {/* reply to any message which type is audio */}
                  {item.previouseMessageType == 'audio' && (
                    <View
                      style={[
                        styles.replyMessageInnerView,
                        {
                          justifyContent: 'flex-start',
                          flexDirection: 'row',
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.darkBlue
                              : colors.lightGray,
                          borderLeftColor:
                            item.senderId === currentUser
                              ? colors._lightBlue
                              : colors.black,
                        },
                      ]}>
                      <View
                        style={[styles.replyNameTextView, {maxWidth: 'auto'}]}>
                        {item.senderId == auth().currentUser.uid ? (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {'You'}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {data.name}
                          </Text>
                        )}
                        <View style={styles.audioView}>
                          <Image
                            style={[
                              styles.micIcon,
                              {
                                tintColor:
                                  item.senderId === currentUser
                                    ? colors.lightGray
                                    : colors.black,
                              },
                            ]}
                            source={require('../../../assets/ic_micIcon.png')}
                          />
                          <Text
                            style={[
                              styles.timeText,
                              {
                                fontSize: 14,
                                marginRight: 10,
                                marginLeft: 0,
                                alignSelf: 'flex-start',
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {language.t('voiceMessage')} (
                            {convertMilliSecondsIntoMinutes(item.replyMessage)})
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                  {/* reply to a message which type is doc */}
                  {item.previouseMessageType == 'doc' && (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => openWebLink(item.replyText)}
                      style={[
                        styles.replyInnerDocumentView,
                        {
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.darkBlue
                              : colors.lightGrey,
                          borderLeftColor:
                            item.senderId === currentUser
                              ? colors._lightBlue
                              : colors.black,
                        },
                      ]}>
                      <View
                        style={[styles.replyNameTextView, {maxWidth: '82%'}]}>
                        {item.senderId == auth().currentUser.uid ? (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {'You'}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.replyTextUserName,
                              {
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {data.name}
                          </Text>
                        )}

                        <View
                          style={[
                            styles.audioView,

                            {
                              marginTop: 0,
                              alignItems: 'flex-start',
                            },
                          ]}>
                          <Image
                            style={[
                              styles.micIcon,
                              {
                                marginTop: 5,
                                tintColor:
                                  item.senderId === currentUser
                                    ? colors.lightGray
                                    : colors.black,
                              },
                            ]}
                            source={require('../../../assets/ic_document.png')}
                          />
                          <Text
                            style={[
                              styles.timeText,
                              {
                                fontSize: 14,
                                marginRight: 10,
                                marginLeft: 3,
                                alignSelf: 'flex-start',
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {item.replyMessage}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  {/* reply to any message with image */}
                  {item.type == 'image' && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowImageModal(true);
                        setSelectedImage(item.mediaFile);
                      }}>
                      <FastImage
                        source={{uri: item.mediaFile}}
                        style={[
                          styles.messageImage,
                          {marginTop: 10, minWidth: 'auto'},
                        ]}
                      />
                    </TouchableOpacity>
                  )}
                  {/* reply to message which type is vidoe */}
                  {item.type == 'video' && (
                    <TouchableOpacity
                      onPress={() => {
                        // setShowImageModal(true);
                        // setSelectedImage(item.mediaFile);
                        // setTimeout(() => {
                        //   setShowplayPuaseIcon(false);
                        // }, 3000);
                        navigation.navigate('VideoPlaying', {
                          mediaFile: item.mediaFile,
                        });
                      }}>
                      {/* <Video
                        source={{uri: item.mediaFile}}
                        style={[
                          styles.messageImage,
                          {
                            marginTop: 10,
                            minWidth: 'auto',
                            backgroundColor:
                              item.senderId === currentUser
                                ? colors.darkBlue
                                : colors.lightGray,
                          },
                        ]}
                        paused={true}
                      /> */}
                      <FastImage
                        style={[
                          styles.messageImage,
                          {
                            marginTop: 10,
                            minWidth: 'auto',
                            backgroundColor:
                              item.senderId === currentUser
                                ? colors.darkBlue
                                : colors.lightGray,
                          },
                        ]}
                        source={{uri: mediaBanner}}
                      />
                      <Image
                        style={styles.vidoePlayIcon}
                        source={require('../../../assets/ic_play.png')}
                      />
                    </TouchableOpacity>
                  )}
                  {/* reply any message with voice chat */}
                  {item.type == 'audio' && (
                    <>
                      <View style={[styles.replyaudioInnerView]}>
                        {!item.isPlaying ? (
                          <View
                            style={[
                              styles.audioContentView,
                              {justifyContent: 'flex-start'},
                            ]}>
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
                                source={require('../../../assets/ic_play.png')}
                              />
                            </TouchableOpacity>
                            <Text
                              style={[
                                styles.timeText,
                                {
                                  fontSize: 15,
                                  marginLeft: 10,
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
                                  marginLeft: 10,
                                  tintColor:
                                    item.senderId === currentUser
                                      ? colors.white
                                      : colors.black,
                                },
                              ]}
                              source={require('../../../assets/ic_sound.png')}
                            />
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.audioContentView,
                              {
                                justifyContent: 'flex-start',
                              },
                            ]}>
                            {!audioLoading ? (
                              <TouchableOpacity
                                onPress={() => {
                                  BackgroundTimer.stop().then(() => {
                                    stopPlaying(item);
                                  });
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
                                  source={require('../../../assets/ic_pause.png')}
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
                            <View
                              style={{height: 30, justifyContent: 'center'}}>
                              <Progress.Bar
                                progress={currentPlaying}
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
                                  width: width / 4.3,
                                  marginLeft: 10,
                                }}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                  {/* reply to any message with the doc */}
                  {item.type == 'doc' && (
                    <View
                      style={[
                        styles.audioContainer,
                        {
                          maxWidth: '82%',
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.caret
                              : '#f0f0f0',
                          borderBottomLeftRadius:
                            item.senderId === currentUser ? 10 : 0,
                          borderBottomRightRadius:
                            item.senderId === currentUser ? 0 : 10,
                        },
                      ]}>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => openWebLink(item.replyText)}
                        style={[
                          styles.replyMessageWithDoc,
                          {
                            right: 10,
                          },
                        ]}>
                        <View
                          style={[
                            styles.audioView,

                            {
                              marginTop: 0,
                              alignItems: 'flex-start',
                            },
                          ]}>
                          <Image
                            source={require('../../../assets/ic_document.png')}
                            style={[
                              styles.iconStyle,
                              {
                                top: 5,
                                tintColor:
                                  item.senderId === currentUser
                                    ? colors.lightGray
                                    : colors.black,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.messageText,
                              {
                                width: '86%',
                                marginLeft: 5,
                                fontSize: 13,
                                marginTop: 5,
                                color:
                                  item.senderId === currentUser
                                    ? colors.white
                                    : colors.black,
                              },
                            ]}>
                            {item.extraText}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  {item.message !== '' && (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          marginTop: 5,
                          backgroundColor:
                            item.senderId === currentUser
                              ? colors.caret
                              : '#f0f0f0',
                          color:
                            item.senderId === currentUser
                              ? colors.white
                              : colors.black,
                        },
                      ]}>
                      {item.message}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          item.senderId === currentUser
                            ? colors.white
                            : colors.black,
                      },
                    ]}>
                    {moment(item.time).format('h:mm A')}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Modal
            animationType="slide"
            visible={showImageModal}
            transparent={true}>
            <ScreenComponent style={{flex: 1, backgroundColor: colors.white}}>
              <TouchableOpacity
                onPress={() => {
                  setShowImageModal(false);
                  setSelectedImage('');
                  setselectedImageType('');
                  setShowplayPuaseIcon(true);
                  setProgress('');
                }}
                style={styles.modalIconStyle}>
                <Image
                  source={require('../../../assets/close.png')}
                  style={styles.modalIcon}
                />
              </TouchableOpacity>
              <View style={styles.mainImageView}>
                <FastImage
                  resizeMode="contain"
                  source={{uri: selectedImage}}
                  style={styles.modalMainImage}
                />
              </View>
            </ScreenComponent>
          </Modal>
        </Animated.View>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
};
export default Messages;

const styles = StyleSheet.create({
  chatContainer: {
    // padding: 20,
    marginHorizontal: 10,
  },
  message: {
    flexDirection: 'column',
    // marginBottom: 10,
  },
  senderMessage: {
    alignItems: 'flex-end',
  },
  receiverMessage: {
    alignItems: 'flex-start',
  },
  messageTextContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxWidth: '90%',
    overflow: 'hidden',
  },
  messageText: {
    // padding: 10,
  },
  timeText: {
    fontSize: 10,
    fontFamily: Fonts.monaSans_Medium,
    color: '#888',
    marginLeft: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  messageImage: {
    minWidth: '99%',
    minHeight: 250,
    borderRadius: 10,
    alignSelf: 'center',
    aspectRatio: 1,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Mona-Sans-SemiBold',
    alignSelf: 'center',
    color: colors.black,
  },
  // modal
  modalIconStyle: {
    height: 30,
    width: 30,
    backgroundColor: colors.caret,
    borderRadius: 15,
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: Platform.OS == 'android' ? 10 : 0,
  },
  modalIcon: {
    height: 30,
    width: 30,
    tintColor: colors.white,
  },
  mainImageView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  modalMainImage: {
    height: '50%',
    width: '100%',
  },
  audioContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '50%',
    overflow: 'hidden',
  },
  audioInnerView: {
    maxWidth: '95%',
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
  iconStyle: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  soundImage: {
    height: 20,
    width: 50,
  },
  // document picker
  documentInnerView: {
    flexDirection: 'row',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 5,
    height: 60,
    borderRadius: 7,
    borderLeftColor: colors.darkBlue,
    borderLeftWidth: 5,
  },
  replyMessageInnerView: {
    // maxWidth: '95%',
    maxWidth: 'auto',
    padding: 5,
    height: 60,
    justifyContent: 'center',
    borderRadius: 7,
    borderLeftColor: colors.darkBlue,
    borderLeftWidth: 5,
    backgroundColor: colors._lightBlue,
  },
  replyImage: {
    height: 60,
    width: 70,
    borderRadius: 5,
  },
  replyNameTextView: {
    maxWidth: '70%',
  },
  audioView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  micIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  replyTextUserName: {
    fontFamily: Fonts.monaSans_semiBold,
  },
  replyaudioInnerView: {
    maxWidth: '95%',
    padding: 5,
    height: 60,
    justifyContent: 'center',
  },
  replyInnerDocumentView: {
    maxHeight: '100%',
    maxWidth: 'auto',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'center',
    borderRadius: 7,
    borderLeftColor: colors.darkBlue,
    borderLeftWidth: 5,
  },
  replyMessageWithDoc: {
    maxHeight: '100%',
    maxWidth: 'auto',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  vidoePlayIcon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    position: 'absolute',
    top: '45%',
    left: '45%',
    tintColor: colors.white,
  },
  modalPlayPauseView: {
    position: 'absolute',
    height: 55,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: colors.lightGray,
  },
  modalVideoPlayIcon: {
    height: 28,
    width: 28,
    resizeMode: 'contain',
  },
  seekBarView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  videoText: {
    fontSize: 15,
    fontFamily: Fonts.monaSans_Medium,
    color: colors.textColor,
  },
});
