import UrlBuilder from "../builder/url.builder";
import {ToastAndroid} from "react-native";

export default class MeteoService {

    static getCurrentWeatherOfToday = async (city, country) => {
        console.log(city);
        console.log(country);
        if(country) {
            return await fetch(UrlBuilder.getForecastCityCountry(city, country)).then(async (res) => await res.json()).catch(async (err) => await err);
        }
        else {
            return await fetch(UrlBuilder.getForecastCity(city)).then(async (res) => await res.json()).catch(async (err) => await err.json());
        }
    };

    static getForecastWeatherOfToday = async (city, country) => {
        if(country) {
            return await fetch(UrlBuilder.getForecast5DaysCityCountry(city, country)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
        else {
            return await fetch(UrlBuilder.getForecast5DaysCity(city)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
    };

    static getDailyWeather = async (city, country, days) => {
        if(days) {
            if(country) {
                return await fetch(UrlBuilder.getForecastDailysCityCountry(city, country, days)).then((res) => res.json()).catch(async (err) => await console.log(err));
            }
            else {
                return await fetch(UrlBuilder.getForecastDailysCity(city, days)).then((res) => res.json()).catch(async (err) => await console.log(err));
            }
        }
        else {
            return this.getWeekWeatherForSevenDays(city, country);
        }
    };

    static getWeekWeatherForSevenDays = async (city, country) => {
        if(country) {
            return await fetch(UrlBuilder.getForecast7DaysCityCountry(city, country)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
        else {
            return await fetch(UrlBuilder.getForecast7DaysCity(city)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
    };

    static getWeekWeatherForFifthteenDays = async (city, country) => {
        if(country) {
            return await fetch(UrlBuilder.getForecast15DaysCityCountry(city, country)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
        else {
            return await fetch(UrlBuilder.getForecast15DaysCity(city)).then((res) => res.json()).catch(async (err) => await console.log(err));
        }
    };

    static handleError = (res) => {
        if(res.ok) {
            return res.json();
        } else {
            ToastAndroid.show(JSON.stringify(res.message), ToastAndroid.SHORT);
        }
    };

    showToast = (res) => {
        ToastAndroid.show(JSON.stringify(res.message), ToastAndroid.SHORT);
    };
}