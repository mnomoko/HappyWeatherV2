import moment from 'moment/min/moment-with-locales'

export default class Utils {

    static generateID = function () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    static getDate = (timestamp) => {
        moment.locale('fr');
        let dateFormat = 'dddd - HH';
        let time = moment(timestamp * 1000).format(dateFormat);
        return time + 'h';
    };

    static getRoundedTemperature = (temp) => {
        return `${Math.round(temp)} °C`;
    };
};