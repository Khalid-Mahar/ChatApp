import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import language from '../../languages/index';
import CommonStyle from '../../config/CommonStyle';
import TopComponent from '../../components/TopComponent';
import screenNames from '../../config/ScreenNames';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebaseKeys from '../../config/firebaseKeys';
import FriendCard from '../../components/FriendCard';
import MyIndicator from '../../components/MyIndicator';
const Profile = ({navigation}) => {
  const commonSty = CommonStyle();
  const [allUsers, setAllUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAllChatUsers = () => {
    try {
      setLoading(true);

      const currentUserRef = firestore()
        .collection(firebaseKeys.user)
        .doc(auth().currentUser.uid);

      const unsubscribeCurrentUser = currentUserRef.onSnapshot(
        async currentUserDoc => {
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
            .where(firestore.FieldPath.documentId(), 'in', friendsArray)
            .onSnapshot(async snapshot => {
              const usersWithStatus = await Promise.all(
                snapshot.docs.map(async doc => {
                  const friendData = doc.data();
                  const followStatusData = await getFollowStatus(
                    auth().currentUser.uid,
                    doc.id,
                  );

                  if (!followStatusData) {
                    return null;
                  }

                  return {
                    ...friendData,
                    followStatusData,
                  };
                }),
              );

              const validUsersWithStatus = usersWithStatus.filter(
                user => user !== null,
              );

              const sortedUsers = validUsersWithStatus.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                return nameA.localeCompare(nameB);
              });
              setSearchUsers(sortedUsers);
              setAllUsers(sortedUsers);
              setLoading(false);
            });

          return () => unsubscribeFriends();
        },
      );

      return () => unsubscribeCurrentUser();
    } catch (error) {
      setLoading(false);
      console.error(
        '======ERROR IN FETCHING ALL USERS WITH FOLLOW STATUS=====',
        error,
      );
    }
  };

  const getFollowStatus = async (currentUserId, otherUserId) => {
    const followRequestRef = firestore().collection(firebaseKeys.request);

    let requestSnapshot = await followRequestRef
      .where('follower_id', '==', currentUserId)
      .where('followee_id', '==', otherUserId)
      .where('status', '==', 'mutual')
      .get();

    if (requestSnapshot.empty) {
      requestSnapshot = await followRequestRef
        .where('follower_id', '==', otherUserId)
        .where('followee_id', '==', currentUserId)
        .where('status', '==', 'mutual')
        .get();
    }

    if (requestSnapshot.empty) {
      return null;
    }

    const followStatusData = requestSnapshot.docs[0].data();
    return followStatusData;
  };

  useEffect(() => {
    fetchAllChatUsers();
  }, []);
  // search request with text
  const searchRequests = async text => {
    let newData = [];
    if (text) {
      const textData = text.toUpperCase();
      newData = searchUsers.filter(item => {
        const name =
          typeof item.name === 'string' ? item.name.toUpperCase() : '';
        const email =
          typeof item.email === 'string' ? item.email.toUpperCase() : '';

        return name.indexOf(textData) !== -1 || email.indexOf(textData) !== -1;
      });

      setSearchText(text);
      setAllUsers(newData);
    } else {
      setSearchText('');
      setAllUsers(searchUsers);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent
        titleSty={{left: 0}}
        createBlacklist={true}
        searchIcon={true}
        handleClosePress={() => {
          setAllUsers(searchUsers);
        }}
        value={searchText}
        setValue={setSearchText}
        searchFunction={searchRequests}
        onCreateBlacklistPress={() =>
          navigation.navigate(screenNames.addFriends)
        }
        title={language.t('contact')}
        rightIconImage={require('../../assets/userImage.jpg')}
      />
      <View style={commonSty.mainView}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={allUsers}
          renderItem={({item}) => {
            return <FriendCard item={item} />;
          }}
        />
      </View>
      <MyIndicator visible={loading} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
