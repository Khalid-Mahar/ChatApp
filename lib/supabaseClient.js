import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mnpvuzqzvhnhgtabiyet.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucHZ1enF6dmhuaGd0YWJpeWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2Mzc3NTMsImV4cCI6MjA0ODIxMzc1M30.0QGeMOY2LiN3R92iOEs_1UAqZYZFI7Cx31KnHTleTXs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
  },
});
