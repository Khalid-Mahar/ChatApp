// import {
//   Dimensions,
//   FlatList,
//   StyleSheet,
//   Text,
//   View,
//   Animated,
//   Image,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useState, useRef} from 'react';
// import {onBoardingScreen} from '../utils/dummyData';
// import Fonts from '../config/Fonts';
// import screenNames from '../config/ScreenNames';

// const {width, height} = Dimensions.get('screen');

// const OnBoardingScreen = ({navigation}) => {
//   const [currIndex, setCurrIndex] = useState(0);
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);

//   const onScroll = Animated.event(
//     [{nativeEvent: {contentOffset: {x: scrollX}}}],
//     {useNativeDriver: false},
//   );

//   const updateCurrentIndex = e => {
//     const contentOffsetX = e.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / width);
//     setCurrIndex(index);
//   };

//   const navigateToIndex = index => {
//     flatListRef.current?.scrollToIndex({index, animated: true});
//     setCurrIndex(index);
//   };

//   const onNextPress = () => {
//     if (currIndex < onBoardingScreen.length - 1) {
//       navigateToIndex(currIndex + 1);
//     }
//   };

//   const onBackPress = () => {
//     if (currIndex > 0) {
//       navigateToIndex(currIndex - 1);
//     }
//   };

//   const renderPagination = () => {
//     return (
//       <View style={styles.paginationContainer}>
//         {onBoardingScreen.map((_, index) => {
//           const dotWidth = scrollX.interpolate({
//             inputRange: [
//               (index - 1) * width,
//               index * width,
//               (index + 1) * width,
//             ],
//             outputRange: [10, 20, 10],
//             extrapolate: 'clamp',
//           });

//           const dotOpacity = scrollX.interpolate({
//             inputRange: [
//               (index - 1) * width,
//               index * width,
//               (index + 1) * width,
//             ],
//             outputRange: [0.3, 1, 0.3],
//             extrapolate: 'clamp',
//           });

//           return (
//             <Animated.View
//               key={index.toString()}
//               style={[
//                 styles.dot,
//                 {
//                   width: dotWidth,
//                   opacity: dotOpacity,
//                 },
//               ]}
//             />
//           );
//         })}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={onBoardingScreen}
//         horizontal
//         pagingEnabled
//         bounces={false}
//         showsHorizontalScrollIndicator={false}
//         onScroll={onScroll}
//         onMomentumScrollEnd={updateCurrentIndex}
//         ref={flatListRef}
//         renderItem={({item}) => {
//           return (
//             <View style={[styles.slide, {backgroundColor: item.mainColor}]}>
//               <View
//                 style={[
//                   styles.imageMainView,
//                   {backgroundColor: item.transparentColor},
//                 ]}>
//                 <View
//                   style={[
//                     styles.imageView,
//                     {backgroundColor: item.imageColor},
//                   ]}>
//                   <Image style={styles.image} source={item.img} />
//                 </View>
//               </View>
//               <View style={styles.boxAndBottomView}>
//                 <View
//                   style={[styles.boxView, {backgroundColor: item.boxColor}]}>
//                   <Text style={styles.heading}>{item.titleText}</Text>
//                   <Text style={styles.description}>{item.description}</Text>
//                 </View>
//                 <View
//                   style={[
//                     styles.bottomMainView,
//                     {backgroundColor: item.mainColor},
//                   ]}>
//                   <TouchableOpacity
//                     onPress={() => {
//                       currIndex !== 2
//                         ? onNextPress()
//                         : navigation.navigate(screenNames.welcome);
//                     }}
//                     style={[
//                       styles.bottomView,
//                       {backgroundColor: item.iconColor},
//                     ]}>
//                     <Image style={styles.iconStyle} source={item.icon} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(_, index) => index.toString()}
//       />
//       {renderPagination()}
//     </View>
//   );
// };

