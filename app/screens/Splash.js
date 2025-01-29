import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Splash = () => {
  return (
    <View style={styles.mainContainer}>
      <View />
      <Image style={styles.loginImage} source={require('../assets/Logo.png')} />
      <Image
        style={styles.layerImage}
        source={require('../assets/layer.png')}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loginImage: {
    height: 150,
    width: 150,
  },
  layerImage: {
    height: 150,
    width: '100%',
  },
});
