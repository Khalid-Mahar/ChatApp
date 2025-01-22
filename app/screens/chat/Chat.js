import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import colors from '../../config/colors';
import ChatHeader from './chatComponents/ChatHeader';
import ChatInput from './chatComponents/ChatInput';
import ModalHeader from '../../components/ModalHeader';
import language from '../../languages/index';
import AttachementCard from '../../components/AttachementCard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image';
import MessageSeperator from './chatComponents/MessageSeperator';
import {launchImageLibrary} from 'react-native-image-picker';
import firebase from '@react-native-firebase/app';
import SoundPlayer from 'react-native-sound-player';
import {PERMISSIONS, request} from 'react-native-permissions';
import Video from 'react-native-video';
import SoundRecorder from 'react-native-sound-recorder';
import uploadImage from '../../utils/UploadImage';
import BackgroundTimer from 'react-native-background-timer';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Messages from './chatComponents/Messages';
import ScreenComponent from '../../components/ScreenComponent';
import firebaseKeys from '../../config/firebaseKeys';
import cameraOpening from '../../utils/OpenCamera';
import screenNames from '../../config/ScreenNames';
const audioRecorderPlayer = new AudioRecorderPlayer();

const {height, width} = Dimensions.get('screen');
const Chat = () => {
  const insect = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const {routeData, userData} = route.params;

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

  const [messageText, setMessageText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaDuration, setSelectedMediaDuration] = useState();
  const [documentPickerResponce, setdocumentPickerResponce] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [recordSecs, setRecordSecs] = useState(0);
  const [data, setData] = useState('');
  const [currenUserData, setCurrenUserData] = useState('');

  const [messages, setMessages] = useState([]);
  const [formatedMessages, setFormatedMessages] = useState([]);

  // media files
  const [selectMediaType, setSelectMediaType] = useState('');

  // loading states
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // replying on message's
  const [replyMessageType, setReplyMessageType] = useState('');
  const [replyId, setReplyId] = useState('');
  const [replyUserId, setReplyUserId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [previouseMessage, setPreviouseMessage] = useState('');

  //   modal
  const [attachementModal, setAttachementModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [recordingModal, setRecordingModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const _pickImage = () => {
    const options = {
      title: 'Select Attachment File',
      storageOptions: {
        skipBackup: true,
      },
      mediaType: 'mixed',
    };
    launchImageLibrary(options, response => {
      console.log(response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets) {
        const getType = response.assets?.[0].type;
        const type = getType.split('/');
        const _type = type[0];
        if (_type == 'video') {
          setSelectedMediaDuration(response.assets?.[0].duration);
        }
        setSelectMediaType(_type);
        const source = {uri: response.uri};
        let imageUri = response.uri || response.assets?.[0]?.uri;
        let imageType = response.type || response.assets?.[0]?.type;
        setSelectedMedia(imageUri);
        setMediaType(imageType);
        setTimeout(() => {
          setShowImageModal(true);
          setShowAttachmentModal(false);
          setAttachementModal(false);
          setLoading(false);
        }, 1000);
      }
    });
  };
  // upload media file's
  const uploadData = async (mediaFile, type, isFromAudio, extraText) => {
    try {
      if (isFromAudio) {
        var mediaFile = 'file://' + mediaFile;
      }
      setLoading(true);
      setIsLoading(true);
      console.log(mediaFile, mediaType);
      const downloadURL = await uploadImage('users', mediaFile, mediaType);
      console.log(downloadURL);
      setIsLoading(true);
      await sendMessages(type, downloadURL, extraText);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setIsLoading(false);
      console.log(
        '===========ERROR IN UPLOADING THE MEDIA FILE TO CLOUD=======',
        error,
      );
    }
  };

  // clear the seen messages
  const handleClearMessages = async () => {
    try {
      console.log('here');
      await firebase
        .firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .get()
        .then(snap => {
          if (snap.exists) {
            if (snap.data().receiverId === auth().currentUser.uid) {
              firebase.firestore().collection('chat').doc(routeData.chatID).set(
                {
                  from_num_message: 0,
                },
                {merge: true},
              );
            }
          }
        });
    } catch (error) {
      console.log('=======ERROR IN CLEARING SEEN MESSAGES=====', error);
    }
  };
  // getting reciver data
  const getUserData = async () => {
    try {
      await firestore()
        .collection('users')
        .doc(reciverId)
        .onSnapshot(snap => {
          if (snap.exists) {
            const _data = snap.data();
            setData(_data);
          }
        });
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
    handleClearMessages();
  }, []);

  const swipeToReply = itemReply => {
    let replyMessage = '';
    if (itemReply.type === 'txt') {
      setReplyMessageType(itemReply.type);
      replyMessage =
        itemReply.message.length > 20
          ? itemReply.message.slice(0, 20) + '...'
          : itemReply.message;
      setPreviouseMessage(itemReply.message);
    } else if (itemReply.type === 'audio') {
      setReplyMessageType(itemReply.type);
      setPreviouseMessage(itemReply.extraText);
      replyMessage = itemReply.mediaFile;
    } else if (itemReply.type === 'image') {
      setReplyMessageType(itemReply.type);
      setPreviouseMessage(itemReply.message);
      replyMessage = itemReply.mediaFile;
      setSelectMediaType('image');
    } else if (itemReply.type === 'video') {
      setReplyMessageType(itemReply.type);
      setPreviouseMessage(itemReply.message);
      replyMessage = itemReply.mediaFile;
      setSelectMediaType('video');
    } else {
      setReplyMessageType(itemReply.type);
      setPreviouseMessage(itemReply.extraText);
      replyMessage = itemReply.mediaFile;
    }
    setReplyId(itemReply.id);
    setReplyText(replyMessage);
    setReplyUserId(itemReply.senderId);
  };

  const requestPermision = async () => {
    let permissionResult;
    if (Platform.OS == 'android') {
      permissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      console.log('=====', permissionResult);
    } else {
      // permissionResult = await request(PERMISSIONS.IOS.MICROPHONE);
      //   console.log('---', permissionResult);
      startRecodingAudio();
    }
    if (permissionResult === 'granted') {
      startRecodingAudio();
    } else if (Platform.OS == 'android') {
      if (
        permissionResult == 'never_ask_again' ||
        permissionResult == 'denied'
      ) {
        Alert.alert('Allow Permission To Access Your Microphone', '', [
          {
            text: 'Ok',
            onPress: () => {
              setRecordingModal(false);
              Linking.openSettings();
            },
          },
          {
            text: 'Cancel',
            onPress: () => setRecordingModal(false),
            style: 'cancel',
          },
        ]);
      }
    }
  };

  // Recording Audio Message's
  const startRecodingAudio = async () => {
    if (Platform.OS == 'ios') {
      SoundRecorder.start(SoundRecorder.PATH_CACHE + '/' + Date.now() + '.mp4')
        .then(function () {})
        .catch(function (error) {
          console.log('error', error);
        });
    } else {
      await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener(e => {
        setRecordSecs(e.currentPosition);
        console.log('Recording . . . ', e.currentPosition);
        return;
      });
    }
  };

  // stop recording audio message
  const sendRecording = async () => {
    try {
      if (Platform.OS == 'ios') {
        await SoundRecorder.stop()
          .then(function (res) {
            console.log('res', res, 'resDuration', res.duration);
            setLoading(true);
            setMediaType('mp4');
            uploadData(res.path, 'audio', true, res.duration);
          })
          .catch(function (e) {
            console.log('------', e);
          });
      } else {
        const res = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        console.log(res);
        setMediaType('mp4');
        uploadData(res, 'audio', false, recordSecs);
      }
    } catch (e) {
      console.log('stopping_failed', 'Stop failed ' + e);
      setLoading(false);
      return;
    }
  };

  const handleDocumentPicker = useCallback(async () => {
    try {
      const allowTypes = [
        DocumentPicker.types.ppt,
        DocumentPicker.types.pptx,
        DocumentPicker.types.pdf,
        DocumentPicker.types.xls,
        DocumentPicker.types.xlsx,
        DocumentPicker.types.zip,
        DocumentPicker.types.csv,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
        DocumentPicker.types.plainText,
      ];
      const respoce = await DocumentPicker.pickSingle({
        type: allowTypes,
        copyTo:
          Platform.OS === 'android' ? 'cachesDirectory' : 'documentDirectory',
      });
      setMediaType(respoce.type);
      setdocumentPickerResponce(respoce);
      setAttachementModal(false);
      setShowDocumentModal(true);
    } catch (error) {
      console.log('====ERROR IN PICKING DOCUMENT====', error);
    }
  }, []);

  // sending a new message
  const sendMessages = async (type, mediaFile, extraText) => {
    try {
      setIsLoading(false);
      await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .set(
          {
            message: messageText,
            time: new Date(),
            senderId: senderId,
            receiverId: reciverId,
            status: 'ongoing',
            chatID: routeData.chatID,
            mediaFile: mediaFile,
            isRead: false,
            type: type,
            replyId: replyId !== '' ? replyId : '',
            from_num_message: firestore.FieldValue.increment(1),
            extraText: extraText,
          },
          {merge: true},
        );
      const id = await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .collection('messages')
        .doc().id;
      // if (data?.status !== 'online') {
      //   await sendMessage(
      //     'New Message Received',
      //     messageText,
      //     data?.profileImage,
      //     reciverId,
      //     'message',
      //     auth().currentUser.uid,
      //     data?.fcmToken,
      //     routeData.chatID,
      //     `${currenUserData?.firstName}${' '}${currenUserData?.lastName}`,
      //   );
      // }

      if (replyId !== '') {
        chatData = {
          message: messageText,
          time: new Date(),
          senderId: senderId,
          receiverId: reciverId,
          chatID: routeData.chatID,
          mediaFile: mediaFile,
          type: type,
          id: id,
          extraText: extraText,
          replyText: replyText,
          previouseMessageType: replyMessageType,
          replyId: replyId,
          replyMessage: previouseMessage,
        };
      } else {
        chatData = {
          message: messageText,
          time: new Date(),
          senderId: senderId,
          receiverId: reciverId,
          chatID: routeData.chatID,
          mediaFile: mediaFile,
          type: type,
          id: id,
          replyId: '',
          extraText: extraText,
        };
      }
      setMessageText('');
      setShowImageModal(false);
      setRecordingModal(false);
      setMediaType('');
      setShowDocumentModal(false);
      if (replyId !== '') {
        setReplyId('');
        setReplyText('');
        setReplyMessageType('');
      }
      await firestore()
        .collection('chat')
        .doc(routeData.chatID)
        .collection('messages')
        .doc(id)
        .set(chatData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('==============ERROR IN SEDING MESSAGE=======', error);
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
  const _closeReply = () => {
    setReplyId('');
    setReplyText('');
    setReplyMessageType('');
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.white}}>
      <ChatHeader
        userInfo={userData}
        onVideoCallPress={async () => {
          navigation.navigate(screenNames.callScreen, {
            userData: userData,
            chatID: routeData.chatID,
            currentUserData: currenUserData,
            isFromVoice: false,
          });
          await sendMessages('videoCall', '', '');
        }}
        onCallPress={async () => {
          navigation.navigate(screenNames.callScreen, {
            userData: userData,
            chatID: routeData.chatID,
            currentUserData: currenUserData,
            isFromVoice: true,
          });
          await sendMessages('call', '', '');
        }}
      />
      <FlatList
        inverted={true}
        data={[...formatedMessages].reverse()}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          if (!item.isSeparator) {
            return (
              <Messages
                swipeToReply={swipeToReply}
                stopPlaying={stopPlaying}
                startPlaying={startPlaying}
                item={item}
                data={data}
              />
            );
          } else {
            return <MessageSeperator date={item.date} />;
          }
        }}
        ItemSeparatorComponent={<View style={{marginVertical: 8}} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{}}>
        <ChatInput
          value={messageText}
          setValue={setMessageText}
          attachmentPress={() => {
            setAttachementModal(true);
            console.log('here');
          }}
          onMicPress={async () => {
            setRecordingModal(true);
            requestPermision();
          }}
          _sendMessage={() => {
            if (messageText !== '') {
              setIsLoading(true);
              sendMessages('txt', '', '');
            }
          }}
          onCameraPress={async () => {
            await cameraOpening(
              setSelectedMedia,
              setAttachementModal,
              setMediaType,
            );
            setSelectMediaType('image');
            setTimeout(() => {
              setShowImageModal(true);
            }, 2000);
          }}
          loader={loading}
          replyId={replyId}
          // showVoice={false}
          data={data}
          replyMessageType={replyMessageType}
          replyUserId={replyUserId}
          replyText={replyText}
          closeReply={() => _closeReply()}
        />
      </KeyboardAvoidingView>
      {attachmentModal()}
      {imageModal()}
      {audioModal()}
      {documentModal()}
    </View>
  );

  function attachmentModal() {
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={attachementModal}>
        <TouchableOpacity
          onPress={() => setAttachementModal(false)}
          activeOpacity={1}
          style={styles.attachmentModal}>
          <TouchableOpacity activeOpacity={1} style={[styles.attModalContent]}>
            <ModalHeader
              onPress={() => setAttachementModal(false)}
              title={language.t('shareContent')}
            />
            {/* <AttachementCard
              style={{marginTop: 30}}
              icon={require('../../assets/search_.png')}
              title={language.t('search')}
              showSubtitle={false}
            /> */}
            <AttachementCard
              onPress={async () => {
                await cameraOpening(
                  setSelectedMedia,
                  setAttachementModal,
                  setMediaType,
                );
                setSelectMediaType('image');
                setTimeout(() => {
                  setShowImageModal(true);
                }, 2000);
              }}
              icon={require('../../assets/camera.png')}
              title={language.t('camera')}
              showSubtitle={false}
            />
            <AttachementCard
              onPress={() => {
                handleDocumentPicker();
              }}
              icon={require('../../assets/doc.png')}
              title={language.t('document')}
              substitle={language.t('shareFile')}
            />
            <AttachementCard
              onPress={() => {
                _pickImage();
              }}
              icon={require('../../assets/media.png')}
              title={language.t('media')}
              substitle={language.t('sharePhotosVid')}
            />
            <AttachementCard
              onPress={() => {
                setRecordingModal(true);
                requestPermision();
              }}
              icon={require('../../assets/microphone.png')}
              title={language.t('voice')}
              substitle={language.t('sendVoiceMsg')}
            />
            {/* <AttachementCard
              style={{marginBottom: 40}}
              icon={require('../../assets/location.png')}
              title={language.t('location')}
              substitle={language.t('shareLocation')}
            /> */}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  function imageModal() {
    return (
      <Modal animationType="slide" transparent={true} visible={showImageModal}>
        <TouchableOpacity
          onPress={() => setShowImageModal(false)}
          activeOpacity={1}
          style={styles.modal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={[styles.modal]}>
            <View style={styles.modalInnerView} activeOpacity={1}>
              <TouchableOpacity activeOpacity={1} style={styles.modalcontent}>
                <TouchableOpacity
                  onPress={() => setShowImageModal(false)}
                  style={styles.iconView}>
                  <Image
                    style={{height: 30, width: 30, tintColor: colors.white}}
                    source={require('../../assets/close.png')}
                  />
                </TouchableOpacity>
                {selectMediaType == 'image' ? (
                  <Image
                    resizeMode="contain"
                    style={styles.selectedImages}
                    source={{uri: selectedMedia}}
                  />
                ) : (
                  <Video
                    style={styles.selectedImages}
                    source={{uri: selectedMedia}}
                    paused={true}
                  />
                )}
                <ChatInput
                  value={messageText}
                  setValue={setMessageText}
                  attachmentPress={() => {
                    setAttachementModal(true);
                  }}
                  _sendMessage={() => {
                    if (selectMediaType == 'image') {
                      uploadData(selectedMedia, selectMediaType, false, '');
                    } else {
                      console.log('else');
                      uploadData(
                        selectedMedia,
                        selectMediaType,
                        false,
                        selectedMediaDuration,
                      );
                    }
                  }}
                  onCameraPress={async () => {
                    await cameraOpening(
                      setSelectedMedia,
                      setAttachementModal,
                      setMediaType,
                    );
                    setSelectMediaType('image');
                    setTimeout(() => {
                      setShowImageModal(true);
                    }, 2000);
                  }}
                  loader={loading}
                  replyId={replyId}
                  // showVoice={false}
                  data={data}
                  replyMessageType={replyMessageType}
                  replyUserId={replyUserId}
                  replyText={replyText}
                  closeReply={() => _closeReply()}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    );
  }
  function audioModal() {
    return (
      <Modal animationType="slide" transparent={true} visible={recordingModal}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setRecordingModal(false)}
          style={[styles.modal, {justifyContent: 'flex-end'}]}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalcontent]}>
            <TouchableOpacity
              onPress={() => {
                setRecordingModal(false);
                if (Platform.OS == 'ios') {
                  SoundRecorder.stop()
                    .then(function () {})
                    .catch(function (e) {
                      console.log('Error in stop recording', e);
                    });
                } else {
                  audioRecorderPlayer.stopRecorder();
                  audioRecorderPlayer.removeRecordBackListener();
                }
              }}
              style={styles.iconView}>
              <Image
                on
                style={{height: 30, width: 30, tintColor: colors.white}}
                source={require('../../assets/close.png')}
              />
            </TouchableOpacity>
            <View style={styles.micView}>
              <FastImage
                style={styles.micImage}
                source={require('../../assets/ic_mic.gif')}
              />
            </View>
            <TouchableOpacity
              onPress={() => sendRecording()}
              disabled={loading}
              activeOpacity={0.5}
              style={styles.pauseIcon}>
              {!loading ? (
                <Text style={styles.sendMessage}>
                  {language.t('sendMessage')}
                </Text>
              ) : (
                <ActivityIndicator size={'small'} color={colors.white} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }
  function documentModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDocumentModal}>
        <TouchableOpacity
          onPress={() => setShowImageModal(false)}
          activeOpacity={1}
          style={styles.modal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.modal}>
            <View style={styles.modalInnerView} activeOpacity={1}>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.modalcontent, {}]}>
                <TouchableOpacity
                  onPress={() => setShowDocumentModal(false)}
                  style={styles.iconView}>
                  <Image
                    on
                    style={{height: 30, width: 30, tintColor: colors.white}}
                    source={require('../../assets/close.png')}
                  />
                </TouchableOpacity>
                <View style={styles.documentLogoView}>
                  <Image
                    resizeMode="contain"
                    style={[styles.selectedDoc, {tintColor: colors.boderColor}]}
                    source={require('../../assets/ic_document.png')}
                  />
                  <Text style={styles.messageText}>
                    {documentPickerResponce.name}
                  </Text>
                </View>
                <ChatInput
                  value={messageText}
                  setValue={setMessageText}
                  attachmentPress={() => {
                    setShowDocumentModal(false);
                    setShowAttachmentModal(true);
                  }}
                  _sendMessage={() => {
                    uploadData(
                      documentPickerResponce.fileCopyUri,
                      'doc',
                      false,
                      documentPickerResponce.name,
                    );
                  }}
                  onCameraPress={async () => {
                    await cameraOpening(
                      setSelectedMedia,
                      setAttachementModal,
                      setMediaType,
                    );
                    setSelectMediaType('image');
                    setTimeout(() => {
                      setShowImageModal(true);
                    }, 2000);
                  }}
                  loader={loading}
                  replyId={replyId}
                  // showVoice={false}
                  replyMessageType={replyMessageType}
                  replyUserId={replyUserId}
                  replyText={replyText}
                  data={data}
                  closeReply={() => _closeReply()}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    );
  }
};