// export default OnBoardingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   slide: {
//     width: width,
//     alignItems: 'center',
//     padding: 20,
//     justifyContent: 'space-between',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFF',
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 16,
//     color: '#FFF',
//     textAlign: 'center',
//   },
//   paginationContainer: {
//     position: 'absolute',
//     bottom: '45%',
//     flexDirection: 'row',
//     alignSelf: 'center',
//   },
//   dot: {
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#FFF',
//     marginHorizontal: 5,
//   },
//   imageMainView: {
//     height: 300,
//     width: 300,
//     borderRadius: 150,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: '20%',
//   },
//   imageView: {
//     height: 200,
//     width: 200,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   image: {
//     height: 150,
//     width: 200,
//     resizeMode: 'contain',
//   },
//   boxView: {
//     width: '95%',
//     alignItems: 'center',
//     borderRadius: 25,
//     padding: 40,
//     // marginBottom: '40%',
//   },
//   heading: {
//     fontSize: 25,
//     fontFamily: Fonts.bold24,
//     color: colors.black,
//     fontWeight: 'bold',
//     width: '80%',
//     textAlign: 'center',
//   },
//   description: {
//     fontSize: 15,
//     fontFamily: Fonts.regular,
//     color: colors.black,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   bottomMainView: {
//     height: 80,
//     width: 80,
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     bottom: 30,
//   },
//   bottomView: {
//     height: 60,
//     width: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconStyle: {height: 20, width: 20, resizeMode: 'contain'},
//   boxAndBottomView: {width: '100%', alignItems: 'center', bottom: '7%'},
// });
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useRef} from 'react';
import {onBoardingScreen} from '../utils/dummyData';
import Fonts from '../config/Fonts';
import screenNames from '../config/ScreenNames';
import localeKeys from '../config/localeKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('screen');

const ImageSection = ({item}) => (
  <View
    style={[styles.imageMainView, {backgroundColor: item.transparentColor}]}>
    <View style={[styles.imageView, {backgroundColor: item.imageColor}]}>
      <Image style={styles.image} source={item.img} />
    </View>
  </View>
);

const PaginationSection = ({scrollX}) => {
  return (
    <View style={styles.paginationContainer}>
      {onBoardingScreen.map((_, index) => {
        const dotWidth = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index.toString()}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const BoxAndBottomSection = ({item, currIndex, onNextPress, navigation}) => (
  <View style={styles.boxAndBottomView}>
    <View style={[styles.boxView, {backgroundColor: item.boxColor}]}>
      <Text style={styles.heading}>{item.titleText}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
    <View style={[styles.bottomMainView, {backgroundColor: item.mainColor}]}>
      <TouchableOpacity
        onPress={async () => {
          if (currIndex !== 2) {
            onNextPress();
          } else {
            const val = JSON.stringify('welcome');
            await AsyncStorage.setItem(localeKeys.welcome, val);
            navigation.navigate(screenNames.login);
          }
        }}
        style={[styles.bottomView, {backgroundColor: item.iconColor}]}>
        <Image style={styles.iconStyle} source={item.icon} />
      </TouchableOpacity>
    </View>
  </View>
);

const OnBoardingScreen = ({navigation}) => {
  const [currIndex, setCurrIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {useNativeDriver: false},
  );

  const updateCurrentIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrIndex(index);
  };

  const navigateToIndex = index => {
    flatListRef.current?.scrollToIndex({index, animated: true});
    setCurrIndex(index);
  };

  const onNextPress = () => {
    if (currIndex < onBoardingScreen.length - 1) {
      navigateToIndex(currIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={onBoardingScreen}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={updateCurrentIndex}
        ref={flatListRef}
        renderItem={({item}) => {
          return (
            <View style={[styles.slide, {backgroundColor: item.mainColor}]}>
              {/* First Section */}
              <ImageSection item={item} />

              {/* Second Section */}
              <PaginationSection scrollX={scrollX} />

              {/* Third Section */}
              <BoxAndBottomSection
                item={item}
                currIndex={currIndex}
                onNextPress={onNextPress}
                navigation={navigation}
              />
            </View>
          );
        }}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-around',
  },
  imageMainView: {
    height: 300,
    width: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
  },
  imageView: {
    height: 200,
    width: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 150,
    width: 200,
    resizeMode: 'contain',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginHorizontal: 5,
  },
  boxView: {
    width: '95%',
    alignItems: 'center',
    borderRadius: 25,
    padding: 40,
  },
  heading: {
    fontSize: 25,
    fontFamily: Fonts.bold24,
    color: colors.black,
    fontWeight: 'bold',
    width: '80%',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomMainView: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
  },
  bottomView: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {height: 20, width: 20, resizeMode: 'contain'},
  boxAndBottomView: {width: '100%', alignItems: 'center'},
});
