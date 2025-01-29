import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Fonts from '../config/Fonts';
import Colors from '../config/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import colors from '../config/colors';
import FastImage from 'react-native-fast-image';
import firebaseKeys from '../config/firebaseKeys';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {duration} from 'moment';
const {width} = Dimensions.get('screen');
// note always use TopComponent outside the safeAreaView
const TopComponent = ({
  leftIcon = false,
  title,
  rightIcon,
  style,
  circleLeft,
  onRightIconPress,
  onLeftIconPress,
  onCircleLeftIconPress,
  createBlacklist,
  onCreateBlacklistPress,
  rightIconImage,
  titleSty,
  searchIcon,
  value,
  editBtn,
  setValue,
  searchFunction,
  searchFunction2,
  onEditPress,
  handleClosePress,
}) => {
  const insect = useSafeAreaInsets();
  const [showInputField, setShowInputField] = useState(false);
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const animation = useSharedValue(0);
  const animatingStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(animation.value === 1 ? width * 0.9 : 0, {
        duration: 400,
      }),
    };
  });

  const fetchUserData = async () => {
    try {
      await firestore()
        .collection(firebaseKeys.user)
        .doc(auth()?.currentUser?.uid)
        .onSnapshot(snap => {
          const data = snap.data();
          setUserData(data);
        });
    } catch (error) {
      console.log('========ERROR IN GETTING CURRENT USER DATA=======', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <View>
      <View
        style={[
          styles.mainView,
          style,
          {
            marginTop: Platform.OS == 'ios' ? insect.top : 18,
          },
        ]}>
        {/* {!showInputField && ( */}
        <>
          {leftIcon ? (
            <TouchableOpacity
              onPress={
                onLeftIconPress == undefined || onLeftIconPress == ''
                  ? () => navigation.goBack()
                  : onLeftIconPress
              }
              style={styles.menueView}>
              <Image
                style={[
                  styles.iconStyle,
                  {height: 20, width: 20, resizeMode: 'contain'},
                ]}
                source={require('../assets/ic_goBack.png')}
              />
            </TouchableOpacity>
          ) : (
            !circleLeft && !searchIcon && <View style={styles.iconStyle} />
          )}
          {searchIcon ? (
            <TouchableOpacity
              onPress={() => {
                // animation.value = animation.value === 1 ? 0 : 1;
                setShowInputField(!showInputField);
              }}
              style={styles.circleBackIcon}>
              <Image
                style={[
                  styles.iconStyle,
                  {height: 18, width: 18, resizeMode: 'contain'},
                ]}
                source={require('../assets/search.png')}
              />
            </TouchableOpacity>
          ) : null}
          {circleLeft ? (
            <TouchableOpacity
              onPress={
                onLeftIconPress == undefined || onLeftIconPress == ''
                  ? () => navigation.goBack()
                  : onCircleLeftIconPress
              }
              style={styles.circleBackIcon}>
              <Image
                style={[
                  styles.iconStyle,
                  {height: 18, width: 18, resizeMode: 'contain'},
                ]}
                source={require('../assets/ic_goBack.png')}
              />
            </TouchableOpacity>
          ) : null}
          {title ? (
            <Text style={[styles.title, titleSty]}>{title}</Text>
          ) : (
            <View style={{}} />
          )}
          {rightIcon ? (
            <TouchableOpacity onPress={onRightIconPress} style={styles.imgView}>
              {userData.userImg !== '' ? (
                <FastImage
                  style={styles.img}
                  source={{uri: userData.userImg}}
                />
              ) : (
                <Image style={styles.img} source={'../assets/defaultImg.jpg'} />
              )}
            </TouchableOpacity>
          ) : !createBlacklist && !editBtn ? (
            <View style={[styles.iconStyle, {height: 20, width: 18}]} />
          ) : null}
          {createBlacklist && (
            <TouchableOpacity
              onPress={onCreateBlacklistPress}
              style={styles.menueView}>
              <Image
                style={[styles.iconStyle, {height: 40, width: 40}]}
                source={require('../assets/addAcc.png')}
              />
            </TouchableOpacity>
          )}
          {editBtn && (
            <TouchableOpacity onPress={onEditPress} style={styles.menueView}>
              <Image
                style={[styles.iconStyle, {height: 40, width: 40}]}
                source={require('../assets/editAcc.png')}
              />
            </TouchableOpacity>
          )}
        </>
        {/* )} */}
      </View>
      {showInputField && (
        // <Animated.View style={[styles.textInputField, animatingStyle]}>
        <View style={[styles.textInputField, animatingStyle]}>
          <TextInput
            value={value}
            onChangeText={text => {
              setValue(text);
              if (searchFunction !== undefined) {
                searchFunction(text);
              }
              if (searchFunction2 !== undefined) {
                searchFunction2(text);
              }
            }}
            autoCapitalize="none"
            style={styles.textValues}
          />
          <TouchableOpacity
            onPress={() => {
              setValue('');
              animation.value = animation.value === 1 ? 0 : 1;
              setTimeout(() => {
                setShowInputField(false);
              }, 450);
              if (handleClosePress !== undefined) {
                handleClosePress();
              }
            }}
            activeOpacity={1}
            style={styles.closeButton}>
            <Image
              style={styles.closeIcon}
              source={require('../assets/ic_close.png')}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TopComponent;

const styles = StyleSheet.create({
  mainView: {
    marginHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menueView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    height: 22,
    width: 22,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.regular24,
    fontWeight: '600',
    color: Colors.white,
    right: 10,
  },
  circleBackIcon: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  img: {
    height: 40,
    width: 40,
    borderRadius: 25,
  },
  imgView: {
    height: 40,
    width: 40,
    borderRadius: 25,
  },
  textInputField: {
    backgroundColor: colors.white,
    width: '90%',
    height: 45,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textValues: {
    width: '90%',
    backgroundColor: colors.white,
    height: '100%',
    paddingHorizontal: 10,
  },
  closeButton: {
    height: '100%',
    backgroundColor: colors.green,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    right: 5,
  },
  closeIcon: {
    height: 15,
    width: 15,
    tintColor: colors.white,
  },
});