export default Chat;

const styles = StyleSheet.create({
  attachmentModal: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  attModalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  // new
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  chatContainer: {
    padding: 20,
  },
  message: {
    flexDirection: 'column',
    marginBottom: 10,
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
    maxWidth: '70%',
  },
  messageText: {
    fontSize: 15,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Fonts.monaSans_Medium,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Mona-Sans-SemiBold',
    alignSelf: 'center',
    color: colors.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    // borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    // backgroundColor: 'green',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalcontent: {
    width: width,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'flex-end',
  },
  iconView: {
    height: 35,
    width: 35,
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: 10,
    borderRadius: 18,
  },
  modalInnerView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectedImages: {
    height: 200,
    width: '100%',
    borderRadius: 5,
    marginBottom: 20,
  },
  selectedDoc: {
    height: 100,
    width: '100%',
    borderRadius: 5,
    marginBottom: 20,
  },
  micView: {
    alignSelf: 'center',
  },
  micImage: {
    height: 200,
    width: 200,
    alignSelf: 'center',
  },
  pauseIcon: {
    height: 50,
    width: '50%',
    borderRadius: 25,
    backgroundColor: colors.caret,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '10%',
    bottom: 15,
  },
  sendMessage: {
    fontSize: 16,
    color: colors.white,
    fontFamily: Fonts.monaSans_semiBold,
  },
  iconImage: {
    height: 45,
    width: 45,
    tintColor: colors.white,
  },
  iconStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkBlue,
  },
  documentLogoView: {
    justifyContent: 'center',
  },
  documentLogo: {
    height: 150,
    width: 150,
  },
});
// "react-native-sound-recorder": "^1.5.0",
