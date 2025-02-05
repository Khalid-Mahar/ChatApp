import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";

const REPLY_ICONS = {
  image: {
    source: require("../../../assets/ic_image.png"),
    label: "Image",
  },
  video: {
    source: require("../../../assets/videoIcon.png"),
    label: "Video",
  },
  doc: {
    source: require("../../../assets/ic_document.png"),
    label: "Document",
  },
  audio: {
    source: require("../../../assets/ic_sound.png"),
    label: "Voice",
  },
};

const ReplyIcon = ({ messageType, icon, label }) => (
  <View style={styles.messageReplyView}>
    <Image
      style={[styles.iconImage, messageType === "audio" && { width: 40 }]}
      source={icon}
    />
    <Text style={styles.replyText}>{label}</Text>
  </View>
);

const ChatInput = ({
  value,
  setValue,
  attachmentPress,
  _sendMessage,
  onMicPress,
  onPastePress,
  replyMessageType = "txt",
  replyUserId = "",
  replyText = "",
  closeReply,
  data,
  containerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const currentUser = auth().currentUser;

  const renderReplyContent = () => {
    if (replyMessageType === "txt") {
      return (
        <View style={styles.messageReplyView}>
          <Text style={[styles.replyText, { marginLeft: 3 }]}>{replyText}</Text>
        </View>
      );
    }

    const replyInfo = REPLY_ICONS[replyMessageType];
    return (
      replyInfo && (
        <ReplyIcon
          messageType={replyMessageType}
          icon={replyInfo.source}
          label={replyInfo.label}
        />
      )
    );
  };

  return (
    <View style={containerStyle}>
      {replyText !== "" && (
        <View style={styles.replyParentView}>
          <View style={styles.replyNameView}>
            <Text style={styles.ReplyName}>
              {replyUserId === currentUser?.uid ? "You" : data.name}
            </Text>
            {renderReplyContent()}
          </View>
          <TouchableOpacity onPress={closeReply} style={styles.closeIconView}>
            <Image
              style={styles.closeIcon}
              source={require("../../../assets/close.png")}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mainView}>
        <TouchableOpacity style={styles.iconButton} onPress={attachmentPress}>
          <Image
            style={styles.iconStyle}
            source={require("../../../assets/attachment.png")}
          />
        </TouchableOpacity>
        <View style={styles.inputTextView}>
          <TextInput
            value={value}
            placeholder="Write a message..."
            placeholderTextColor="#999"
            onChangeText={setValue}
            style={styles.inputView}
          />
          {/* <TouchableOpacity style={styles.iconButton} onPress={onPastePress}>
            <Image
              style={styles.iconStyle}
              source={require("../../../assets/paste.png")}
            />
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={onMicPress}>
          <Image
            style={styles.iconStyle}
            source={require("../../../assets/microphone.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={_sendMessage}>
          <Image
            style={[styles.iconStyle, { tintColor: "#007AFF" }]}
            source={require("../../../assets/send.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 80, // Reduced from 80
    backgroundColor: "#FFFFFF",
    shadowColor: "#999",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 5,
    elevation: 5,
    paddingHorizontal: 8, // Added padding
  },
  iconButton: {
    padding: 8, // Added padding for larger touch target
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: {
    height: 22, // Slightly reduced from 25
    width: 22, // Slightly reduced from 25
    resizeMode: "contain",
  },
  inputTextView: {
    backgroundColor: "#F3F6F6",
    width: "60%", // Reduced from 70%
    height: 50, // Reduced from 50
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 5,
    marginHorizontal: 8, // Added margin
  },
  inputView: {
    width: "100%", // Reduced from 90%
    height: "100%",
    fontSize: 12,
    color: "#000",
    paddingHorizontal: 8, // Added padding
  },
  replyParentView: {
    height: 60, // Reduced from 60
    backgroundColor: "#F3F6F6",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginBottom: 4, // Added margin
  },
  replyNameView: {},
  ReplyName: {
    fontSize: 15,
    color: "#007AFF",
  },
  closeIconView: {
    height: 26, // Reduced from 30
    width: 26, // Reduced from 30
    backgroundColor: "#007AFF",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    height: 26,
    width: 26,
    tintColor: "#FFFFFF",
  },
  messageReplyView: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyText: {
    fontSize: 13,
    marginLeft: 7,
    marginTop: 7,
    color: "#333",
  },
  iconImage: {
    height: 20,
    width: 20,
    marginLeft: 3,
    marginTop: 7,
    tintColor: "#333",
  },
});

export default ChatInput;
