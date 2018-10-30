import React, { Component } from 'react';
import { Button, Text, View } from "react-native";
import { Icon } from "native-base";
import Modal from 'react-native-modal';
import Utils from "../../utils/Utils";
import styles from "../../styles/styles";
import SpinnerComponent from "../spinner/spinner.component";

const CLOSE = 'Fermer';
const SAVE_THE_CITY = 'Enregistrer la ville';

export default class ModalComponent extends Component {

    constructor(props) {
        super(props);

        let { checker, func, visibleModal, weather, visibilityHandler } = props;
        this.state = { checker, func, visibleModal, weather, visibilityHandler };
    }

    render() {
        let { visibleModal } = this.state;
        if(visibleModal) {
            return (
                <Modal
                    isVisible={this.state.visibleModal}
                    animationType="slide"
                    onBackButtonPress={this.closeModal}
                    onRequestClose={this.closeModal}
                    children={this.renderChildren()}
                />
            )
        }
        else return <View/>;
    }

    renderChildren() {
        let { checker, func, weather } = this.state;
        if(weather) {
            return (
                <View style={styles.modalContent}>

                    <Text style={styles.tempText}>{weather.ville}</Text>
                    <Icon ios={'ios-sunny'} android={'md-sunny'} style={{fontSize: 48}}/>
                    <Text style={styles.subtitle}>{Utils.getRoundedTemperature(weather.meteo[0].temperature)}</Text>
                    <Text style={styles.subtitle}>{weather.meteo[0].description}</Text>

                    <View style={{paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
                        {!!func && <View style={{marginRight: 5}}>{this.renderButton(SAVE_THE_CITY, func, checker)}</View>}
                        <View style={{marginLeft: 5}}>{this.renderClose()}</View>
                    </View>
                </View>
            );
        }
        else
            return <SpinnerComponent/>;
    }

    closeModal = () => {
        let { visibilityHandler } = this.state;
        this.setState({visibleModal: false});
        if(visibilityHandler) {
            visibilityHandler(false);
        }
    };

    renderClose = (color) => (
        <Button
            style = {styles.button}
            color={color ? color : 'blue'}
            onPress={this.closeModal}
            title={CLOSE} accessibilityLabel={CLOSE}
        />
    );

    renderButton = (text, onPress, isDisable: false, color) => (
        <Button
            style = {styles.button}
            color={color ? color : 'blue'}
            onPress={onPress}
            disabled={isDisable()}
            title={text} accessibilityLabel={text}
        />
    );

    componentWillMount() {}

    componentWillUpdate(props, state) {
        this.state.weather = props.weather;
        this.state.visibleModal = props.visibleModal;
    }

}