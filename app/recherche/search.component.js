import React, { Component } from 'react';
import {
    BackHandler,
    Button, FlatList,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from 'react-native';
import {Icon} from "native-base";
import { ListItem } from "react-native-elements";
import Modal from 'react-native-modal';
import MeteoService from '../commons/service/meteo.service';
import CityService from '../commons/service/city.service';
import CountryService from '../commons/service/country.service';
import MeteoBuilder from '../commons/builder/meteo.builder';
import Favori from '../commons/model/favori';
import Utils from '../commons/utils/Utils';
import SearchBarHeader from "./search-bar/search-bar-header.component";
import {SQLite} from "expo";
import SpinnerComponent from "../commons/component/spinner/spinner.component";
import styles from "../commons/styles/styles";
import ModalComponent from "../commons/component/modal/modal.component";

const db = SQLite.openDatabase('db.db');

export default class RechercheComponent extends Component {

    //TODO CLOSE MODAL WHEN RELOAD

    constructor(props) {
        super(props);
        this.state = {
            visibleModal: false,
            weather: undefined,
            ville: '',
            meteo: {temperature: '', description: ''},
            favoris: [],
            isLoaded: false
        };
        this.init();
    }

    executeSql = async (sql, params = []) => {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), reject)
        }))
    };

    init = async() => {
        await this.select();
    };

    select = () => {
        this.executeSql('select * from favori', []).then(result => {
            let favoris :Favori[] = [];
            for(let t of result) {
                let favori: Favori = new Favori();
                favori.id = t['id'];
                favori.ville = t['ville'];
                favori.pays = t['pays'];
                favori.codePays = t['code'];

                favoris.push(favori);
            }
            this.setState({favoris: favoris});
            this.setState({isLoaded: true});
        });
    };

    selectByCityAndCountry = async (ville, codePays) => {
        await this.executeSql('select * from favori where ville = ? and code = ?', [ville, codePays]).then(result => {

            let favori: Favori = undefined;
            if(result.length !== 0) {
                favori = new Favori();
                favori.id = result['id'];
                favori.ville = result['ville'];
                favori.pays = result['pays'];
                favori.codePays = result['code'];
            }

            return favori;
        });
    };

    insert = async (favori: Favori) => {
        let id = Utils.generateID();
        await this.executeSql('insert into favori (id, ville, pays, code) values (?, ?, ?, ?)', [id, favori.ville, favori.pays, favori.codePays, ]);
    };

    getWeather = (ville, code) => {
        MeteoService.getCurrentWeatherOfToday(ville, code)
            .then((data) => {
                if(data.cod === 200) {
                    let weather = MeteoBuilder.extractMeteo(data);
                    this.setState({visibleModal: true, weather: weather, ville:weather.ville, meteo: weather.meteo[0]});
                }
                else {
                    ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                }
            });
    };

    isFavoriteOrMaxLength = () => {
        const { favoris, weather } = this.state;
        let result = favoris.find(fav => fav.ville === weather.ville && fav.codePays === weather.codePays);
        return !!result || this.state.favoris.length >= 5;
    };

    enregistrerVille = () => {
        const { weather } = this.state;

        if(!this.isFavoriteOrMaxLength()) {
            this.selectByCityAndCountry(weather.ville, weather.codePays).then((data) => {

                if (!data) {
                    let favori = new Favori();

                    favori.ville = weather.ville;
                    favori.codePays = weather.codePays;
                    favori.pays = weather.pays;

                    this.insert(favori).then(() => {

                        let favoris = this.state.favoris;
                        favoris.push(favori);
                        this.setState({favoris: favoris, visibleModal: false});
                        ToastAndroid.show('La ville a bien été enregistrer', ToastAndroid.SHORT);

                    }).catch(() => {
                        ToastAndroid.show(`Une erreur s'est produite lors de l'insertion`, ToastAndroid.SHORT);
                    });
                }
            });
        }
        else {
            ToastAndroid.show('La ville a déjà été ajouté aux favoris', ToastAndroid.SHORT);
        }
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

    searchFilterFunction = text => {
        if(text.length > 3) {
            const newData = CityService.filterCity(text);
            this.setState({data: newData});
        }
        else {
            this.setState({data: []});
        }
    };

    renderHeader = () => {
        const { data, favoris } = this.state;
        const mustShow = favoris && favoris.length > 0 && (!data || data.length === 0);

        return <SearchBarHeader filter={this.searchFilterFunction} searchPress={this.getWeather} favoris={favoris} mustShow={mustShow}/>
    };

    render() {
        const { isLoaded } = this.state;
        if(isLoaded) {
            return (
                <View style={{paddingTop: 0}}>
                    <ModalComponent
                        visibleModal={this.state.visibleModal}
                        visibilityHandler={this.switchVisibility}
                        weather={this.state.weather}
                        func={this.enregistrerVille}
                        checker={this.isFavoriteOrMaxLength}
                    />
                    <FlatList
                        data={this.state.data}
                        renderItem={({item}) => (
                            <ListItem
                                title={item.name}
                                lightTheme={false}
                                subtitle={item.country}
                                hideChevron={true}
                                onPress={() => this.handleSearchPress(item)}
                                containerStyle={{borderBottomWidth: 0}}
                            />
                        )}
                        keyExtractor={item => `${item.geonameid}`}
                        ItemSeparatorComponent={this.renderSeparator}
                        ListHeaderComponent={this.renderHeader}
                    />
                </View>
            )
        }
        else
            return <SpinnerComponent/>;
    };

    switchVisibility = (visibility) => {
        this.setState({visibleModal: visibility})
    };

    handleSearchPress = (item) => {
        let country = CountryService.getCountryByName(item.country);
        if(item && country) {
            this.getWeather(item.name, country.code);
        }
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {});
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUpdate(props, states) {
        this.state.visibleModal = states.visibleModal;
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
