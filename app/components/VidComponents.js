import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import FastImage from 'react-native-fast-image';
import {createThumbnail} from 'react-native-create-thumbnail';
import auth from '@react-native-firebase/auth';
const VidComponents = ({item, index, data}) => {
  const [mediaBanner, setMediaBanner] = useState('');
  const currentUser = auth().currentUser.uid;
  useEffect(() => {
    createThumbnail({
      url: item.mediaFile,
      timeStamp: 10000,
    })
      .then(response => {
        setMediaBanner(response.path);
      })
      .catch(err => {
        console.log({err});
      });
  }, []);

  return (
    <View
      style={[
        styles.imageMainView,
        {
          marginLeft: index == 0 ? 20 : 10,
          marginRight: index == data.length - 1 ? 10 : 0,
          borderColor:
            item.senderId === currentUser
              ? colors.primaryColor
              : // : '#f0f0f0',
                colors.lightGray,
        },
      ]}>
      <FastImage style={styles.imageView} source={{uri: mediaBanner}} />
    </View>
  );
};

export default VidComponents;

const styles = StyleSheet.create({
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden',
    bottom: 20,
    alignSelf: 'center',
  },
  avatarImge: {
    height: '100%',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.medium24,
    color: colors.white,
    alignSelf: 'center',
  },
  IconBtn: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
  },
  iconStyles: {height: 25, width: 25},
  iconMainView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 80,
    marginTop: 20,
  },
  border: {
    height: 5,
    width: 50,
    borderRadius: 5,
    alignSelf: 'center',
    backgroundColor: colors.somkyWhite,
    marginTop: 10,
  },
  normalText: {
    fontSize: 18,
    fontFamily: Fonts.medium24,
    color: colors.black,
    marginTop: 5,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.medium24,
    color: colors.boderColor,
  },
  textView: {marginHorizontal: 20},
  imageView: {height: '100%', width: '100%'},
  imageMainView: {
    height: 80,
    width: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.somkyWhite,
    marginTop: 5,
  },
  soundImage: {
    height: 20,
    width: 50,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
  },
});
