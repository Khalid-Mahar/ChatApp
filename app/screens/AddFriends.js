import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CommonStyle from '../config/CommonStyle';
import colors from '../config/colors';
import language from '../languages/index';
import TopComponent from '../components/TopComponent';
import firebaseKeys from '../config/firebaseKeys';
import MyIndicator from '../components/MyIndicator';
import {useNavigation} from '@react-navigation/native';
import AddFriendCard from '../components/AddFriendCard';
const AddFriends = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [showUsers, setShowUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [laoding, setLoading] = useState(false);
  const commonSty = CommonStyle();
  const navigation = useNavigation();

  const fetchAllUsersWithFollowStatus = async () => {
    try {
      setLoading(true);
      const query = await firestore().collection(firebaseKeys.user).get();
      if (query.empty) {
        setAllUsers([]);
        return;
      }

      // Fetch all users
      const allUsers = query.docs.map(item => item.data());
      const allUserExceptCurr = allUsers.filter(
        item => item.userId !== auth().currentUser.uid,
      );
      const usersWithStatus = await Promise.all(
        allUserExceptCurr.map(async user => {
          const followStatus = await getFollowStatus(
            auth().currentUser.uid,
            user.userId,
          );
          return {...user, followStatus};
        }),
      );
      const followBackUser = usersWithStatus.filter(e => {
        return language.t('followBack') === e.followStatus;
      });
      setShowUsers(followBackUser);
      setAllUsers(followBackUser);
      setSearchUsers(usersWithStatus);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      console.log(
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
      .get();

    if (requestSnapshot.empty) {
      requestSnapshot = await followRequestRef
        .where('follower_id', '==', otherUserId)
        .where('followee_id', '==', currentUserId)
        .get();
    }

    if (requestSnapshot.empty) {
      return language.t('follow');
    }
    const status = requestSnapshot.docs[0].data().status;

    if (status === 'pending') {
      const currentUserPendingRequestSnapshot = await followRequestRef
        .where('follower_id', '==', otherUserId)
        .where('followee_id', '==', auth().currentUser.uid)
        .where('status', '==', 'pending')
        .get();
      if (!currentUserPendingRequestSnapshot.empty) {
        return language.t('followBack');
      } else {
        return language.t('following');
      }
    } else if (status === 'mutual') {
      return language.t('friend');
    }

    return language.t('follow');
  };

  const handleChangeStatus = async selectedUserId => {
    try {
      const followStatus = await getFollowStatus(
        auth().currentUser.uid,
        selectedUserId,
      );

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.userId === selectedUserId ? {...user, followStatus} : user,
        ),
      );
    } catch (error) {
      console.log('Error updating follow status:', error);
    }
  };

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
      setAllUsers(showUsers);
    }
  };

  useEffect(() => {
    fetchAllUsersWithFollowStatus();
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent
        titleSty={{left: 0}}
        rightIcon={true}
        searchIcon={true}
        value={searchText}
        setValue={setSearchText}
        handleClosePress={() => {
          setAllUsers(showUsers);
        }}
        searchFunction={searchRequests}
        title={language.t('addFriend')}
      />
      <View style={commonSty.mainView}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={allUsers}
          renderItem={({item}) => {
            return (
              <AddFriendCard
                item={item}
                onStatusPress={async selectedUserId => {
                  handleChangeStatus(selectedUserId);
                }}
              />
            );
          }}
        />
      </View>
      <MyIndicator visible={laoding} />
    </View>
  );
};

export default AddFriends;

const styles = StyleSheet.create({});
