import React, { Component } from 'react';
import { ListItem } from "react-native-elements";
import {FlatList, View} from "react-native";

class SearchBarFavori extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        let { favoris, mustShow, onPress } = this.props;

        favoris = favoris === null ? [] : favoris;
        mustShow = mustShow === null ? false : mustShow;
        onPress = onPress === null ? () => {} : onPress;

        if(mustShow) {
            return (
                <FlatList
                    data={favoris}
                    renderItem={({item}) => (
                        <ListItem
                            title={item.ville}
                            subtitle={item.pays}
                            hideChevron={true}
                            onPress={() => onPress(item.ville, item.codePays)}
                            containerStyle={{borderBottomWidth: 0}}
                        />
                    )}
                    keyExtractor={item => `${item.id}`}
                    ItemSeparatorComponent={this.renderSeparator}
                />
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
}
export default SearchBarFavori;