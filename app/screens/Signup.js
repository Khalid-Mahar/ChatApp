import React, { useContext, useState, useCallback } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LanguageContext } from "../languages/LanguageContext";
import ButtonComponent from "../components/ButtonComponent";
import language from "../languages/index";
import screenNames from "../config/ScreenNames";
import TopComponent from "../components/TopComponent";
import Fonts from "../config/Fonts";
import InputText from "../components/InputText";
import colors from "../config/colors";
import useAuth from "../auth/useAuth";
import ImagePicker from "../utils/ImagePicker";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import UploadImage from "../utils/UploadImage";
import MyIndicator from "../components/MyIndicator";
import ErrorModal from "../components/ErrorModal";

const { width, height } = Dimensions.get("window");

const Signup = ({ navigation }) => {
  const { changeLanguage } = useContext(LanguageContext);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: "",
    message: "",
  });
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    image: "",
    imageType: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    name: "",
    password: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const Auth_ = useAuth();
  const validateForm = useCallback(() => {
    const newErrors = {
      name: !formData.name.trim() ? "Name is required" : "",
      email: !formData.email.trim()
        ? "Email is required"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ? "Please enter a valid email"
        : "",
      password: !formData.password.trim()
        ? "Password is required"
        : formData.password.length < 6
        ? "Password must be at least 6 characters"
        : "",
      image: !formData.image.trim() ? "Profile image is required" : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setErrorModal({
        visible: true,
        title: "Validation Error",
        message: Object.values(newErrors).filter((error) => error)[0],
      });
      return false;
    }
    return true;
  }, [formData]);

  const handleSignupError = (error) => {
    const errorMessages = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/invalid-email": "Invalid email format",
      "auth/weak-password": "Password is too weak",
      "auth/network-request-failed":
        "Network error. Please check your connection",
    };

    setErrorModal({
      visible: true,
      title: "Signup Error",
      message: errorMessages[error.code] || "An unexpected error occurred",
    });
  };

  const createNewUser = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      const userId = userCredential.user.uid;
      const imageRes = await UploadImage(
        "users",
        formData.image,
        formData.imageType
      );

      const userData = {
        name: formData.name,
        email: formData.email,
        userId: userId,
        userImg: imageRes,
        activeStatus: "active",
        status: "Hi i am using Mail Packet",
        accoutStatus: "active",
        friends: [],
        active: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection("users").doc(userId).set(userData);

      Alert.alert(
        language.t("successFull"),
        language.t("accrountCreateMessage"),
        [
          {
            text: language.t("okay"),
            onPress: () => navigation.navigate(screenNames.mailPacket),
          },
        ]
      );
    } catch (error) {
      handleSignupError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <TopComponent leftIcon={true} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeMsg}>
              {language.t("letSGetStarted")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.avatarMainView}>
              <View style={styles.avatarView}>
                {formData.image ? (
                  <Image
                    style={styles.defaultImg}
                    source={{ uri: formData.image }}
                  />
                ) : (
                  <Image
                    style={styles.defaultImg}
                    source={require("../assets/defaultImg.jpg")}
                    resizeMode="contain"
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  const res = await ImagePicker((image) => {
                    handleInputChange("image", image);
                  });
                  handleInputChange("imageType", res.type);
                }}
                style={styles.iconBtn}
              >
                <Image
                  style={styles.iconstyle}
                  source={require("../assets/ic_edit.png")}
                />
              </TouchableOpacity>
            </View>
            {errors.image && (
              <Text style={styles.errorText}>{errors.image}</Text>
            )}

            <View style={styles.inputContainer}>
              <InputText
                value={formData.name}
                setValue={(value) => handleInputChange("name", value)}
                erorrText={errors.name}
                placeholder={language.t("name")}
                containerStyle={styles.input}
                autoCapitalize="none"
              />
              <InputText
                value={formData.email}
                setValue={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                erorrText={errors.email}
                autoCapitalize="none"
                placeholder={language.t("email")}
                containerStyle={styles.input}
              />
              <InputText
                value={formData.password}
                setValue={(value) => handleInputChange("password", value)}
                autoCapitalize="none"
                erorrText={errors.password}
                secureTextEntry={showPassword}
                placeholder={language.t("password")}
                containerStyle={styles.input}
                rightIconStyle={styles.passwordIcon}
                onRightIconPress={() => setShowPassword(!showPassword)}
                rightIcon={
                  showPassword
                    ? require("../assets/ic_hidePassword.png")
                    : require("../assets/ic_showPassword.png")
                }
              />
            </View>

            <ButtonComponent
              onPress={createNewUser}
              title={language.t("signup")}
              style={styles.signUpButton}
              textStyle={styles.buttonText}
            />

            <View style={styles.bottomView}>
              <Text style={styles.textStyles}>
                {language.t("alreadyHaveAdd")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.replace(screenNames.login)}
                style={styles.loginButton}
              >
                <Text style={styles.loginText}>{language.t("login")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
      />
      <MyIndicator visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  welcomeMsg: {
    fontSize: 32,
    fontFamily: Fonts.bold24,
    color: colors.black,
    fontWeight: "bold",
    width: "70%",
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: height * 0.02,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarMainView: {
    width: 130,
    alignSelf: "center",
    marginBottom: 20,
  },
  avatarView: {
    height: 120,
    width: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.primaryColor,
    alignSelf: "center",
    backgroundColor: colors.grey + "20",
  },
  defaultImg: {
    height: "100%",
    width: "100%",
  },
  iconBtn: {
    height: 32,
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconstyle: {
    height: 20,
    width: 20,
    tintColor: colors.primaryColor,
  },
  inputContainer: {
    marginBottom: height * 0.02,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordIcon: {
    resizeMode: "contain",
    tintColor: colors.grey,
  },
  signUpButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryColor,
    shadowColor: colors.primaryColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: height * 0.02,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.bold24,
    color: colors.white,
  },
  bottomView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.03,
  },
  textStyles: {
    fontSize: 15,
    fontFamily: Fonts.medium24,
    color: colors.grey,
  },
  loginButton: {
    marginLeft: 4,
    padding: 8,
  },
  loginText: {
    fontSize: 15,
    fontFamily: Fonts.bold24,
    color: colors.primaryColor,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 14,
    color: colors.primaryColor,
    fontFamily: Fonts.medium24,
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Signup;
