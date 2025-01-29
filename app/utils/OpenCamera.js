import {Alert, Platform} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {openSettings, PERMISSIONS, request} from 'react-native-permissions';

const showEnableCameraAlert = () => {
  Alert.alert(
    'Camera Permission Required',
    'Please enable camera access to take photos.',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Enable',
        onPress: () => openSettings(),
      },
    ],
  );
};

const requestCameraPermission = async () => {
  let cameraPermission;

  if (Platform.OS === 'ios') {
    cameraPermission = PERMISSIONS.IOS.CAMERA;
  } else if (Platform.OS === 'android') {
    cameraPermission = PERMISSIONS.ANDROID.CAMERA;
  }

  const result = await request(cameraPermission);
  return result === 'granted';
};

const cameraOpening = async (setState, setModal, setType) => {
  const hasPermission = await requestCameraPermission();
  if (hasPermission) {
    ImagePicker.openCamera({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      mediaType: 'photo',
      cropping: true,
    })
      .then(img => {
        const imageUri = Platform.OS === 'ios' ? img.path : img.path;
        setState(imageUri);
        setType(img.mime);
        setModal(false);
      })
      .catch(error => {
        console.log('Error opening camera:', error);
      });
  } else {
    showEnableCameraAlert();
  }
};

export default cameraOpening;
