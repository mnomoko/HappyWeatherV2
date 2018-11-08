import React, { Component } from 'react';
import { BackHandler, ToastAndroid, View } from "react-native";
import { Fab, Icon, ScrollableTab, Tab, Tabs} from "native-base";
import Favori from "../commons/model/favori";
import MeteoService from "../commons/service/meteo.service";
import MeteoBuilder from "../commons/builder/meteo.builder";
import { Location, Permissions, SQLite } from 'expo';
import TabFavori from "./tab/tab.favori.component";
import SpinnerComponent from "../commons/component/spinner/spinner.component";
import styles from "../commons/styles/styles";
import ModalComponent from "../commons/component/modal/modal.component";

const db = SQLite.openDatabase('db.db');

let state = {
    isReady: false,
    favoris: [],
    location: null,
    visibleModal: false,
    weather: null
};

export default class AccueilComponent extends Component  {

    constructor(props) {
        super(props);

        this.state = state;

        this.init().then(() => this.setState({ isReady: true }));
    }

    render() {
        if(this.state.isReady) {
            return (
                <View style={styles.weatherContainer}>
                    <ModalComponent
                        visibleModal={this.state.visibleModal}
                        weather={this.state.weather}
                        visibilityHandler={this.switchVisibility}
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
            return <SpinnerComponent/>;
    }

    renderTabs = () => {
        const { favoris } = this.state;
        if(favoris) {
            return (
                <Tabs renderTabBar={() => <ScrollableTab/>}>
                    {favoris.length > 0 && favoris.map((favori, index) => (
                        <Tab key={index} heading={favori.ville}>
                            <TabFavori favori={favori}/>
                        </Tab>
                    ))}
                </Tabs>
            );
        }
        else return null;
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
            let favoris = [];
            for(let t of result) {
                let favori = new Favori();
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

    getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied'
            });
            ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
        }
        else {
            this.setState({visibleModal: true, weather: null});
            let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});

            let {latitude, longitude} = location.coords;
            MeteoService.getWeatherFromLocation(longitude, latitude).then((data) => {
                if(data.cod === 200) {
                    let weather = MeteoBuilder.extractMeteo(data);
                    this.setState({weather: weather});
                }
                else {
                    ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                }
            }).catch(() => {
                this.setState({visibleModal: false});
                ToastAndroid.show('Problème lors de la récupération de votre emplacement')
            });
        }
    };

    switchVisibility = (visibility) => {
        this.setState({visibleModal: visibility})
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {});
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        state = this.state;
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

