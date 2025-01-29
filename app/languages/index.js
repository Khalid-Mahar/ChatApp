import I18n from 'react-native-i18n';
import en from './locale/en';
import ur from './locale/ur';
import ar from './locale/ar';
import af from './locale/af';
I18n.fallbacks = true;

I18n.translations = {
  en,
  ur,
  ar,
  af,
};

export default I18n;
