import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import language from '../../languages/index';
import TopComponent from '../../components/TopComponent';
import CommonStyle from '../../config/CommonStyle';
import firebaseKeys from '../../config/firebaseKeys';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CallCard from '../../components/CallCard';
import MyIndicator from '../../components/MyIndicator';
import FriendCard from '../../components/FriendCard';
const Call = () => {
  const commonSty = CommonStyle();
  const [allUsers, setAllUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setloading] = useState(false);
  const [recomendedUsers, setRecomendedUsers] = useState([]);
  const [searchRecomendedUsers, setSearchRecomendedUsers] = useState([]);
  const getChatsData = () => {
    setloading(true);
    const currentUserId = auth().currentUser?.uid;

    const unsubscribe = firestore()
      .collection('chat')
      .orderBy('time', 'desc')
      .onSnapshot(async chatSnapshot => {
        try {
          const chatData = chatSnapshot.docs
            .filter(doc => doc.id.includes(currentUserId))
            .map(doc => ({chatID: doc.id, ...doc.data()}));
          const _callData = chatData.filter(e => {
            return 'call' === e.type || 'videoCall' === e.type;
          });
          const chatsWithUser = await Promise.all(
            _callData.map(async chat => {
              const [id1, id2] = chat.chatID.split('&');
              const receiverId = id1 !== currentUserId ? id1 : id2;

              try {
                const userSnapshot = await firestore()
                  .collection('users')
                  .doc(receiverId)
                  .get();
                const userData = userSnapshot.data();
                return {
                  ...chat,
                  userData,
                };
              } catch (userError) {
                console.error('Error fetching user data:', userError);
                return {
                  ...chat,
                  userData: null,
                };
              }
            }),
          );

          setAllUsers(chatsWithUser);
          setSearchUsers(chatsWithUser);
          fetchAllChatUsers(chatsWithUser);
          setloading(false);
        } catch (error) {
          setloading(false);
          console.error('Error fetching chat data in real-time:', error);
        }
      });
    return unsubscribe;
  };

  const fetchAllChatUsers = async chatsWithUser => {
    try {
      setloading(true);

      const chatsWithUserIds = chatsWithUser.map(chat => chat.userData.userId);

      const currentUserRef = firestore()
        .collection(firebaseKeys.user)
        .doc(auth().currentUser.uid);

      const unsubscribeCurrentUser = currentUserRef.onSnapshot(
        async currentUserDoc => {
          if (!currentUserDoc.exists) {
            setAllUsers([]);
            setloading(false);
            return;
          }

          const currentUserData = currentUserDoc.data();
          const friendsArray = currentUserData.friends || [];

          if (friendsArray.length === 0) {
            setAllUsers([]);
            setloading(false);
            return;
          }

          const unsubscribeFriends = firestore()
            .collection(firebaseKeys.user)
            .where(firestore.FieldPath.documentId(), 'in', friendsArray)
            .onSnapshot(async snapshot => {
              const usersWithStatus = await Promise.all(
                snapshot.docs.map(async doc => {
                  const friendData = doc.data();
                  return {
                    ...friendData,
                  };
                }),
              );

              const validUsersWithStatus = usersWithStatus.filter(
                user =>
                  user !== null && !chatsWithUserIds.includes(user.userId),
              );

              const sortedUsers = validUsersWithStatus.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                return nameA.localeCompare(nameB);
              });

              setSearchRecomendedUsers(sortedUsers);
              setRecomendedUsers(sortedUsers);
              console.log(sortedUsers);
              setloading(false);
            });

          return () => unsubscribeFriends();
        },
      );

      return () => unsubscribeCurrentUser();
    } catch (error) {
      setloading(false);
      console.error(
        '======ERROR IN FETCHING ALL USERS WITH FOLLOW STATUS=====',
        error,
      );
    }
  };
  useEffect(() => {
    getChatsData();
  }, []);

  // search request with text
  const searchRequests = async text => {
    let newData = [];
    if (text) {
      const textData = text.toUpperCase();
      newData = searchUsers.filter(item => {
        const name =
          typeof item.userData.name === 'string'
            ? item.userData.name.toUpperCase()
            : '';
        const email =
          typeof item.userData.email === 'string'
            ? item.userData.email.toUpperCase()
            : '';

        return name.indexOf(textData) !== -1 || email.indexOf(textData) !== -1;
      });

      setSearchText(text);
      setAllUsers(newData);
    } else {
      setSearchText('');
      setAllUsers(searchUsers);
    }
  };

  // search request with text
  const searchRecomended = async text => {
    let newData = [];
    if (text) {
      const textData = text.toUpperCase();
      newData = searchRecomendedUsers.filter(item => {
        const name =
          typeof item.name === 'string' ? item.name.toUpperCase() : '';
        const email =
          typeof item.email === 'string' ? item.email.toUpperCase() : '';

        return name.indexOf(textData) !== -1 || email.indexOf(textData) !== -1;
      });

      setSearchText(text);
      setRecomendedUsers(newData);
    } else {
      setSearchText('');
      setRecomendedUsers(searchRecomendedUsers);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent
        rightIcon={true}
        titleSty={{left: 0}}
        setValue={setSearchText}
        value={searchText}
        searchFunction2={searchRecomended}
        handleClosePress={() => {
          setAllUsers(searchUsers);
          setRecomendedUsers(searchRecomendedUsers);
        }}
        searchFunction={searchRequests}
        searchIcon={true}
        title={language.t('call')}
        rightIconImage={require('../../assets/userImage.jpg')}
      />
      <View style={commonSty.mainView}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
          <ScrollView
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{flex: 1}}>
            <FlatList
              data={allUsers}
              renderItem={({item}) => {
                return <CallCard item={item} />;
              }}
            />
          </ScrollView>
          <ScrollView
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{flex: 1}}>
            {recomendedUsers.length !== 0 && (
              <FlatList
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                data={recomendedUsers}
                renderItem={({item}) => {
                  return <FriendCard item={item} />;
                }}
              />
            )}
          </ScrollView>
        </ScrollView>
      </View>
      <MyIndicator visible={loading} />
    </View>
  );
};

export default Call;

const styles = StyleSheet.create({});
