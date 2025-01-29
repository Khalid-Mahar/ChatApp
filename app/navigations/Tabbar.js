import { StyleSheet, Image, Text, View, Platform } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Fonts from "../config/Fonts";
import colors from "../config/colors";
import screens from "../config/AllScreens";
const tab = createBottomTabNavigator();
const Tabbar = () => {
  return (
    <tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 80.72,
          backgroundColor: colors.black,
        },
      }}
    >
      <tab.Screen
        name="HomeTab"
        component={screens.homeScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={[
                  styles.iconMainview,
                  { marginTop: Platform.OS === "ios" ? "10%" : 0 },
                ]}
              >
                <Image
                  style={[
                    styles.iconStyle,
                    { tintColor: focused ? colors.caret : colors.white },
                  ]}
                  resizeMode="contain"
                  source={require("../assets/home.png")}
                />
              </View>
            );
          },
        }}
      />
      <tab.Screen
        name="CallTab"
        component={screens.call}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={[
                  styles.iconMainview,
                  { marginTop: Platform.OS === "ios" ? "10%" : 0 },
                ]}
              >
                <Image
                  style={[
                    {
                      tintColor: focused ? colors.caret : colors.white,
                      height: 30,
                      width: 30,
                      marginTop: 10,
                    },
                  ]}
                  source={require("../assets/phone-call.png")}
                />
              </View>
            );
          },
        }}
      />
      <tab.Screen
        name="ProfileTab"
        component={screens.profile}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={[
                  styles.iconMainview,
                  { marginTop: Platform.OS === "ios" ? "10%" : 0 },
                ]}
              >
                <Image
                  style={[
                    styles.iconStyle,
                    { tintColor: focused ? colors.caret : colors.white },
                  ]}
                  source={require("../assets/add-friend.png")}
                />
              </View>
            );
          },
        }}
      />
      <tab.Screen
        name="Setting"
        component={screens.settings}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={[
                  styles.iconMainview,
                  { marginTop: Platform.OS === "ios" ? "10%" : 0 },
                ]}
              >
                <Image
                  style={[
                    styles.iconStyle,
                    {
                      tintColor: focused ? colors.caret : colors.white,
                    },
                  ]}
                  source={require("../assets/settings.png")}
                />
              </View>
            );
          },
        }}
      />
    </tab.Navigator>
  );
};

export default Tabbar;

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pureWhite,
  },
  iconMainview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: { marginTop: 10, height: 30, width: 30, resizeMode: "contain" },
  text: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.poppin_medium,
    color: colors.lightGray,
  },
  imgStyle: {},
});
