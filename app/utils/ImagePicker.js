import {launchImageLibrary} from 'react-native-image-picker';

const ImagePicker = async (setState, setType) => {
  const options = {
    title: 'Select Photo',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  await launchImageLibrary(options, response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.assets[0].uri) {
      if (setState !== undefined) {
        setState(response.assets[0].uri);
      }
      return response.assets[0];
    }
  });
};

export default ImagePicker;
