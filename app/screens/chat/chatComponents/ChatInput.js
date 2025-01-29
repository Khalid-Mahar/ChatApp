import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import InputText from '../../../components/InputText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import colors from '../../../config/colors';
import language from '../../../languages/index';
import auth from '@react-native-firebase/auth';
const ChatInput = ({
  value,
  setValue,
  attachmentPress,
  loader,
  _sendMessage,
  onCameraPress,
  onMicPress,
  onPastePress,
  replyId,
  replyMessageType,
  replyUserId,
  replyText,
  closeReply,
  data,
}) => {
  const insect = useSafeAreaInsets();
  return (
    <View>
      {replyText !== '' ? (
        <View style={styles.replyParentView}>
          <View style={styles.replyNameView}>
            {replyUserId == auth().currentUser.uid ? (
              <Text style={styles.ReplyName}>{'You'}</Text>
            ) : (
              <Text style={styles.ReplyName}>{data.name}</Text>
            )}
            {replyMessageType == 'txt' && (
              <View style={styles.messageReplyView}>
                <Text style={[styles.replyText, {marginLeft: 3}]}>
                  {replyText}
                </Text>
              </View>
            )}
            {replyMessageType == 'image' && (
              <View style={styles.messageReplyView}>
                <Image
                  style={styles.iconImage}
                  source={require('../../../assets/ic_image.png')}
                />
                <Text style={styles.replyText}>{language.t('image')}</Text>
              </View>
            )}
            {replyMessageType == 'video' && (
              <View style={styles.messageReplyView}>
                <Image
                  style={styles.iconImage}
                  source={require('../../../assets/videoIcon.png')}
                />
                <Text style={styles.replyText}>{language.t('video')}</Text>
              </View>
            )}
            {replyMessageType == 'doc' && (
              <View style={styles.messageReplyView}>
                <Image
                  style={styles.iconImage}
                  source={require('../../../assets/ic_document.png')}
                />
                <Text style={styles.replyText}>{language.t('document')}</Text>
              </View>
            )}
            {replyMessageType == 'audio' && (
              <View style={styles.messageReplyView}>
                <Image
                  style={[styles.iconImage, {width: 40}]}
                  source={require('../../../assets/ic_sound.png')}
                />
                <Text style={styles.replyText}>{language.t('voice')}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={closeReply} style={styles.closeIconView}>
            <Image
              style={styles.closeIcon}
              source={require('../../../assets/close.png')}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.mainView]}>
        <TouchableOpacity onPress={attachmentPress}>
          <Image
            style={styles.iconStyle}
            source={require('../../../assets/attachment.png')}
          />
        </TouchableOpacity>
        <View style={styles.inputTextView}>
          <TextInput
            value={value}
            setValue={setValue}
            placeholderTextColor={colors.boderColor}
            placeholder={language.t('writeMsg')}
            onChangeText={text => setValue(text)}
            style={styles.inputView}
          />
          <TouchableOpacity onPress={onPastePress}>
            <Image
              style={styles.iconStyle}
              source={require('../../../assets/paste.png')}
            />
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity onPress={onCameraPress}>
          <Image
            style={styles.iconStyle}
            source={require('../../../assets/camera.png')}
          />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={onMicPress}>
          <Image
            style={styles.iconStyle}
            source={require('../../../assets/microphone.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={_sendMessage}>
          <Image
            style={[styles.iconStyle, {tintColor: colors.caret}]}
            source={require('../../../assets/send.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 80,
    backgroundColor: colors.white,
    shadowColor: colors.grey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 5,
    elevation: 5,
  },
  iconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  inputTextView: {
    backgroundColor: '#F3F6F6',
    width: '70%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 5,
  },
  inputView: {
    width: '90%',
    height: '100%',
    fontSize: 12,
    color: colors.black,
  },

  //
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
    color: colors.textColor,
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
  // reply Style
  replyParentView: {
    height: 60,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  replyNameView: {},
  ReplyName: {
    fontSize: 15,
    color: colors.caret,
    fontFamily: Fonts.monaSans_semiBold,
  },
  closeIconView: {
    height: 30,
    width: 30,
    backgroundColor: colors.primaryColor,
    borderRadius: 18,
  },
  closeIcon: {
    height: 30,
    tintColor: colors.white,
    width: 30,
  },
  messageReplyView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    fontSize: 13,
    fontFamily: Fonts.monaSans_Medium,
    marginLeft: 7,
    marginTop: 7,
    color: colors.textColor,
  },
  iconImage: {
    height: 20,
    width: 20,
    marginLeft: 3,
    marginTop: 7,
    tintColor: colors.textColor,
  },
});
