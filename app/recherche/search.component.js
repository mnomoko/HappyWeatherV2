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
        return !!result || this.state.favoris.length >= 3;
    };

    renderButtons = (saved) => {
        if(!saved) {
            return (
                <View style={{paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{marginRight: 5}}>{this.renderButton('Enregistrer la ville', this.enregistrerVille, this.isFavoriteOrMaxLength())}</View>
                    <View style={{marginLeft: 5}}>{this.renderButton('Fermer', this.closeModal)}</View>
                </View>
            )
        }
        else {
            return this.renderButton('Fermer', this.closeModal);
        }
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
                        this.setState({favoris: favoris});
                    }).catch(e => {
                        ToastAndroid.show(`Une erreur s'est produite lors de l'insertion`, ToastAndroid.SHORT);
                    });
                }
            });
        }
        else {
            ToastAndroid.show('La ville a déjà été ajouté aux favoris', ToastAndroid.SHORT);
        }
    };

    renderModalContent = () => {
        return (
            <View style={styles.modalContent}>

                <Text style={styles.tempText}>{this.state.ville}</Text>
                <Icon ios={'ios-sunny'} android={'md-sunny'} style={{fontSize: 48}}/>
                <Text style={styles.subtitle}>{Utils.getRoundedTemperature(this.state.meteo.temperature)}</Text>
                <Text style={styles.subtitle}>{this.state.meteo.description}</Text>

                {this.renderButtons(false)}
            </View>
        );
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
                    {this.state.visibleModal && <Modal
                        isVisible={this.state.visibleModal}
                        animationType="slide"
                        onBackButtonPress={this.closeModal}
                        onRequestClose={this.closeModal}
                        children={this.renderModalContent()}
                    />}
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
            return null;
    };

    handleSearchPress = (item) => {
        let country = CountryService.getCountryByName(item.country);
        if(item && country) {
            this.getWeather(item.name, country.code);
        }
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {});
        this.closeModal();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.closeModal();
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
    main: {
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#2a8ab7'
    },
    title: {
        marginBottom: 20,
        fontSize: 25,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center'
    },
    tempText: {
        fontSize: 32,
        color: '#000000'
    },
    searchInput: {
        height: 50,
        padding: 4,
        marginRight: 5,
        fontSize: 23,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 8,
        color: 'white'
    },
    buttonText: {
        fontSize: 18,
        color: '#111',
        alignSelf: 'center'
    },
    button: {
        height: 45,
        borderWidth: 1,
        borderRadius: 8,
        alignSelf: 'stretch'
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