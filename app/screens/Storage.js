import {StyleSheet, Text, View, Dimensions} from 'react-native';
import React, {useState, useEffect} from 'react';
import DeviceInfo from 'react-native-device-info';
import colors from '../config/colors';
import CommonStyle from '../config/CommonStyle';
import TopComponent from '../components/TopComponent';
import RNFS from 'react-native-fs';
import language from '../languages/index';
import Fonts from '../config/Fonts';
import * as Progress from 'react-native-progress';
import ButtonComponent from '../components/ButtonComponent';
const {height, width} = Dimensions.get('screen');
const Storage = ({navigation}) => {
  const commonSty = CommonStyle();
  const [totalStorage, setTotalStorage] = useState(0);
  const [freeStorage, setFreeStorage] = useState(0);
  const [usedStorage, setUsedStorage] = useState(0); // Used storage in GB

  const [cacheStorage, setCacheStorage] = useState(0);
  const [appUsedStorage, setAppUsedStorage] = useState(0);

  const getStorageInfo = async () => {
    try {
      const total = await DeviceInfo.getTotalDiskCapacity(); // Total storage in bytes
      const free = await DeviceInfo.getFreeDiskStorage(); // Free storage in bytes

      const totalInGB = total / 1024 ** 3; // Convert to GB
      const freeInGB = free / 1024 ** 3; // Convert to GB
      const usedInGB = totalInGB - freeInGB; // Calculate used space

      setTotalStorage(totalInGB.toFixed(2)); // Keep 2 decimal points
      setFreeStorage(freeInGB.toFixed(2));
      setUsedStorage(usedInGB.toFixed(2));
    } catch (error) {
      console.error('Error fetching storage info:', error);
    }
  };

  const getAppStorageUsage = async () => {
    try {
      // Path to the app's document directory
      const documentDir = RNFS.DocumentDirectoryPath;
      const cacheDir = RNFS.CachesDirectoryPath;

      // Get sizes of directories
      const documentStats = await RNFS.readDir(documentDir);
      const cacheStats = await RNFS.readDir(cacheDir);

      // Calculate total size
      const documentSize = documentStats.reduce(
        (total, file) => total + file.size,
        0,
      );
      const cacheSize = cacheStats.reduce(
        (total, file) => total + file.size,
        0,
      );

      console.log(
        'Document Directory Size:',
        (documentSize / 1024 ** 2).toFixed(2),
        'MB',
      );
      console.log(
        'Cache Directory Size:',
        (cacheSize / 1024 ** 2).toFixed(2),
        'MB',
      );

      setCacheStorage(cacheSize / 1024 ** 2);
      setAppUsedStorage(documentSize / 1024 ** 2);
      return {
        documentSize: documentSize / 1024 ** 2, // Convert to MB
        cacheSize: cacheSize / 1024 ** 2, // Convert to MB
      };
    } catch (error) {
      console.error('Error fetching app storage usage:', error);
    }
  };
  useEffect(() => {
    getStorageInfo();
    getAppStorageUsage();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} title={language.t('storageData')} />
      <View style={commonSty.mainView}>
        <Text style={styles.heading}>{language.t('deviceStorage')}</Text>

        {totalStorage ? (
          <Progress.Bar
            progress={usedStorage / totalStorage}
            width={width * 0.8}
            height={20}
            color="rgba(0, 122, 255, 1)"
            unfilledColor="rgba(200, 200, 200, 1)"
            borderWidth={1}
            borderRadius={5}
            style={{marginTop: 10, marginHorizontal: 20}}
          />
        ) : null}

        <Text style={styles.storageInfo}>
          {`Used: ${usedStorage} GB ${language.t('outof')} ${totalStorage} GB`}
        </Text>
        {appUsedStorage && cacheStorage ? (
          <Progress.Bar
            progress={appUsedStorage / usedStorage}
            width={width * 0.8}
            height={20}
            color="rgba(0, 122, 255, 1)"
            unfilledColor="rgba(200, 200, 200, 1)"
            borderWidth={1}
            borderRadius={5}
            style={{marginTop: 10, marginHorizontal: 20}}
          />
        ) : null}

        <Text style={styles.storageInfo}>
          {`${language.t('appUsed')}: ${appUsedStorage.toFixed(
            3,
          )} GB ${language.t('outof')} ${usedStorage} GB`}
        </Text>
        {appUsedStorage && cacheStorage ? (
          <Progress.Bar
            progress={cacheStorage / usedStorage}
            width={width * 0.8}
            height={20}
            color="rgba(0, 122, 255, 1)"
            unfilledColor="rgba(200, 200, 200, 1)"
            borderWidth={1}
            borderRadius={5}
            style={{marginTop: 10, marginHorizontal: 20}}
          />
        ) : null}

        <Text style={styles.storageInfo}>
          {`${language.t('cache')}: ${appUsedStorage.toFixed(
            3,
          )} GB ${language.t('outof')} ${usedStorage} GB`}
        </Text>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <ButtonComponent
            onPress={() => navigation.goBack()}
            style={{marginBottom: 30, width: '50%'}}
            title={language.t('goBack')}
          />
        </View>
      </View>
    </View>
  );
};

export default Storage;

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontFamily: Fonts.semibold24,
    color: colors.black,
    marginHorizontal: 20,
    marginTop: 20,
  },
  storageInfo: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.black,
    marginTop: 5,
    marginHorizontal: 20,
  },
});
