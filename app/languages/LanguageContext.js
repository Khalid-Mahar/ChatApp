import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import language from '../languages/index';
import localeKeys from '../config/localeKeys';
export const LanguageContext = createContext();

export const LanguageProvider = ({children}) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem(localeKeys.lang);
      if (storedLanguage) {
        setLanguage(storedLanguage);
      } else {
        setLanguage('en');
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async languageKey => {
    const supportedLanguages = {
      en: 'English',
      ur: 'Urdu',
      ar: 'Arabic',
      af: 'Afrikaans',
    };

    if (supportedLanguages[languageKey]) {
      setCurrentLanguage(languageKey);
      language.locale = languageKey;
      await AsyncStorage.setItem(localeKeys.lang, languageKey); // Store preference
    } else {
      console.warn(`Unsupported language key: ${languageKey}`);
    }
  };

  const changeLanguage = async newLanguage => {
    const languageMap = {
      English: 'en',
      Urdu: 'ur',
      Arabic: 'ar',
      Afrikaans: 'af',
    };

    const languageKey = languageMap[newLanguage] || 'en';
    await setLanguage(languageKey);
  };

  return (
    <LanguageContext.Provider value={{currentLanguage, changeLanguage}}>
      {children}
    </LanguageContext.Provider>
  );
};
