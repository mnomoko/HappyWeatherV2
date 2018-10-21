let countries = require('./../counties');

export default class CountryService {
    static getCountryByCode = (code) => {
        let country = countries.find(x => x.code === code);
        return country;
    };

    static getCountryByName = (name) => {
        let country = countries.find(x => x.name === name);
        return country;
    };
}