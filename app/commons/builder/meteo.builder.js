import Meteo from '../model/meteo';
import Ville from "../model/ville";
import CountryService from "../service/country.service";

export default class MeteoBuilder {

    static extractMeteo = (meteoJson) => {
        let meteo = new Meteo();
        meteo.temperature = meteoJson.main.temp;
        meteo.description = meteoJson.weather[0].description;

        let ville = new Ville();
        let country = CountryService.getCountryByCode(meteoJson.sys.country);
        ville.ville = meteoJson.name;
        ville.pays = country.name;
        ville.codePays = country.code;
        ville.meteo = [meteo];

        return ville;
    };

    static extractMeteosForecast = (meteoJson) => {
        let villes = [];
        const list = meteoJson.list;
        for(let data in list) {
            let meteo = new Meteo();
            meteo.temperature = list[data].main.temp;
            meteo.description = list[data].weather[0].description;
            meteo.date = list[data].dt;

            let ville = new Ville();
            let country = CountryService.getCountryByCode(meteoJson.city.country);
            ville.ville = meteoJson.city.name;
            ville.pays = country.name;
            ville.codePays = country.code;
            ville.meteo = [meteo];

            villes.push(ville);
        }

        return villes;
    };
}