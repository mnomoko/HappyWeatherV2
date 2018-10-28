import React, { Component } from 'react';
import { SearchBar } from "react-native-elements";
import SearchBarFavori from "./search-bar-favori.component";
import {View} from "native-base";

class SearchBarHeader extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        let { mustShow, favoris, filter, searchPress } = this.props;

        favoris = favoris === null ? [] : favoris;
        mustShow = mustShow === null ? false : mustShow;
        filter = filter === null ? () => {} : filter;
        searchPress = searchPress === null ? () => {} : searchPress;

        return (
            <View containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
                <SearchBar
                    placeholder="Rechercher une ville.."
                    lightTheme
                    round
                    onChangeText={text => filter(text)}
                    autoCorrect={false}
                />
                <SearchBarFavori favoris={favoris} onPress={searchPress} mustShow={mustShow}/>
            </View>
        )
    }
}
export default SearchBarHeader;