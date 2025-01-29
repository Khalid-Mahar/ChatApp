import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import colors from '../config/colors';
import Fonts from '../config/Fonts';
const InputText = ({
  title,
  leftIcon,
  rightIcon,
  leftIconStyle,
  rightIconStyle,
  inputStyle,
  value,
  style,
  inputViewStyle,
  onRightIconPress,
  onLeftIconPress,
  placeholder,
  setValue,
  erorrText,
  titleSty,
  animatedTitleStyle,
  showErrorText = false,
  secureTextEntry,
  ...otherProps
}) => {
  const placeholderPosition = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    if (value !== '') {
      Animated.timing(placeholderPosition, {
        toValue: -20,
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
  console.log(erorrText);
  return (
    <View style={[styles.parentView, style]}>
      {title ? <Text style={[styles.heading, titleSty]}>{title}</Text> : null}
      <View
        style={[
          styles.inputView,
          inputViewStyle,
          {
            borderColor:
              erorrText !== '' ? colors.primaryColor : colors.boderColor,
          },
        ]}>
        {leftIcon ? (
          <TouchableOpacity
            onPress={() =>
              onRightIconPress !== undefined
                ? onLeftIconPress()
                : console.log('pressed')
            }
            activeOpacity={0.6}>
            <Image style={[styles.leftIcon, leftIconStyle]} source={leftIcon} />
          </TouchableOpacity>
        ) : null}

        <View
          style={[
            styles.inputContainer,
            {
              height: 60,
              top: value !== '' ? 4 : 0,
            },
          ]}>
          {value !== '' && value !== undefined && (
            <Animated.Text
              style={[
                styles.smallText,
                animatedTitleStyle,
                {transform: [{translateY: placeholderPosition}]},
              ]}>
              {placeholder}
            </Animated.Text>
          )}
          <TextInput
            value={value}
            onChangeText={txt => setValue(txt)}
            placeholder={placeholder}
            placeholderTextColor={colors.black}
            secureTextEntry={
              secureTextEntry !== undefined ? secureTextEntry : false
            }
            style={[styles.inputTXT, inputStyle]}
            {...otherProps}
          />
        </View>

        {rightIcon ? (
          <TouchableOpacity
            onPress={() =>
              onRightIconPress !== undefined
                ? onRightIconPress()
                : console.log('pressed')
            }
            activeOpacity={0.9}>
            <Image
              style={[styles.rightIcon, rightIconStyle]}
              source={rightIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {showErrorText && erorrText !== '' ? (
        <Text style={styles.erorrText}>{erorrText}</Text>
      ) : null}
    </View>
  );
};

export default InputText;

const styles = StyleSheet.create({
  parentView: {zIndex: 0},
  inputView: {
    flexDirection: 'row',
    marginTop: 7,
    borderWidth: 1.8,
    height: 60,
    backgroundColor: colors.inputColor,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    // overflow: 'hidden',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    paddingVertical: 3,
  },
  leftIcon: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
  rightIcon: {
    height: 25,
    width: 25,
    marginRight: 10,
  },
  inputTXT: {
    marginHorizontal: 10,
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
    fontFamily: Fonts.semibold24,
  },
  heading: {
    fontSize: 17,
    color: colors.darkGrey,
    fontFamily: Fonts.semibold,
    letterSpacing: 0.4,
  },
  erorrText: {
    fontFamily: Fonts.poppineRegular,
    color: colors.red,
    marginLeft: 5,
    marginTop: 3,
  },
  smallText: {
    position: 'absolute',
    left: 10,
    fontSize: 10,
    color: colors.black,
    fontFamily: Fonts.regular,
  },
});
