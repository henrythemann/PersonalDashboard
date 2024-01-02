import { useEffect, useRef, useState } from "react";
import useDraggable from '../hooks/useDraggable';
import styles from '../page.module.css';

export default function WeatherWidget() {
    const weatherWidgetContainer = useRef<HTMLDivElement | null>(null);
    const [movingWeatherWidget, setMovingWeatherWidget] = useState({moving: false, Xoffset: 0, Yoffset: 0});
    const [weatherCityState, setWeatherCityState] = useState({city: '', state: ''});
    const [forecastData, setForecastData] = useState({properties: {periods: [{name: '', detailedForecast: '' }]}});
  
    async function getWeather(position: { coords: { latitude: any; longitude: any; }; }) {
        try {
            const response = await fetch(`https://api.weather.gov/points/${position.coords.latitude},${position.coords.longitude}`)
            const urls = await response.json();
            console.log('made weather api call')
            setWeatherCityState({city: urls.properties.relativeLocation.properties.city, state: urls.properties.relativeLocation.properties.state});
            getForecast(urls.properties.forecast);
        } catch (error) {
            console.error('Error fetching weather:', error);
        };
    }

    async function getForecast(url: string) {
        try {
            const response = await fetch(url)
            const data = await response.json();
            console.log(data);
            setForecastData(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(getWeather);
    }, []);
    useDraggable(weatherWidgetContainer, movingWeatherWidget, setMovingWeatherWidget, styles.weatherWidgetContainer, styles.weatherWidgetHeader);
    return (<>
        <div className={styles.weatherWidgetContainer} ref={weatherWidgetContainer}>{forecastData.properties.periods[0].name}'s Weather for {weatherCityState.city}, {weatherCityState.state}<div>{forecastData.properties.periods[0].detailedForecast}</div></div>
    </>);
  }