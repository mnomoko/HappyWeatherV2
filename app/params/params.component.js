import React, { Component } from 'react';
import {BackHandler, Text, View} from "react-native";

export default class ParamsComponent extends Component  {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View></View>
        )
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {});
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        if (this.props.navigation.index) {
            this.props.dispatch({type: "Navigation/BACK"});
            return true
        } else {
            return false
        }
    }
}
