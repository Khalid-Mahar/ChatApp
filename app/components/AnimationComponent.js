// AnimationModal.js
import React from "react";
import { View, Modal, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const AnimationComponent = ({ visible, type, onClose }) => {
  const getAnimationSource = () => {
    switch (type) {
      case "loading":
        return require("../assets/animation/loader.json");
      case "success":
        return require("../assets/animation/success.json");
      case "error":
        return require("../assets/animation/error.json");
      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LottieView
          source={getAnimationSource()}
          autoPlay
          loop={type === "loading"}
          style={styles.lottie}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  lottie: {
    width: 130,
    height: 130,
  },
});

export default AnimationComponent;
