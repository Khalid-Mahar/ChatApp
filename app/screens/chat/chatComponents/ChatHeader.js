import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import moment from "moment";

const ChatHeader = ({ userInfo, onVideoCallPress, onCallPress }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const getStatusColor = (status) => {
    return status === "online" ? "#4CAF50" : "#9E9E9E";
  };

  const handleLastSeen = () => {
    if (!userInfo) return null;

    if (userInfo.activeStatus === "online") {
      return (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor("online") },
            ]}
          />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      );
    }

    const now = new Date();
    const statusDate = userInfo.activeStatus?.toDate
      ? userInfo.activeStatus.toDate()
      : now;
    const currentDate = statusDate;

    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    let lastSeen = "";
    if (todayDate.toDateString() === currentDate.toDateString()) {
      lastSeen = `Today at ${moment(currentDate).format("LT")}`;
    } else if (yesterdayDate.toDateString() === currentDate.toDateString()) {
      lastSeen = `Yesterday at ${moment(currentDate).format("LT")}`;
    } else {
      lastSeen = moment(currentDate).format("lll");
    }

    return (
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor("offline") },
          ]}
        />
        <Text style={styles.lastSeenText}>Last seen {lastSeen}</Text>
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "ios" ? insets.top : 15 },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image
                style={styles.backIcon}
                source={require("../../../assets/ic_goBack.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarContainer}>
              <FastImage
                style={styles.avatar}
                source={{ uri: userInfo.userImg }}
                // defaultSource={require("../../../assets/default_avatar.png")}
              />
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              {handleLastSeen()}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={onCallPress}>
              <Image
                style={styles.actionIcon}
                source={require("../../../assets/call.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onVideoCallPress}
            >
              <Image
                style={styles.actionIcon}
                source={require("../../../assets/video.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.separator} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    height: 20,
    width: 20,
    tintColor: "#1A1A1A",
    resizeMode: "contain",
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
    marginRight: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  lastSeenText: {
    fontSize: 12,
    color: "#757575",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    height: 20,
    width: 20,
    tintColor: "#1A1A1A",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});

export default ChatHeader;
