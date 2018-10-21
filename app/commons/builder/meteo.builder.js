import Meteo from '../meteo';
import Ville from "../ville";
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
    }
}