import { Platform, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import React from 'react';

const ScreenComponent = ({ style, children }) => {
    return Platform.OS === 'ios' ? (
        <SafeAreaView style={[styles.screenStyle, style]}>{children}</SafeAreaView>
    ) : (
        <View style={[styles.screenStyle, style]}>{children}</View>
    );
};

export default ScreenComponent;

const styles = StyleSheet.create({
    screenStyle: {
        flex: 1,
        marginVertical: Platform.OS === 'android' ? 0 : 0,
    }
});