import Expo from "expo";
import React, { Component } from 'react';
import { Container, Icon } from "native-base";
import {createDrawerNavigator, createStackNavigator} from 'react-navigation';
import RechercheComponent from "./app/recherche/search.component";
import AccueilComponent from "./app/accueil/accueil.component";
import ParamsComponent from "./app/params/params.component";

const db = Expo.SQLite.openDatabase('db.db');

getNavigationOptions = (title) => {
    return {
        title: title,
        headerStyle: {
            backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }
};

const TITLE = 'Happy Weather V2';

const Accueilstack = createStackNavigator({
    Home: {
        screen: AccueilComponent,
        navigationOptions: ({ navigation }) => ({
            title: TITLE,
            headerLeft: <Icon name="menu" size={35} onPress={ () => navigation.openDrawer() } />
        })
    }
});

const RechercheStack = createStackNavigator({
    Schedules: {
        screen: RechercheComponent,
        navigationOptions: ({ navigation }) => ({
            title: TITLE,
            headerLeft: <Icon name="menu" size={35} onPress={ () => navigation.openDrawer() } />
        })
    }
});

const ParametreStack = createStackNavigator({
    Parametre: {
        screen: ParamsComponent,
        navigationOptions: ({ navigation }) => ({
            title: TITLE,
            headerLeft: <Icon name="menu" size={35} onPress={ () => navigation.openDrawer() } />
        })
    }
});

const Root = createDrawerNavigator({
    Accueil: {
        screen: Accueilstack,
        navigationOptions: {
            title: 'Accueil' // Text shown in left menu
        }
    },
    Recherche: {
        screen: RechercheStack,
        navigationOptions: {
            title: 'Rechercher',  // Text shown in left menu
        }
    },
    Parametre: {
        screen: ParametreStack,
        navigationOptions: {
            title: 'Paramètres',  // Text shown in left menu
        }
    }
});

export default class App extends Component {

    state = {
        isReady: false,
    };

    constructor(props) {
        super(props);
    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            MaterialIcons: require("native-base/Fonts/MaterialIcons.ttf"),
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            Ionicons: require("native-base/Fonts/Ionicons.ttf")
        });
        this.setState({isReady: true});
    }

    componentDidMount() {
        db.transaction(tx => {
            // tx.executeSql(
            //     'drop table if exists favori;'
            // );
            tx.executeSql(
                'create table if not exists favori (id text primary key not null, ville text, pays text, code text);'
            );
        });
    }

    render() {
        return (
            this.state.isReady ?
                <Container>
                    <Root/>
                </Container>
                : null
        )
    }
}
