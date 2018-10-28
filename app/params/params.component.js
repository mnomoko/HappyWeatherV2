import React, { Component } from 'react';
import {BackHandler, ListView, StyleSheet, ToastAndroid, View} from "react-native";
import {Constants, SQLite} from 'expo';
import Favori from "../commons/model/favori";
import { Button, Content, Icon, List, ListItem, Text } from 'native-base';

const db = SQLite.openDatabase('db.db');

export default class ParamsComponent extends Component {

    //TODO LANG

    constructor(props) {
        super(props);

        this.state = {
            basic: true,
            switchValue: false,
            favoris: []
        };

        this.init();
    }

    deleteRow(secId, rowId, rowMap) {
        rowMap[`${secId}${rowId}`].props.closeRow();
        let fav = this.state.favoris[rowId];
        this.deleteFavori(fav.id).then(() => {
            const newData = [...this.state.favoris];
            newData.splice(rowId, 1);
            this.setState({ favoris: newData });
        });
    };

    deleteRows = () => {
        this.deleteFavoris().then(() => {
            this.setState({favoris: []});
            ToastAndroid.show('Tous les favoris ont été supprimé', ToastAndroid.SHORT);
        });
    };

    executeSql = async (sql, params = []) => {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(sql, params, (_, {rows}) => resolve(rows._array), reject)
        }))
    };

    init = async () => {
        await this.select();
    };

    select = async () => {
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
            this.setState({favoris});
        });
    };

    deleteFavori = async (id) => {
        return await this.executeSql('delete from favori where id = ?', [id]);
    };

    deleteFavoris = async () => {
        return await this.executeSql('delete from favori', []);
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {this.renderListeFavoris()}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 }}>
                    <View style={{ flex: 2, paddingLeft: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: '200' }}>Supprimer tous les favoris</Text>
                    </View>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        {this.renderButton('Suppimer', this.deleteRows)}
                    </View>
                </View>
            </View>
        )
    }

    renderListeFavoris() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        let { favoris } = this.state;
        if(favoris) {
            return (
                <Content>
                    <View><Text> Liste des favoris </Text></View>
                    <List
                        rightOpenValue={-75}
                        dataSource={ds.cloneWithRows(favoris)}
                        renderRow={data =>
                            <ListItem>
                                <Text> {data.ville} ({data.pays}) </Text>
                            </ListItem>}
                        renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                            <Button full danger
                                    onPress={() => this.deleteRow(secId, rowId, rowMap)}>
                                <Icon active name="trash"/>
                            </Button>}
                    />
                </Content>
            );
        }
        else
            return null;
    }

    renderButton = (text, onPress, isDisable: false) => (
        <Button small onPress={onPress} disabled={isDisable}>
            <Text>{text}</Text>
        </Button>
    );

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
    container: {
        flex: 3,
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#fff',
    },
    button: {
        borderWidth: 1,
        borderRadius: 8,
        alignSelf: 'stretch'
    },
});
