import React, { Component } from 'react';
import Utils from "../../commons/utils/Utils";
import {FlatList, StyleSheet, Text, ToastAndroid, View} from "react-native";
import { ListItem } from "react-native-elements";
import {Icon} from "native-base";
import SpinnerComponent from "../../commons/component/spinner/spinner.component";
import MeteoBuilder from "../../commons/builder/meteo.builder";
import MeteoService from "../../commons/service/meteo.service";
import styles from "../../commons/styles/styles";

let state = {
    isReady: false,
    favori: null,
    first: null,
    villes: [],
    isReady: false,
    isFetching: false
};

export default class TabFavori extends Component {

    constructor(props) {
        super(props);

        state.favori = this.props.favori;
        this.state = state;

        let { first, villes } = this.state;

        if(!!first || !!villes) {
            this.getWeathers();
        }
    }

    render() {
        let { first, isReady, villes } = this.state;
        if(isReady && villes.length > 0 && first !== null) {
            return (
                <View style={styles.weatherContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.tempText}>{first.ville}</Text>
                        <Icon ios={'ios-sunny'} android={'md-sunny'} style={{fontSize: 48}}/>
                        <Text style={styles.tempText}>{Utils.getRoundedTemperature(first.meteo[0].temperature)}</Text>
                        <Text style={styles.tempSubText}>{first.meteo[0].description}</Text>
                    </View>
                    <View style={styles.bodyContainer}>
                        <FlatList
                            data={villes}
                            renderItem={({item}) => (
                                <ListItem
                                    title={Utils.getDate(item.meteo[0].date)}
                                    rightTitle={Utils.getRoundedTemperature(item.meteo[0].temperature)}
                                    hideChevron={true}
                                    subtitle={item.meteo[0].description}
                                    containerStyle={{borderBottomWidth: 0}}
                                />
                            )}
                            keyExtractor={item => `${item.meteo[0].date}`}
                            ItemSeparatorComponent={this.renderSeparator}
                            onRefresh={() => this.onRefresh()}
                            refreshing={this.state.isFetching}
                        />
                    </View>
                </View>
            )
        }
        else
            return <SpinnerComponent/>;
    }

    getWeathers = () => {
        let { ville, codePays } = this.state.favori;
        let first = null;
        if(ville && codePays) {
            MeteoService.getForecastWeatherOfToday(ville, codePays).then(data => {
                if (data.cod == 200) {
                    let weather = MeteoBuilder.extractMeteosForecast(data);
                    first = weather[0];
                    weather.splice(0, 1);
                    this.setState({first, villes: weather});
                }
                else {
                    ToastAndroid.show(JSON.stringify(data.message), ToastAndroid.SHORT);
                }
                this.setState({ isReady: true, isFetching: false });
            })
        }
    };

    onRefresh() {
        this.setState({ isFetching: true }, function() { this.fetchData() });
    }

    fetchData() {
        this.getWeathers();
    }

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

    componentDidMount() {
        // this.setState({isReady: true});
    }

    componentWillUnmount() {
        state = this.state;
    }

}
