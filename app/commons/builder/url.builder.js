export default class UrlBuilder {

    static APIKEYS = 'a9346b773b5b7b7e4519943713acfea1';

    static getWeatherFromLocation = (longitude, latitude) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}`);
    };
    
    static getForecastCity = (city) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/weather?q=${city}`);
    };

    static getForecastCityCountry = (city, country) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}`);
    };

    static getForecast5DaysCity = (city) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast?q=${city}`);
    };

    static getForecast5DaysCityCountry = (city, country) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}`);
    };

    static getForecast7DaysCity = (city) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=7`);
    };

    static getForecast7DaysCityCountry = (city, country) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city},${country}&cnt=7`);
    };

    static getForecast15DaysCity = (city) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=15`);
    };

    static getForecast15DaysCityCountry = (city, country) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city},${country}&cnt=15`);
    };

    static getForecastDailysCity = (city, days) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=${days}`);
    };

    static getForecastDailysCityCountry = (city, country, days) => {
        return UrlBuilder.getUrl(`http://api.openweathermap.org/data/2.5/forecast/daily?q=${city},${country}&cnt=${days}`);
    };

    static getUrl = (uri) => {
        return uri + `&units=metric&lang=fr&appid=` + UrlBuilder.APIKEYS;
    };
}