import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Fonts from '../config/Fonts';
import colors from '../config/colors';
import {useNavigation} from '@react-navigation/native';
import screenNames from '../config/ScreenNames';
import language from '../languages/index';
import FastImage from 'react-native-fast-image';
import firestore, {arrayUnion} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebaseKeys from '../config/firebaseKeys';
const AddFriendCard = ({item, onStatusPress}) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const followUsers = async userID => {
    try {
      setLoading(true);
      const uid = await auth().currentUser.uid;
      const followRequestRef = firestore().collection(firebaseKeys.request);

      const id = await firestore().collection(firebaseKeys.request).doc().id;
      const existingDoc = await followRequestRef
        .where('follower_id', '==', uid)
        .where('followee_id', '==', userID)
        .get();
      if (existingDoc.empty) {
        await followRequestRef.doc(id).set({
          follower_id: uid,
          followee_id: userID,
          id: id,
          status: 'pending',
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
          chatID: '',
          extraText: '',
          from_num_message: '',
          isRead: false,
          mediaFile: '',
          message: '',
          receiverId: '',
          replyId: '',
          senderId: '',
          time: firestore.FieldValue.serverTimestamp(),
          type: 'txt',
        });
        if (onStatusPress !== undefined) {
          onStatusPress(userID);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('=====ERROR IN FOLLOWING THE OTHER USER====', error);
    }
  };

  const followBackUser = async userID => {
    try {
      setLoading(true);

      const followRequestRef = firestore().collection(firebaseKeys.request);

      const followBackRequestSnapshot = await followRequestRef
        .where('follower_id', '==', userID)
        .where('followee_id', '==', auth().currentUser.uid)
        .get();

      if (!followBackRequestSnapshot.empty) {
        const docId = followBackRequestSnapshot.docs[0].id;
        const currentStatus = followBackRequestSnapshot.docs[0].data().status;

        if (currentStatus === 'pending') {
          await followRequestRef.doc(docId).update({
            status: 'mutual',
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
          await firestore()
            .collection(firebaseKeys.user)
            .doc(auth().currentUser.uid)
            .update({
              friends: firestore.FieldValue.arrayUnion(userID),
            });
          await firestore()
            .collection(firebaseKeys.user)
            .doc(userID)
            .update({
              friends: firestore.FieldValue.arrayUnion(auth().currentUser.uid),
            });
          console.log('Follow request updated to mutual');
        } else if (currentStatus === 'mutual') {
          await followRequestRef.doc(docId).update({
            status: 'pending',
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
          await firestore()
            .collection(firebaseKeys.user)
            .doc(auth().currentUser.uid)
            .update({
              friends: firestore.FieldValue.arrayRemove(userID),
            });
          await firestore()
            .collection(firebaseKeys.user)
            .doc(userID)
            .update({
              friends: firestore.FieldValue.arrayRemove(auth().currentUser.uid),
            });
          console.log('Follow request deleted (toggled off)');
        }
      } else {
        const currentUserPendingRequestSnapshot = await followRequestRef
          .where('follower_id', '==', auth().currentUser.uid)
          .where('followee_id', '==', userID)
          .where('status', '==', 'pending')
          .get();

        if (!currentUserPendingRequestSnapshot.empty) {
          const docId = currentUserPendingRequestSnapshot.docs[0].id;
          await followRequestRef.doc(docId).delete();
          console.log('Pending follow request from current user deleted');
        } else {
          await followRequestRef.add({
            follower_id: auth().currentUser.uid,
            followee_id: userID,
            status: 'pending',
            created_at: firestore.FieldValue.serverTimestamp(),
          });
          console.log('New follow request created with pending status');
        }
      }

      if (onStatusPress !== undefined) {
        onStatusPress(userID);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('=====ERROR IN FOLLOWING BACK=====', error);
    }
  };
  const [imgloading, setImgLoading] = useState(true);

  return (
    <View style={styles.mainView}>
      <View style={styles.imageTextView}>
        {imgloading && (
          <ActivityIndicator
            size="small"
            color={colors.primaryColor}
            style={styles.loader}
          />
        )}
        {item.userImg !== '' ? (
          <FastImage
            style={styles.img}
            onLoadStart={() => setImgLoading(true)}
            onLoad={() => setImgLoading(false)}
            onError={() => setImgLoading(false)}
            source={{uri: item.userImg}}
          />
        ) : (
          <Image
            style={styles.img}
            source={require('../assets/defaultImg.jpg')}
          />
        )}

        <View style={styles.textView}>
          <Text style={styles.heading}>{item.name}</Text>
          <Text style={styles.desc}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity
        disabled={loading ? true : false}
        onPress={() => {
          if (item.followStatus === language.t('follow')) {
            followUsers(item.userId);
          } else {
            followBackUser(item.userId);
          }
        }}
        style={[styles.timeView, {}]}>
        {!loading ? (
          <Text style={styles.btnText}>{item.followStatus}</Text>
        ) : (
          <ActivityIndicator size={'small'} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AddFriendCard;

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
    height: '100%',
    width: '100%',
  },
  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    // marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingVertical: 20,
    borderBottomColor: colors.somkyWhite,
  },
  img: {height: 60, width: 60, borderRadius: 30},
  imageTextView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textView: {
    marginLeft: 10,
  },
  timeView: {
    alignItems: 'center',
    backgroundColor: colors.caret,
    height: 35,
    paddingStart: 8,
    paddingEnd: 8,
    justifyContent: 'center',
    borderRadius: 5,
  },
  heading: {
    fontSize: 18,
    fontFamily: Fonts.regular24,
    color: colors.black,
  },
  desc: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.boderColor,
    marginTop: 2,
  },
  btnText: {
    fontSize: 13,
    fontFamily: Fonts.regular24,
    color: colors.white,
    marginTop: 2,
  },
  remainMsgs: {
    fontSize: 12,
    fontFamily: Fonts.regular24,
    color: colors.white,
  },
  msg: {
    backgroundColor: colors.caret,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 5,
  },
});
