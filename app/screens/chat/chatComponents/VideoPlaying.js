import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import ScreenComponent from '../../../components/ScreenComponent';
import Video from 'react-native-video';
import {useNavigation} from '@react-navigation/native';
import colors from '../../../config/colors';
const VideoPlaying = ({route}) => {
  const navigation = useNavigation();
  const {mediaFile} = route.params;
  const [loader, setLoader] = useState(true);
  return (
    <ScreenComponent style={{flex: 1, backgroundColor: colors.fullWhite}}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={styles.modalIconStyle}>
        <Image
          source={require('../../../assets/close.png')}
          style={styles.modalIcon}
        />
      </TouchableOpacity>

      <View style={styles.mainImageView}>
        <Video
          resizeMode="contain"
          paused={false}
          muted={false}
          source={{uri: mediaFile}}
          style={[styles.modalMainImage, {height: '90%'}]}
          repeat={false}
          onLoad={() => setLoader(false)}
          controls={true}
        />
        {loader ? (
          <View style={styles.modalPlayPauseView}>
            <ActivityIndicator size={'small'} color={'white'} />
          </View>
        ) : null}
      </View>
    </ScreenComponent>
  );
};

export default VideoPlaying;

const styles = StyleSheet.create({
  // modal
  modalIconStyle: {
    height: 30,
    width: 30,
    backgroundColor: colors.green,
    borderRadius: 15,
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: Platform.OS == 'android' ? 10 : 0,
  },
  modalIcon: {
    height: 30,
    width: 30,
    tintColor: colors.fullWhite,
  },
  mainImageView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  modalMainImage: {
    height: '50%',
    width: '100%',
  },
  modalPlayPauseView: {
    position: 'absolute',
    height: 55,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: colors._lightBlue,
  },
});
