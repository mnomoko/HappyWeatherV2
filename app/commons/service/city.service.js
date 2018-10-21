import CountryService from "./country.service";
import Ville from "../ville";

let cities = require('./../cities.json');

export default class CityService {
    static getCity = (ville) => {
        return cities.find(x => x.name === ville);
    };

    static getCityAndCountry = (ville, pays) => {
        let city = cities.find(x => x.name === ville);
        let country = CountryService.getCountryByName(pays);

        let obj = undefined;
        if(city && country) {
            obj = new Ville();
            obj.ville = city;
            obj.codePays = country.codePays;
            obj.pays = country.pays;
        }

        return obj;
    };

    static getCities = () => {
        return cities;
    };

    static filterCity = (text) => {
        return cities.filter(item => {
            const textData = text.toUpperCase();
            return item.name.toUpperCase().indexOf(textData) > -1;
        });
    }
}