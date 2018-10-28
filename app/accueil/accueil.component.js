import React, { Component } from 'react';
import {BackHandler, FlatList, StyleSheet, Text, ToastAndroid, View} from "react-native";
import Modal from 'react-native-modal';
import {Button, Fab, Icon, ScrollableTab, Tab, Tabs} from "native-base";
import { ListItem } from "react-native-elements";
import Favori from "../commons/model/favori";
import MeteoService from "../commons/service/meteo.service";
import MeteoBuilder from "../commons/builder/meteo.builder";
import Utils from '../commons/utils/Utils';
import { Location, Permissions, SQLite } from 'expo';
import TabFavori from "./tab/tab.favori.component";

const db = SQLite.openDatabase('db.db');

export default class AccueilComponent extends Component  {

    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
            favoris: [],
            meteos: [],
            data: [],
            location: null,
            visibleModal: false,
            weather: null
        };

        this.init().then(() => this.getWeathers());
    }

    render() {
        if(this.state.isReady) {
            const now = this.state.data[0];
            return (
                <View style={styles.weatherContainer}>
                    <Modal
                        isVisible={this.state.visibleModal}
                        animationType="slide"
                        onBackButtonPress={this.closeModal}
                        onRequestClose={this.closeModal}
                        children={this.renderModalContent()}
                    />
                    {this.renderTabs()}
                    <View>
                        <Fab
                            active={this.state.active}
                            direction="up"
                            containerStyle={{ }}
                            style={styles.fab}
                            position="bottomRight"
                            onPress={() => this.getLocationAsync()}>
                            <Icon name="pin" />
                        </Fab>
                    </View>
                </View>
            )
        }
        else
            return null;
    }

    renderTabs = () => {
        const { meteos } = this.state;
        if(meteos) {
            console.log(meteos.length);
            return (
                <Tabs renderTabBar={() => <ScrollableTab/>}>
                    {meteos.length > 0 && meteos.map((data, index) => (
                        <Tab key={index} heading={data[0].ville}>
                            <TabFavori villes={data}/>
                        </Tab>
                    ))}
                </Tabs>
            );
        }
        else return null;
    };

    renderModalContent = () => {
        let { weather } = this.state;
        if(weather) {
            return (
                <View style={styles.modalContent}>

                    <Text style={styles.tempText}>{weather.ville}</Text>
                    <Icon ios={'ios-sunny'} android={'md-sunny'} style={{fontSize: 48}}/>
                    <Text style={styles.subtitle}>{Utils.getRoundedTemperature(weather.meteo[0].temperature)}</Text>
                    <Text style={styles.subtitle}>{weather.meteo[0].description}</Text>

                    {this.renderButton('Ajouter', () => this.closeModal())}
                </View>
            );
        }
        else
            return <View/>;
    };

    renderButton = (text, onPress, isDisable: false, color) => (
        <Button
            style = {styles.button}
            color={color ? color : 'blue'}
            onPress={onPress}
            disabled={isDisable}
            title={text} accessibilityLabel={text}
        />
    );

    closeModal = () => {
        this.setState({visibleModal: false});
    };

    getWeathers = () => {
        let { favoris, meteos } = this.state;
        if(favoris && favoris.length > 0) {
            for(let favo in favoris) {
                let favori = favoris[favo];
                MeteoService.getForecastWeatherOfToday(favori.ville, favori.codePays)
                    .then((data) => {
                        if (data.cod == 200) {
                            let weather = MeteoBuilder.extractMeteosForecast(data);
                            meteos.push(weather);
                            this.setState(meteos);

                            // if(this.state.data.length < 1) {
                            //     this.setState({data: meteos[0]});
                            // }
                        }
                        else {
                            ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                        }
                    });
            }
            this.setState({ isReady: true });
        }
    };

    executeSql = async (sql, params = []) => {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), reject)
        }))
    };

    init = async() => {
        return await this.select();
    };

    select = async () => {
        const { navigate } = this.props.navigation;
        await this.executeSql('select * from favori', []).then(result => {
            let favoris :Favori[] = [];
            for(let t of result) {
                let favori: Favori = new Favori();
                favori.id = t['id'];
                favori.ville = t['ville'];
                favori.pays = t['pays'];
                favori.codePays = t['code'];

                favoris.push(favori);
            }
            if(favoris.length === 0) {
                ToastAndroid.show(`Vous n'avez pas encore de favori` , ToastAndroid.SHORT);
                navigate('Recherche');
                // navigate('Parametre');
            } else {
                this.setState({favoris: favoris});
                // navigate('Parametre');
            }
        });
    };

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#CED0CE'
                }}
            />
        );
    };

    getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied'
            });
            ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
        }
        else {
            let location = await Location.getCurrentPositionAsync({});

            let {latitude, longitude} = location.coords;
            MeteoService.getWeatherFromLocation(longitude, latitude).then((data) => {
                if(data.cod === 200) {
                    let weather = MeteoBuilder.extractMeteo(data);
                    this.setState({visibleModal: true, weather: weather});
                }
                else {
                    ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                }
            });
        }
    };

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

const styles = StyleSheet.create({
    weatherContainer: {
        flex: 1,
    },
    headerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tempText: {
        fontSize: 32,
        color: '#000000'
    },
    bodyContainer: {
        flex: 3,
    },
    fab: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    }
});
