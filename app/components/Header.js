import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import InputText from './InputText';
import colors from '../config/colors';
import {useNavigation} from '@react-navigation/native';
import screenNames from '../config/ScreenNames';

const Header = ({
  title,
  value,
  setValue,
  searchFunction,
  searchFunction2,
  rightIconShow = false,
  ...otherProps
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.mainView}>
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 10,
        }}>
        <View style={styles.textStyle}>
          <Text
            style={{
              fontSize: 32,
              color: colors.white,
              fontWeight: '700',
            }}>
            {title}
          </Text>
          {rightIconShow ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(screenNames.addFriends);
              }}
              style={styles.menueView}>
              <Image
                style={[styles.iconStyle, {height: 40, width: 40}]}
                source={require('../assets/addAcc.png')}
              />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 20,
          width: 'auto',
          height: 40,
          backgroundColor: '#D3D3D3',
          marginTop: 10,
          borderRadius: 20,
          alignItems: 'center',
          paddingHorizontal: 15,
          flexDirection: 'row',
        }}>
        <View style={{width: 25, height: 25}}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
            source={require('../assets/search.png')}
          />
        </View>
        <TextInput
          placeholder="Search"
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
          {...otherProps}
        />
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  textStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
