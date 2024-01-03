'use client';
import styles from './page.module.css'
import { useRef, useState, useEffect, FormEvent } from 'react';
import WeatherWidget from './components/weather-widget';
import Calendar from './components/calendar';

export default function Dashboard() {
  return (<>
  <Calendar />
  <WeatherWidget />
  </>);
}

