import React, { Component } from 'react';
import Utils from "../../commons/utils/Utils";
import {FlatList, StyleSheet, Text, View} from "react-native";
import { ListItem } from "react-native-elements";
import {Icon} from "native-base";

export default class TabFavori extends Component {

    constructor(props) {
        super(props);

        let { villes } = this.props;
        let first = villes[0];
        villes.splice(0, 1);

        this.state = {
            isReady: false,
            first: first,
            villes: villes
        };
    }

    render() {
        let { first, isReady, villes } = this.state;
        if(isReady && villes.length > 0 && first !== null) {
            console.log(villes.length);
            return (
                    <View style={styles.weatherContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.tempText}>{first.ville}</Text>
                            <Icon ios={'ios-sunny'} android={'md-sunny'} style={{fontSize: 48}}/>
                            <Text style={styles.tempText}>{Utils.getRoundedTemperature(first.meteo[0].temperature)}˚</Text>
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
                            />
                        </View>
                    </View>
            )
        }
        else
            return null;
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

    componentWillMount() {
        this.setState({isReady: true});
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