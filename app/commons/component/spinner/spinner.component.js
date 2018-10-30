import React, { Component } from 'react';
import {ActivityIndicator, View, StyleSheet} from "react-native";

export default class SpinnerComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    }
})