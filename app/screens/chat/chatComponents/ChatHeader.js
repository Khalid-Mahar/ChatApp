import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Fonts from '../../../config/Fonts';
import colors from '../../../config/colors';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
const ChatHeader = ({userInfo, onVideoCallPress, onCallPress}) => {
  const insect = useSafeAreaInsets();
  const navigation = useNavigation();

  const handlelastSeenDate = () => {
    if (!userInfo) {
      return null;
    }

    if (userInfo.activeStatus === 'online') {
      return (
        <Text style={[styles.subheader, {fontSize: 10}]}>
          {userInfo.activeStatus}
        </Text>
      );
    } else {
      const now = new Date();
      const statusDate = userInfo.activeStatus?.toDate
        ? userInfo.activeStatus.toDate()
        : now;
      const currentDate = statusDate;
      let _date = moment(currentDate).format('DD/MM/YY');
      const todayDate = new Date();
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);

      if (todayDate.toDateString() === currentDate.toDateString()) {
        _date = `Today at ${moment(currentDate).format('LT')}`;
      } else if (yesterdayDate.toDateString() === currentDate.toDateString()) {
        _date = `Yesterday at ${moment(currentDate).format('LT')}`;
      } else {
        _date = moment(currentDate).format('lll');
      }

      return (
        <Text style={[styles.subheader, {fontSize: 10}]}>
          last seen {_date}
        </Text>
      );
    }
  };

  return (
    <View
      style={[
        styles.mainHeader,
        {marginTop: Platform.OS == 'ios' ? insect.top : 15},
      ]}>
      <View style={styles.imgView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.backIcon}
            source={require('../../../assets/ic_goBack.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarView}>
          <FastImage style={styles.avatar} source={{uri: userInfo.userImg}} />
        </TouchableOpacity>
        <View style={styles.textView}>
          <Text style={styles.heading}>{userInfo.name}</Text>
          <Text style={styles.desc}>{handlelastSeenDate()}</Text>
        </View>
      </View>
      <View style={styles.callView}>
        <TouchableOpacity onPress={onCallPress}>
          <Image
            style={[styles.iconStyle, {marginRight: 10}]}
            source={require('../../../assets/call.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onVideoCallPress}>
          <Image
            style={styles.iconStyle}
            source={require('../../../assets/video.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  textView: {
    marginLeft: 10,
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
  backIcon: {
    height: 15,
    width: 20,
  },
  iconStyle: {
    height: 25,
    width: 25,
  },
  avatarView: {
    height: 65,
    width: 65,
    borderRadius: 35,
    marginLeft: 5,
  },
  avatar: {width: '100%', height: '100%', borderRadius: 50},
  callView: {flexDirection: 'row'},
  imgView: {flexDirection: 'row', alignItems: 'center'},
});
