import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebaseKeys from '../config/firebaseKeys';
import CommonStyle from '../config/CommonStyle';
import MsgCard from '../components/MsgCard';
import colors from '../config/colors';
import TopComponent from '../components/TopComponent';
import language from '../languages/index';

const ChatDetails = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const commonSty = CommonStyle();
  const getChatsData = () => {
    const currentUserId = auth().currentUser?.uid;

    const unsubscribe = firestore()
      .collection('chat')
      .orderBy('time', 'desc')
      .onSnapshot(async chatSnapshot => {
        try {
          const chatData = chatSnapshot.docs
            .filter(doc => doc.id.includes(currentUserId))
            .map(doc => ({chatID: doc.id, ...doc.data()}));

          const chatsWithUser = await Promise.all(
            chatData.map(async chat => {
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
        } catch (error) {
          console.error('Error fetching chat data in real-time:', error);
        }
      });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = getChatsData();
    return () => unsubscribe();
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
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent
        rightIcon={true}
        titleSty={{left: 10}}
        searchIcon={true}
        setValue={setSearchText}
        value={searchText}
        searchFunction={searchRequests}
        title={language.t('chatDetails')}
        rightIconImage={require('../assets/userImage.jpg')}
      />
      <View style={commonSty.mainView}>
        {allUsers && (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={allUsers}
            renderItem={({item}) => {
              return <MsgCard item={item} />;
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ChatDetails;

const styles = StyleSheet.create({});
