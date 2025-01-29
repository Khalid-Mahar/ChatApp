import Account from '../screens/Account';
import ChangeAppLanguage from '../screens/ChangeAppLanguage';
import Chat from '../screens/chat/Chat';
import ForgotPassword from '../screens/ForgotPassword';
import Login from '../screens/Login';
import MailPacket from '../screens/MailPacket';
import Call from '../screens/MainScreens/Call';
import HomeScreen from '../screens/MainScreens/HomeScreen';
import Profile from '../screens/MainScreens/Profile';
import Settings from '../screens/MainScreens/Settings';
import OnBoardingScreen from '../screens/OnBoardingScreen';
import Signup from '../screens/Signup';
import Welcome from '../screens/Welcome';
import AddFriends from '../screens/AddFriends';
import ChatProfile from '../screens/ChatProfile';
import VideoPlaying from '../screens/chat/chatComponents/VideoPlaying';
import SpecificChats from '../screens/SpecificChats';
import ChatDetails from '../screens/ChatDetails';
import Storage from '../screens/Storage';
import EditProfiles from '../screens/EditProfiles';
import CallScreen from '../screens/chat/CallScreen';
import CallDetailScreen from '../screens/chat/CallDetailScreen';
const screens = {
  login: Login,
  signup: Signup,
  forgotPassword: ForgotPassword,
  mailPacket: MailPacket,
  onBoardingScreen: OnBoardingScreen,
  welcome: Welcome,
  // appNavigator
  homeScreen: HomeScreen,
  profile: Profile,
  call: Call,
  settings: Settings,
  changeAppLanguage: ChangeAppLanguage,
  account: Account,
  addFriends: AddFriends,
  // chats
  chat: Chat,
  chatProfile: ChatProfile,
  videoPlaying: VideoPlaying,
  specificChats: SpecificChats,
  chatDetails: ChatDetails,
  storage: Storage,
  editProfiles: EditProfiles,
  callScreen: CallScreen,
  callDetailScreen: CallDetailScreen,
};

export default screens;
