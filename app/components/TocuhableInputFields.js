import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import Colors from '../config/Colors';
import Fonts from '../config/Fonts';
const {height, width} = Dimensions.get('screen');
import {LayoutAnimation} from 'react-native';
import CheckBox from './CheckBox';

const TocuhableInputFields = ({
  title,
  leftIcon,
  rightIcon,
  leftIconStyle,
  rightIconStyle,
  inputStyle,
  value,
  style,
  loading,
  setValue,
  searchByValue,
  inputViewStyle,
  onRightIconPress,
  onLeftIconPress,
  error = false,
  onPress,
  data = [],
  titleSty,
  animatedTitleStyle,
  errorText,
  disabled = false,
  onItemPress,
  showErrorText = false,
  isButtonPress,
  placeHolder,
  isOpenOrClose = false,
  mulitSelect = false,
  selectAll = false,
  ...otherProps
}) => {
  const [showContent, setShowContent] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedItemsArr, setSelectedItemsArr] = useState([]);

  const animationController = useRef(new Animated.Value(0)).current;
  const placeholderPosition = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (value !== '') {
      Animated.timing(placeholderPosition, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(placeholderPosition, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  const toggleAnimation = {
    duration: 300,
    update: {
      duration: 300,
      property: LayoutAnimation.Properties.opacity,
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      duration: 200,
      property: LayoutAnimation.Properties.opacity,
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  };

  const toggleListItem = async () => {
    const config = {
      duration: 300,
      toValue: showContent ? 0 : 1,
      useNativeDriver: true,
    };
    Animated.timing(animationController, config).start();
    LayoutAnimation.configureNext(toggleAnimation);
    setShowContent(!showContent);
  };

  const arrowTransform = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const searchFunction = text => {
    if (text) {
      const textData = text.toString().toUpperCase();
      const newData = data.filter(item => {
        const itemData = item.toString().toUpperCase();
        return itemData.indexOf(textData) > -1;
      });

      setOriginalData(newData);
      setSearchText(text);
    } else {
      setOriginalData(data);
      setSearchText(text);
    }
  };

  // to close this modal from previous
  useEffect(() => {
    if (data.length !== 0) {
      !isOpenOrClose ? setShowContent(false) : null;
    }
  }, [isOpenOrClose]);

  const toggleSelectedItem = item => {
    const isSelected = selectedItemsArr.includes(item);
    if (isSelected) {
      setSelectedItemsArr(
        selectedItemsArr.filter(selectedItems => selectedItems != item),
      );
      onItemPress(
        selectedItemsArr.filter(selectedItems => selectedItems != item),
      );
    } else {
      setSelectedItemsArr([...selectedItemsArr, item]);
      onItemPress([...selectedItemsArr, item]);
    }
  };

  return (
    <View style={[styles.parentView, style]}>
      {title !== '' && title !== undefined ? (
        <Text style={[styles.heading, titleSty]}>{title}</Text>
      ) : null}

      <TouchableOpacity
        disabled={loading}
        onPress={
          onPress !== undefined
            ? onPress
            : async () => {
                setSearchText('');
                setSearchData(data);
                setOriginalData(data);
                const err = await isButtonPress();
                if (!err) {
                  toggleListItem();
                }
              }
        }
        activeOpacity={0.5}
        style={[
          styles.inputView,
          inputViewStyle,
          {
            borderWidth: errorText ? 1 : 0,
            borderColor: Colors.red,
            paddingTop: value == '' ? 0 : 15,
            paddingBottom: value == '' ? 0 : 15,
            minHeight: value == '' ? 60 : 0,
          },
        ]}>
        {leftIcon ? (
          <TouchableOpacity
            onPress={() =>
              onRightIconPress !== undefined ? onLeftIconPress() : null
            }
            activeOpacity={0.6}>
            <Image style={[styles.leftIcon, leftIconStyle]} source={leftIcon} />
          </TouchableOpacity>
        ) : null}
        <View style={[styles.inputTXT, inputStyle]}>
          {value !== '' ||
            (selectedItemsArr.length !== 0 && (
              <Animated.Text
                style={[
                  styles.smallText,
                  animatedTitleStyle,
                  {transform: [{translateY: placeholderPosition}]},
                ]}>
                {placeHolder}
              </Animated.Text>
            ))}
          {mulitSelect ? (
            selectedItemsArr.length !== 0 ? (
              <View style={styles.mainView}>
                <View style={styles.row}>
                  {selectedItemsArr.map((item, index) => (
                    <View style={styles.arrSelectedElement}>
                      <Text style={[styles.inputText, {marginLeft: 4}]}>
                        {item}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          toggleSelectedItem(item);
                        }}
                        style={styles.closeBtn}>
                        <Image
                          style={[styles.rightIcon, {marginRight: 0}]}
                          source={require('../assets/close.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={[styles.inputText]}>{placeHolder}</Text>
            )
          ) : value !== '' ? (
            <Text style={[styles.inputText]}>{value}</Text>
          ) : (
            <Text style={[styles.inputText]}>{placeHolder}</Text>
          )}
        </View>

        {rightIcon ? (
          !loading ? (
            <View>
              <Image
                style={[styles.rightIcon, rightIconStyle]}
                source={rightIcon}
              />
            </View>
          ) : (
            <ActivityIndicator
              style={{marginRight: 10}}
              size={'small'}
              color={Colors.dark}
            />
          )
        ) : null}
      </TouchableOpacity>
      {showContent && (
        <View style={styles.flatlistTopView}>
          {searchData.length !== 0 && (
            <View style={[styles.inputView, {height: 50}]}>
              <TextInput
                value={searchText}
                placeholder="Search"
                onChangeText={txt => {
                  setSearchText(txt);
                  searchFunction(txt);
                }}
                style={[styles.inputField]}
                {...otherProps}
              />

              <TouchableOpacity
                onPress={() => {
                  setSearchText(''), setOriginalData(searchData);
                }}
                activeOpacity={0.9}
                style={styles.closeIcon}>
                <Image
                  style={[styles.flatlistIcons]}
                  source={require('../assets/ic_close.png')}
                />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={{
              width: width,
              marginTop: 10,
            }}
            horizontal
            scrollEnabled={false}>
            {originalData.length !== 0 ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={originalData}
                nestedScrollEnabled
                ListHeaderComponent={({}) => {
                  return (
                    selectAll && (
                      <TouchableOpacity
                        style={[styles.flatListMainView, {}]}
                        onPress={() => {
                          const allSelected = originalData.every(item =>
                            selectedItemsArr.includes(item),
                          );

                          if (allSelected) {
                            setSelectedItemsArr([]);
                            onItemPress([]);
                          } else {
                            setSelectedItemsArr(originalData);
                            onItemPress(originalData);
                          }
                          toggleListItem();
                        }}>
                        <View style={styles.checkBox}>
                          {originalData.length == selectedItemsArr.length && (
                            <Image
                              style={{height: 13, width: 13}}
                              source={require('../assets/tick.png')}
                            />
                          )}
                        </View>
                        <Text style={styles.flatListText}>{'Select All'}</Text>
                      </TouchableOpacity>
                    )
                  );
                }}
                renderItem={({item}) => {
                  const isSelected = selectedItemsArr.includes(item);
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        toggleListItem(item);
                        if (mulitSelect) {
                          toggleSelectedItem(item);
                        } else {
                          setValue(item);
                          if (onItemPress) {
                            onItemPress(item);
                          }
                        }
                      }}
                      activeOpacity={0.5}
                      style={styles.flatListMainView}>
                      {mulitSelect ? (
                        <View style={styles.checkBox}>
                          {isSelected ? (
                            <Image
                              style={{height: 13, width: 13}}
                              source={require('../assets/tick.png')}
                            />
                          ) : null}
                        </View>
                      ) : null}

                      <Text style={styles.flatListText}>{item}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={[styles.noDataFound]}>
                <Image
                  style={styles.warningIcon}
                  source={require('../assets/warning.png')}
                />
                <Text
                  style={[
                    styles.flatListText,
                    {
                      color: Colors.red,
                      marginLeft: 10,
                    },
                  ]}>
                  {'No Data Found'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {showErrorText && errorText !== '' && errorText !== undefined ? (
        <Text
          style={{
            fontFamily: Fonts.poppineRegular,
            color: Colors.red,
            marginLeft: 5,
            marginTop: 5,
          }}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

export default TocuhableInputFields;

const styles = StyleSheet.create({
  parentView: {zIndex: 0},
  inputView: {
    flexDirection: 'row',
    marginTop: 7,
    backgroundColor: Colors.inputColor,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  leftIcon: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
  rightIcon: {
    height: 15,
    width: 15,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: '#707070',
  },
  inputTXT: {
    flex: 1,
    alignSelf: 'center',
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    alignSelf: 'center',
    marginHorizontal: 10,
    height: '100%',
    color: Colors.black,
    fontFamily: Fonts.poppineRegular,
  },
  inputText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.poppineRegular,
  },
  heading: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.poppineMedium,
  },
  flatlistTopView: {
    backgroundColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.5,
    elevation: 5,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    maxHeight: height * 0.5,
  },
  flatListMainView: {
    width: width * 0.85,
    marginHorizontal: 5,
    alignItems: 'center',
    marginTop: 5,
    flexDirection: 'row',
  },

  flatListText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.poppineRegular,
    marginLeft: 10,
  },
  flatlistIcons: {
    height: 10,
    width: 10,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  closeIcon: {
    height: 20,
    width: 20,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey,
  },
  warningIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  smallText: {
    fontSize: 10,
    color: Colors.inputText,
    fontFamily: Fonts.poppineRegular,
    bottom: 5,
  },
  arrSelectedElement: {
    backgroundColor: Colors.smokyWhite,
    borderWidth: 1,
    padding: 5,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    borderColor: Colors.grey,
    marginTop: 10,
    marginLeft: 2,
  },
  closeBtn: {
    height: 25,
    borderRadius: 15,
    width: 25,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey,
  },
  noDataFound: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.85,
    height: 35,
  },
  mainView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  checkBox: {
    height: 20,
    width: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
