import React, { Component } from 'react';
import {ActivityIndicator, View, StyleSheet} from "react-native";
import styles from "../../styles/styles";

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