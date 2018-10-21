import React, { Component } from 'react';
import {
    BackHandler,
    Button, FlatList,
    StyleSheet,
    Text, TextInput,
    ToastAndroid,
    TouchableHighlight, TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import { List, ListItem, SearchBar } from "react-native-elements";
import MeteoService from '../commons/service/meteo.service';
import CityService from '../commons/service/city.service';
import CountryService from '../commons/service/country.service';
import MeteoBuilder from '../commons/builder/meteo.builder';
import Favori from '../commons/favori';
import Utils from '../commons/Utils';

export default class RechercheComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visibleModal: null,
            meteo: {temperature: ''},
            favoris: []
        };
        this.init();
    }

    executeSql = async (sql, params = []) => {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), reject)
        }))
    };

    init = async() => {
        let favori = new Favori();
        favori.id = 0;
        favori.ville = 'paris';
        favori.pays = 'france';
        favori.codePays = 'fr';
        this.state.favoris.push(favori);
        // await this.select();
    };

    select = () => {
        this.executeSql('select * from favori', []).then(result => {
            let favoris :Favori[] = [];
            for(let t of result) {
                let favori: Favori = new Favori();
                favori.id = t['id'];
                favori.ville = t['ville'];
                favori.pays = t['pays'];
                favori.codePays = t['codePays'];

                favoris.push(favori);
            }
            this.setState({favoris: favoris});
            this.setState({isLoaded: true});
        });
    };

    insert = async (favori: Favori) => {
        let id = Utils.generateID();
        await this.executeSql('insert into favori (id, ville, pays, codePays) values (?, ?, ?, ?)', [id, favori.ville, favori.pays, favori.codePays, ]);
    };

    getWeather = (ville, code) => {
        MeteoService.getCurrentWeatherOfToday(ville, code)
            .then((data) => {
                if(data.cod === 200) {
                    let weather = MeteoBuilder.extractMeteo(data);
                    this.setState({visibleModal: 3, meteo: weather.meteo[0]});
                }
                else {
                    ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                }
            });
    };

    renderButton = (text, onPress) => (
        <Button
            style = {styles.button}
            onPress={onPress}
            title={text} accessibilityLabel={text}
        />
    );

    closeModal = () => {
        this.setState({visibleModal: null});
    };

    renderModalContent = () => {
        return (
            <View style={styles.modalContent}>
                <Text>{this.state.meteo.temperature}</Text>
                {this.renderButton('Close', () => this.closeModal())}
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
        const { favoris } = this.state;
        if(favoris && favoris.length > 0) {
            return this.renderHeaderListAndFavoris();
        }
        else {
            return this.renderHeaderList();
        }
    };

    renderHeaderList = () => {
        return (
            <SearchBar
                placeholder="Rechercher une ville.."
                lightTheme
                round
                onChangeText={text => this.searchFilterFunction(text)}
                autoCorrect={false}
            />
        )
    };
    renderHeaderListAndFavoris = () => {
        const { favoris } = this.state;
        return (
            <View>
                <SearchBar
                    placeholder="Rechercher une ville.."
                    lightTheme
                    round
                    onChangeText={text => this.searchFilterFunction(text)}
                    autoCorrect={false}
                />
                <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
                    <FlatList
                        data={favoris}
                        renderItem={({ item }) => (
                            <ListItem
                                title={item.ville}
                                subtitle={item.pays}
                                onPress={() => this.handleSearchPress(item)}
                                containerStyle={{ borderBottomWidth: 0 }}
                            />
                        )}
                        keyExtractor={item => `${item.id}`}
                        ItemSeparatorComponent={this.renderSeparator}
                    />
                </List>
            </View>
        );
    };

    render() {
        return (
            <View>
                <Modal
                    isVisible={this.state.visibleModal === 3}
                    animationInTiming={200}
                    animationOutTiming={200}
                    backdropTransitionInTiming={200}
                    backdropTransitionOutTiming={200}
                    onBackButtonPress={this.closeModal}
                    children={this.renderModalContent()}
                />
                <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
                    <FlatList
                        data={this.state.data}
                        renderItem={({ item }) => (
                            <ListItem
                                title={item.name}
                                lightTheme={false}
                                subtitle={item.country}
                                onPress={() => this.handleSearchPress(item)}
                                containerStyle={{ borderBottomWidth: 0 }}
                            />
                        )}
                        keyExtractor={item => `${item.geonameid}`}
                        ItemSeparatorComponent={this.renderSeparator}
                        ListHeaderComponent={this.renderHeader}
                    />
                </List>
            </View>
        )
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
        flexDirection: 'row',
        backgroundColor:'white',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    }
});