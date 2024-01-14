'use client';
import WeatherWidget from './components/weather-widget';
import Calendar from './components/calendar';

export default function Dashboard() {
  return (<>
  <Calendar />
  <WeatherWidget />
  </>);
}

