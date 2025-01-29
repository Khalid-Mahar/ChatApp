// import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import React, {useContext, useEffect, useState} from 'react';
// import screenNames from '../config/ScreenNames';
// import {StackActions} from '@react-navigation/native';
// import {LanguageContext} from '../languages/LanguageContext';
// import language from '../languages/index';
// import ButtonComponent from '../components/ButtonComponent';
// import TopComponent from '../components/TopComponent';
// import CommonStyle from '../config/CommonStyle';
// import colors from '../config/colors';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import localeKeys from '../config/localeKeys';
// const ChangeAppLanguage = ({navigation}) => {
//   const {changeLanguage} = useContext(LanguageContext);
//   const [selectedLang, setSelectedLang] = useState('');

//   const commonSty = CommonStyle();

//   useEffect(() => {
//     const loadLanguage = async () => {
//       const storedLanguage = await AsyncStorage.getItem(localeKeys.lang);
//       if (storedLanguage === 'Urdu') {
//         setSelectedLang('ur');
//         language.locale = 'ur';
//       } else if (storedLanguage === 'Arabic') {
//         setSelectedLang('ar');
//         language.locale = 'ar';
//       } else if (storedLanguage === 'Afrikaans') {
//         setSelectedLang('af');
//         language.locale = 'af';
//       } else {
//         setSelectedLang('en');
//         language.locale = 'en';
//       }
//     };

//     loadLanguage();
//   }, [selectedLang]);

//   return (
//     <View style={{flex: 1, backgroundColor: colors.caret}}>
//       <TopComponent circleLeft={true} title={language.t('Language')} />
//       <View style={commonSty.mainView}>
//         <Text style={styles.heading}>{language.t('appLanguage')}</Text>

//         <TouchableOpacity
//           onPress={() => {
//             changeLanguage('English');
//           }}
//           style={styles.btnView}>
//           <TouchableOpacity
//             onPress={() => {
//               changeLanguage('English');
//             }}
//             style={styles.selectedMainView}>
//             {selectedLang == 'en' && <View style={styles.selectedView} />}
//           </TouchableOpacity>
//           <Text style={styles.normalText}>{language.t('english')}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => {
//             changeLanguage('Urdu');
//           }}
//           style={styles.btnView}>
//           <TouchableOpacity style={styles.selectedMainView}>
//             {selectedLang == 'ur' && <View style={styles.selectedView} />}
//           </TouchableOpacity>
//           <Text style={styles.normalText}>{language.t('urdu')}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => {
//             changeLanguage('Arabic');
//           }}
//           style={styles.btnView}>
//           <TouchableOpacity style={styles.selectedMainView}>
//             {selectedLang == 'ar' && <View style={styles.selectedView} />}
//           </TouchableOpacity>
//           <Text style={styles.normalText}>{language.t('arabic')}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => {
//             changeLanguage('Afrikaans');
//           }}
//           style={styles.btnView}>
//           <TouchableOpacity style={styles.selectedMainView}>
//             {selectedLang == 'af' && <View style={styles.selectedView} />}
//           </TouchableOpacity>
//           <Text style={styles.normalText}>{language.t('afrikaans')}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ChangeAppLanguage;

// const styles = StyleSheet.create({
//   heading: {
//     fontSize: 15,
//     fontFamily: Fonts.medium24,
//     color: colors.black,
//     fontWeight: '600',
//     marginHorizontal: 20,
//     marginTop: 50,
//   },
//   btnView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//     marginHorizontal: 20,
//   },
//   selectedMainView: {
//     height: 25,
//     width: 25,
//     borderRadius: 15,
//     borderWidth: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedView: {
//     height: 15,
//     width: 15,
//     borderRadius: 15,
//     borderWidth: 2,
//     backgroundColor: colors.black,
//   },
//   normalText: {
//     fontSize: 15,
//     fontFamily: Fonts.regular24,
//     color: colors.black,
//     marginLeft: 15,
//   },
// });
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LanguageContext} from '../languages/LanguageContext';
import language from '../languages/index';
import TopComponent from '../components/TopComponent';
import CommonStyle from '../config/CommonStyle';
import colors from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localeKeys from '../config/localeKeys';
import {StackActions} from '@react-navigation/native';
import screenNames from '../config/ScreenNames';

const ChangeAppLanguage = ({navigation}) => {
  const {changeLanguage} = useContext(LanguageContext);
  const [selectedLang, setSelectedLang] = useState('');

  const commonSty = CommonStyle();

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem(localeKeys.lang);
      setSelectedLang(storedLanguage || 'en');
    };
    loadLanguage();
  }, []);

  const handleLanguageChange = async languageKey => {
    await changeLanguage(languageKey);
    navigation.dispatch(StackActions.replace(screenNames.settings));
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.caret}}>
      <TopComponent circleLeft={true} title={language.t('Language')} />
      <View style={commonSty.mainView}>
        <Text style={styles.heading}>{language.t('appLanguage')}</Text>

        {/* English */}
        <TouchableOpacity
          onPress={() => {
            handleLanguageChange('English'), setSelectedLang('en');
          }}
          style={styles.btnView}>
          <View style={styles.selectedMainView}>
            {selectedLang === 'en' ? (
              <View style={styles.selectedView} />
            ) : null}
          </View>
          <Text style={styles.normalText}>{language.t('english')}</Text>
        </TouchableOpacity>

        {/* Urdu */}
        <TouchableOpacity
          onPress={() => {
            handleLanguageChange('Urdu'), setSelectedLang('ur');
          }}
          style={styles.btnView}>
          <View style={styles.selectedMainView}>
            {selectedLang === 'ur' && <View style={styles.selectedView} />}
          </View>
          <Text style={styles.normalText}>{language.t('urdu')}</Text>
        </TouchableOpacity>

        {/* Arabic */}
        <TouchableOpacity
          onPress={() => {
            handleLanguageChange('Arabic'), setSelectedLang('ar');
          }}
          style={styles.btnView}>
          <View style={styles.selectedMainView}>
            {selectedLang === 'ar' && <View style={styles.selectedView} />}
          </View>
          <Text style={styles.normalText}>{language.t('arabic')}</Text>
        </TouchableOpacity>

        {/* Afrikaans */}
        <TouchableOpacity
          onPress={() => {
            handleLanguageChange('Afrikaans'), setSelectedLang('af');
          }}
          style={styles.btnView}>
          <View style={styles.selectedMainView}>
            {selectedLang === 'af' && <View style={styles.selectedView} />}
          </View>
          <Text style={styles.normalText}>{language.t('afrikaans')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangeAppLanguage;

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 50,
    color: colors.black,
  },
  btnView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  selectedMainView: {
    height: 25,
    width: 25,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.black,
  },
  selectedView: {
    height: 15,
    width: 15,
    borderRadius: 15,
    backgroundColor: colors.black,
  },
  normalText: {
    fontSize: 15,
    marginLeft: 15,
    color: colors.black,
  },
});
