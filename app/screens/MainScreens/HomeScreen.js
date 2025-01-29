import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
} from "react-native";
import colors from "../../config/colors";
import language from "../../languages/index";
import TopComponent from "../../components/TopComponent";
import CommonStyle from "../../config/CommonStyle";
import { userProfiles } from "../../utils/dummyData";
import InstaStory from "react-native-insta-story";
import MsgCard from "../../components/MsgCard";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import firebaseKeys from "../../config/firebaseKeys";
import { launchImageLibrary } from "react-native-image-picker";
import uploadImage from "../../utils/UploadImage";
import FastImage from "react-native-fast-image";
import FriendCard from "../../components/FriendCard";
import { useIsFocused } from "@react-navigation/native";
import ButtonComponent from "../../components/ButtonComponent";

const { height, width } = Dimensions.get("screen");

const HomeScreen = () => {
  const commonSty = CommonStyle();
  const [allUsers, setAllUsers] = useState([]);
  const isFocused = useIsFocused();
  const [recomendedUsers, setRecomendedUsers] = useState([]);
  const [searchRecomendedUsers, setSearchRecomendedUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storyImage, setStoryImage] = useState("");
  const [imageType, setImageType] = useState("");
  const [friendStories, setFriendStories] = useState([]);
  const [currUserData, setCurrUserData] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchCurrUserData = async () => {
    try {
      const res = await firestore()
        .collection(firebaseKeys.user)
        .doc(auth().currentUser.uid)
        .get();
      if (res.exists) {
        setCurrUserData(res.data());
      }
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };

  const handleImagePicker = async () => {
    const options = {
      title: "Select Photo",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };

    const response = await launchImageLibrary(options);
    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.error) {
      console.error("ImagePicker Error:", response.error);
    } else if (response.assets[0].uri) {
      setStoryImage(response.assets[0].uri);
      setImageType(response.assets[0].type);
      setShowModal(true);
    }
  };

  const getChatsData = async () => {
    const currentUserId = auth().currentUser?.uid;

    const unsubscribe = firestore()
      .collection("chat")
      .orderBy("time", "desc")
      .onSnapshot(async (chatSnapshot) => {
        try {
          const chatData = chatSnapshot.docs
            .filter((doc) => doc.id.includes(currentUserId))
            .map((doc) => ({ chatID: doc.id, ...doc.data() }));

          const chatsWithUser = await Promise.all(
            chatData.map(async (chat) => {
              const [id1, id2] = chat.chatID.split("&");
              const receiverId = id1 !== currentUserId ? id1 : id2;

              try {
                const userSnapshot = await firestore()
                  .collection("users")
                  .doc(receiverId)
                  .get();
                const userData = userSnapshot.data();
                return {
                  ...chat,
                  userData,
                };
              } catch (userError) {
                console.error("Error fetching user data:", userError);
                return {
                  ...chat,
                  userData: null,
                };
              }
            })
          );
          setAllUsers(chatsWithUser);
          setSearchUsers(chatsWithUser);
          fetchAllChatUsers(chatsWithUser);
        } catch (error) {
          console.error("Error fetching chat data in real-time:", error);
        }
      });

    return unsubscribe;
  };

  const fetchAllChatUsers = async (chatsWithUser) => {
    try {
      setLoading(true);

      const chatsWithUserIds = chatsWithUser.map(
        (chat) => chat.userData.userId
      );

      const currentUserRef = firestore()
        .collection(firebaseKeys.user)
        .doc(auth().currentUser.uid);

      const unsubscribeCurrentUser = currentUserRef.onSnapshot(
        async (currentUserDoc) => {
          if (!currentUserDoc.exists) {
            setAllUsers([]);
            setLoading(false);
            return;
          }

          const currentUserData = currentUserDoc.data();
          const friendsArray = currentUserData.friends || [];

          if (friendsArray.length === 0) {
            setAllUsers([]);
            setLoading(false);
            return;
          }

          const unsubscribeFriends = firestore()
            .collection(firebaseKeys.user)
            .where(firestore.FieldPath.documentId(), "in", friendsArray)
            .onSnapshot(async (snapshot) => {
              const usersWithStatus = await Promise.all(
                snapshot.docs.map(async (doc) => {
                  const friendData = doc.data();
                  return {
                    ...friendData,
                  };
                })
              );

              const validUsersWithStatus = usersWithStatus.filter(
                (user) =>
                  user !== null && !chatsWithUserIds.includes(user.userId)
              );

              const sortedUsers = validUsersWithStatus.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                return nameA.localeCompare(nameB);
              });

              setSearchRecomendedUsers(sortedUsers);
              setRecomendedUsers(sortedUsers);
              setLoading(false);
            });

          return () => unsubscribeFriends();
        }
      );

      return () => unsubscribeCurrentUser();
    } catch (error) {
      setLoading(false);
      console.error("Error fetching all users with follow status:", error);
    }
  };

  useEffect(() => {
    getChatsData();
  }, [isFocused]);

  const uploadStoryImage = async (storyImg, imageTyp) => {
    try {
      setLoading(true);
      const currUser = await firestore()
        .collection(firebaseKeys.stories)
        .doc(auth().currentUser.uid)
        .get();

      const imageRes = await uploadImage("users", storyImg, imageTyp);
      const date = new Date();
      let newStory = {
        story_id: 0,
        story_image: imageRes,
        timeStamp: date,
        swipeText: "Custom swipe text for this story",
      };
      if (currUser.exists) {
        const existingStories = currUser.data().stories || [];

        newStory.story_id = existingStories.length;

        await firestore()
          .collection(firebaseKeys.stories)
          .doc(auth().currentUser.uid)
          .update({
            stories: firebase.firestore.FieldValue.arrayUnion(newStory),
          });
      } else {
        const uid = await auth().currentUser.uid;
        const storyData = {
          user_id: uid,
          user_image: currUserData.userImg || "",
          user_name: currUserData.name || "Anonymous",
          stories: [newStory],
        };
        await firestore()
          .collection(firebaseKeys.stories)
          .doc(auth().currentUser.uid)
          .set(storyData);
      }
      setLoading(false);
      setShowModal(false);
      console.log("Story uploaded successfully!");
    } catch (error) {
      setLoading(false);
      setShowModal(false);
      console.error("Error uploading story images:", error);
    }
  };

  const fetchCurrUserDataAndFriendsStories = async () => {
    await removeExpiredStories();
    const currentUserUID = auth().currentUser.uid;

    const unsubscribe = firestore()
      .collection(firebaseKeys.user)
      .doc(currentUserUID)
      .onSnapshot(async (res) => {
        if (res.exists) {
          const _data = res.data();
          setCurrUserData(_data);

          const friends = _data.friends || [];
          const allUids = [currentUserUID, ...friends];

          const unsubscribeStories = firestore()
            .collection(firebaseKeys.stories)
            .where("user_id", "in", allUids)
            .onSnapshot((snapshot) => {
              const allStories = snapshot.docs
                .map((doc) => {
                  const userData = doc.data();

                  const now = new Date().getTime();
                  const validStories = (userData.stories || []).filter(
                    (story) => {
                      const storyTime = story.timeStamp.toDate().getTime();
                      return now - storyTime < 24 * 60 * 60 * 1000;
                    }
                  );

                  if (validStories.length !== userData.stories?.length) {
                    firestore()
                      .collection(firebaseKeys.stories)
                      .doc(doc.id)
                      .update({ stories: validStories });
                  }

                  if (validStories.length > 0) {
                    return {
                      user_id: doc.id,
                      user_name: userData.user_name || "Anonymous",
                      user_image: userData.user_image || "",
                      stories: validStories,
                    };
                  }

                  return null;
                })
                .filter((user) => user !== null);

              const sortedStories = allStories.sort((a, b) => {
                if (a.user_id === currentUserUID) return -1;
                if (b.user_id === currentUserUID) return 1;
                return 0;
              });

              setFriendStories(sortedStories);
            });
        }
      });

    return () => unsubscribe();
  };

  const removeExpiredStories = async () => {
    try {
      const currUserStoriesDoc = await firestore()
        .collection(firebaseKeys.stories)
        .doc(auth().currentUser.uid)
        .get();

      if (currUserStoriesDoc.exists) {
        const userStoriesData = currUserStoriesDoc.data();
        const stories = userStoriesData.stories || [];

        const now = new Date().getTime();

        const validStories = stories.filter((story) => {
          const storyTime = story.timeStamp.toDate().getTime();
          return now - storyTime < 24 * 60 * 60 * 1000;
        });

        await firestore()
          .collection(firebaseKeys.stories)
          .doc(auth().currentUser.uid)
          .update({
            stories: validStories,
          });

        console.log("Expired stories removed successfully!");
      } else {
        console.log("No stories found for the current user.");
      }
    } catch (error) {
      console.error("Error removing expired stories:", error);
    }
  };

  useEffect(() => {
    fetchCurrUserDataAndFriendsStories();
  }, []);

  const searchRequests = async (text) => {
    let newData = [];
    if (text) {
      const textData = text.toUpperCase();
      newData = searchUsers.filter((item) => {
        const name =
          typeof item.userData.name === "string"
            ? item.userData.name.toUpperCase()
            : "";
        const email =
          typeof item.userData.email === "string"
            ? item.userData.email.toUpperCase()
            : "";

        return name.indexOf(textData) !== -1 || email.indexOf(textData) !== -1;
      });

      setSearchText(text);
      setAllUsers(newData);
    } else {
      setSearchText("");
      setAllUsers(searchUsers);
    }
  };

  const searchRecomended = async (text) => {
    let newData = [];
    if (text) {
      const textData = text.toUpperCase();
      newData = searchRecomendedUsers.filter((item) => {
        const name =
          typeof item.name === "string" ? item.name.toUpperCase() : "";
        const email =
          typeof item.email === "string" ? item.email.toUpperCase() : "";

        return name.indexOf(textData) !== -1 || email.indexOf(textData) !== -1;
      });

      setSearchText(text);
      setRecomendedUsers(newData);
    } else {
      setSearchText("");
      setRecomendedUsers(searchRecomendedUsers);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.caret }}>
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            color: colors.white,
            fontWeight: "700",
          }}
        >
          Mail Packet
        </Text>
      </View>
      <View
        style={{
          marginHorizontal: 20,
          width: "auto",
          height: 40,
          backgroundColor: "#D3D3D3",
          marginTop: 10,
          borderRadius: 20,
          alignItems: "center",
          paddingHorizontal: 15,
          flexDirection: "row",
        }}
      >
        <View style={{ width: 25, height: 25 }}>
          <Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
            }}
            source={require("../../assets/search.png")}
          />
        </View>
        <TextInput placeholder="Search" />
      </View>
      {/* <TopComponent
        rightIcon={true}
        titleSty={{ left: 10 }}
        searchIcon={true}
        setValue={setSearchText}
        searchFunction2={searchRecomended}
        value={searchText}
        handleClosePress={() => {
          setAllUsers(searchUsers);
          setRecomendedUsers(searchRecomendedUsers);
        }}
        searchFunction={searchRequests}
        title={language.t("home")}
        rightIconImage={require("../../assets/userImage.jpg")}
      /> */}
      <View style={{ marginTop: 20 }}>
        <ScrollView
          horizontal
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            marginLeft: 20,
          }}
        >
          <View style={styles.storyView}>
            <TouchableOpacity
              onPress={handleImagePicker}
              activeOpacity={0.5}
              style={styles.storyHeader}
            >
              <FastImage
                style={styles.img}
                source={{ uri: currUserData.userImg }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImagePicker}
              activeOpacity={0.5}
              style={styles.plusIconView}
            >
              <Image
                style={styles.plusIcon}
                source={require("../../assets/plus.png")}
              />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.storyText}>
              {currUserData.name}
            </Text>
          </View>

          <ScrollView scrollEnabled={false}>
            {friendStories.length !== 0 ? (
              <>
                <InstaStory
                  key={friendStories
                    .map((friend) =>
                      friend.stories.map((story) => story.story_id).join(",")
                    )
                    .join(",")}
                  style={{}}
                  data={friendStories}
                  duration={5}
                  renderSwipeUpComponent={(item) => {
                    <Text>item.user_name</Text>;
                  }}
                  renderTextComponent={({ item, profileName }) => <View></View>}
                />
              </>
            ) : (
              <View style={styles.storyHeader} />
            )}
          </ScrollView>
        </ScrollView>
      </View>
      <View style={commonSty.mainView}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <ScrollView
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{ flex: 1 }}
          >
            {allUsers.length !== 0 && (
              <FlatList
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                data={allUsers}
                renderItem={({ item }) => {
                  return <MsgCard item={item} />;
                }}
              />
            )}
          </ScrollView>
          <ScrollView
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{ flex: 1 }}
          >
            {recomendedUsers.length !== 0 && (
              <FlatList
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                data={recomendedUsers}
                renderItem={({ item }) => {
                  return <FriendCard item={item} />;
                }}
              />
            )}
          </ScrollView>
        </ScrollView>
      </View>
      {modal()}
    </View>
  );

  function modal() {
    return (
      <Modal visible={showModal} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "space-around",
            backgroundColor: colors.white,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{
              backgroundColor: colors.primaryColor,
              height: 40,
              width: 40,
              borderRadius: 30,
              alignSelf: "flex-end",
              marginRight: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ height: 30, width: 30, tintColor: colors.white }}
              source={require("../../assets/close.png")}
            />
          </TouchableOpacity>
          <Image
            style={{
              width: "100%",
              height: height * 0.7,
              resizeMode: "contain",
            }}
            source={{ uri: storyImage }}
          />
          <ButtonComponent
            onPress={() => {
              uploadStoryImage(storyImage, imageType);
            }}
            loader={loading}
            style={{ width: "90%" }}
            title={language.t("submit")}
          />
        </View>
      </Modal>
    );
  }
};

export default HomeScreen;

const styles = StyleSheet.create({
  storyView: {
    // marginLeft: 20,
    width: 75,
  },
  storyHeader: {
    height: 65,
    width: 65,
    borderRadius: 50,
  },
  img: {
    height: "100%",
    width: "100%",
    borderRadius: 80,
  },
  plusIcon: {
    height: 12,
    width: 12,
  },
  plusIconView: {
    height: 18,
    width: 18,
    borderRadius: 10,
    position: "absolute",
    bottom: 15,
    backgroundColor: colors.white,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    right: 15,
  },
  storyText: {
    fontSize: 12,
    color: colors.black,
    marginTop: 5,
  },
});
