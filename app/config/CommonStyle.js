import { StyleSheet } from "react-native";
import colors from "./colors";

export default commonStyles = () => {
  const commonSty = StyleSheet.create({
    mainView: {
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      flex: 1,
      backgroundColor: colors.white,
      marginTop: "4%",
    },
  });

  return commonSty;
};
