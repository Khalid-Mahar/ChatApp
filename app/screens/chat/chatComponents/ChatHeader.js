import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import moment from "moment";
import PropTypes from "prop-types";
import Fonts from "../../../config/Fonts";
import colors from "../../../config/colors";

const ChatHeader = ({ userInfo, onVideoCallPress, onCallPress }) => {
  const insect = useSafeAreaInsets();
  const navigation = useNavigation();

  const handlelastSeenDate = () => {
    if (!userInfo) return null;

    if (userInfo.activeStatus === "online") {
      return (
        <Text style={[styles.subheader, { fontSize: 10 }]}>
          {userInfo.activeStatus}
        </Text>
      );
    }

    const statusDate = userInfo.activeStatus?.toDate
      ? userInfo.activeStatus.toDate()
      : new Date();

    const now = moment();
    const lastSeen = moment(statusDate);

    if (now.isSame(lastSeen, "day")) {
      return `Today at ${lastSeen.format("LT")}`;
    } else if (now.subtract(1, "day").isSame(lastSeen, "day")) {
      return `Yesterday at ${lastSeen.format("LT")}`;
    } else {
      return lastSeen.format("lll");
    }
  };

  const lastSeenText = React.useMemo(() => handlelastSeenDate(), [userInfo]);

  return (
    <View style={styles.mainHeader}>
      <View style={styles.imgView}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Image
            style={styles.backIcon}
            source={require("../../../assets/ic_goBack.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarView}>
          <FastImage
            style={styles.avatar}
            source={{
              uri: userInfo.userImg,
              priority: FastImage.priority.high,
            }}
          />
        </TouchableOpacity>
        <View style={styles.textView}>
          <Text style={styles.heading}>{userInfo.name}</Text>
          <Text style={styles.desc}>{lastSeenText}</Text>
        </View>
      </View>
      <View style={styles.callView}>
        <TouchableOpacity onPress={onCallPress}>
          <Image
            style={[styles.iconStyle, { marginRight: 10 }]}
            source={require("../../../assets/call.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onVideoCallPress}>
          <Image
            style={styles.iconStyle}
            source={require("../../../assets/video.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

ChatHeader.propTypes = {
  userInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userImg: PropTypes.string.isRequired,
    activeStatus: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }).isRequired,
  onVideoCallPress: PropTypes.func.isRequired,
  onCallPress: PropTypes.func.isRequired,
};

ChatHeader.defaultProps = {
  userInfo: null,
};

const styles = StyleSheet.create({
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginHorizontal: 20,
    // marginTop: Platform.OS === "ios" ? insect.top : 15,
    backgroundColor: "rgba(128, 128, 128, 0.5)", // 50% transparent gray
    padding: 10, // Optional: Add padding for better spacing
    borderBottomLeftRadius: 20, // Optional: Add border radius for rounded corners
    borderBottomRightRadius: 20, // Optional: Add border radius for rounded corners
  },
  textView: {
    marginLeft: 10,
  },
  heading: {
    fontSize: 20,
    fontFamily: Fonts.regular24,
    color: colors.white,
    fontWeight: "700",
  },
  desc: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.white,
  },
  backIcon: {
    height: 20,
    width: 25,
  },
  iconStyle: {
    height: 30,
    width: 30,
  },
  avatarView: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
  callView: { flexDirection: "row" },
  imgView: { flexDirection: "row", alignItems: "center" },
});

export default ChatHeader;
