// Login.js
import React, { useContext, useState, useCallback } from "react";
import {
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
import auth from "@react-native-firebase/auth";
import MyIndicator from "../components/MyIndicator";
import ErrorModal from "../components/ErrorModal";

const { width, height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const { changeLanguage } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const Auth_ = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Please enter your email address";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Please enter your password";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

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

  const validateForm = useCallback(() => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
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

  const handleLoginError = (error) => {
    const errorMessages = {
      "auth/user-not-found": "No account found with this email",
      "auth/invalid-email": "Invalid email format",
      "auth/invalid-login": "Invalid login credentials",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-credential": "Invalid credentials",
      "auth/internal-error": "Something went wrong. Please try again",
      "auth/network-request-failed":
        "Network error. Please check your connection",
      "auth/requires-recent-login": "Please login again for security",
    };

    setErrorModal({
      visible: true,
      title: "Login Error",
      message: errorMessages[error.code] || "An unexpected error occurred",
    });
  };

  const handleLogin = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      await auth()
        .signInWithEmailAndPassword(formData.email, formData.password)
        .then(() => {
          Auth_.Login(auth().currentUser);
        });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleLoginError(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <TopComponent />
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
            <Text style={styles.welcomeMsg}>{language.t("welcomeMsg")}</Text>
            <Text style={styles.subheading}>
              Please sign in to continue to your account
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <InputText
                value={formData.email}
                setValue={(value) => handleInputChange("email", value)}
                erorrText={errors.email}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                containerStyle={styles.input}
              />
              <InputText
                value={formData.password}
                setValue={(value) => handleInputChange("password", value)}
                autoCapitalize="none"
                erorrText={errors.password}
                secureTextEntry={showPassword}
                placeholder="Password"
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

            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              onPress={() => navigation.navigate(screenNames.forgotPassword)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <ButtonComponent
              onPress={handleLogin}
              title="Sign In"
              style={styles.signInButton}
              textStyle={styles.buttonText}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.bottomView}>
              <Text style={styles.textStyles}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(screenNames.signup)}
                style={styles.signUpButton}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
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
    paddingTop: height * 0.04,
    paddingBottom: height * 0.02,
  },
  welcomeMsg: {
    fontSize: 32,
    fontFamily: Fonts.bold24,
    color: colors.black,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontFamily: Fonts.medium24,
    color: colors.grey,
    marginBottom: height * 0.02,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: height * 0.04,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    marginBottom: height * 0.02,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: Fonts.medium24,
    color: colors.primaryColor,
  },
  signInButton: {
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
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.bold24,
    color: colors.white,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: height * 0.03,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.grey + "40",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.grey,
    fontFamily: Fonts.medium24,
    fontSize: 14,
  },
  bottomView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.02,
  },
  textStyles: {
    fontSize: 15,
    fontFamily: Fonts.medium24,
    color: colors.grey,
  },
  signUpButton: {
    marginLeft: 4,
    padding: 8,
  },
  signUpText: {
    fontSize: 15,
    fontFamily: Fonts.bold24,
    color: colors.primaryColor,
    fontWeight: "700",
  },
});

export default Login;
