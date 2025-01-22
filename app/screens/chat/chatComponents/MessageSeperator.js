import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import moment from 'moment';
import colors from '../../../config/colors';
import Fonts from '../../../config/Fonts';
const MessageSeperator = ({date}) => {
  var _date = moment(date).format('DD/MM/YY');
  console.log('====>', date);
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    _date = 'Today';
  }
  const yeseterDay = new Date();
  yeseterDay.setDate(yeseterDay.getDate() - 1);
  if (yeseterDay.toDateString() === date.toDateString()) {
    _date = 'Yesterday';
  }
  return (
    <View style={styles.mainView}>
      <View style={[styles.line, {marginRight: 5}]} />
      <Text style={styles.text}>{_date}</Text>
      <View style={[styles.line, {marginLeft: 5}]} />
    </View>
  );
};
export default MessageSeperator;

const styles = StyleSheet.create({
  mainView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  line: {
    borderWidth: 1,
    borderColor: colors.boderColor,
    width: '38%',
  },
  text: {
    fontSize: 15,
    color: colors.black,
    fontFamily: Fonts.regular24,
  },
});
