import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  GROUP_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import screenNames from '../../config/ScreenNames';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import constansts from '../../utils/constansts';
export default function VoiceCallPage(props) {
  console.log(props);
  const currUserData = props.route.params.currentUserData;
  const chatId = props.route.params.chatID;
  const recieverData = props.route.params.userData;
  const isFromVoice = props.route.params.isFromVoice;
  const sendMessages = async type => {
    try {
      await firestore()
        .collection('chat')
        .doc(chatId)
        .update({
          status: 'decline',
          from_num_message: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.log('==============ERROR IN SEDING MESSAGE=======', error);
    }
  };
  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltCall
        appID={constansts.appId}
        appSign={constansts.appSign}
        userID={currUserData.userId}
        userName={recieverData.name}
        callID={chatId}
        config={{
          // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
          //   ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          //   ...ONE_ON_ONE_VOICE_CALL_CONFIG,
          ...(isFromVoice
            ? ONE_ON_ONE_VOICE_CALL_CONFIG
            : ONE_ON_ONE_VIDEO_CALL_CONFIG),
          //   ...GROUP_VIDEO_CALL_CONFIG,
          onCallEnd: (callID, reason, duration) => {
            props.navigation.goBack();
            sendMessages();
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});
