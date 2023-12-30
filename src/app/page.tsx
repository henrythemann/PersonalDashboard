'use client';
import { on } from 'events';
import styles from './page.module.css'
import { Ref, RefObject, useRef, useState, useEffect, MouseEventHandler } from 'react';
import { start } from 'repl';
import useDraggable from './hooks/useDraggable';

export default function Dashboard() {
  return (<>
  <Calendar />
  <WeatherWidget />
  </>);
}
function WeatherWidget() {
  const weatherWidgetContainer = useRef<HTMLDivElement | null>(null);
  const [movingWeatherWidget, setMovingWeatherWidget] = useState({moving: false, Xoffset: 0, Yoffset: 0});
  // async function getWeather(position: { coords: { latitude: any; longitude: any; }; }) {
  //   const response = await fetch(`https://api.weather.gov/points/${position.coords.latitude},${position.coords.longitude}`);const urls = await response.json();
  //   const response2 = await fetch(urls.properties.forecast);
  //   console.log(response2);
  // }
  // navigator.geolocation.getCurrentPosition(getWeather);
  useDraggable(weatherWidgetContainer, movingWeatherWidget, setMovingWeatherWidget, styles.weatherWidgetContainer, styles.weatherWidgetHeader);
  return (<>
  <div className={styles.weatherWidgetContainer} ref={weatherWidgetContainer}></div>
  </>);
}
function Calendar() {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames[monthIndex];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [isDatePopupVisible, setIsDatePopupVisible] = useState(false);
  const [datePopupContents, setDatePopupContents] = useState('');
  const titleButtonsRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [yearRange, setYearRange] = useState({ start: today.getFullYear()-10, end: today.getFullYear()+10 });
  const calendarContainer = useRef<HTMLDivElement | null>(null);
  const [isEventPopupVisible, setIsEventPopupVisible] = useState(false);
  const eventPopupPosition = useRef({x: 0, y: 0});
  const lastDatePopupClicked = useRef<HTMLButtonElement | null>(null);
  const yearButtonRef = useRef<HTMLButtonElement | null>(null);
  const monthButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleYearLoad = (loadFutureYears: boolean) => {
    setYearRange(prev => ({ start: prev.start + (loadFutureYears ? 10 : -10) , end: prev.end + (loadFutureYears ? 10 : -10) }));
    };

  const DatePopup = ({ position }: {position: {top: number, left: number, width: number}}) => {
    return (
      <>
      <div className={[styles.popupMenu, datePopupContents == 'year' ? styles.yearSelector : ''].join(' ')} ref={menuRef} style={{ top: position.top, left: position.left, minWidth: position.width }}>
        {isDatePopupVisible && datePopupContents == 'month' && [...monthNames].map((month, i) => (
          <button key={i} className={styles.monthSelectorItem} onClick={() => {
            setMonthIndex(i);
            setIsDatePopupVisible(false);
          }}>{month}</button>
          ))}
        {isDatePopupVisible && datePopupContents == 'year' && (
        <>
        <button className={styles.yearLoadButton} onClick={() => handleYearLoad(false)}>↑</button>
        {[...Array(yearRange.end - yearRange.start + 1)].map((_, i) => {
          
          const year = i + yearRange.start;
          return <button key={i} className={styles.monthSelectorItem} onClick={() => {
            setYear(year);
            setIsDatePopupVisible(false);
          }}>{year}</button>
        })}<button className={styles.yearLoadButton} onClick={() => handleYearLoad(true)}>↓</button></>)}
      </div>
      </>
    );
  };
  
  const getDatePopupPosition = () => {
    if (titleButtonsRef.current === null) return { top: 0, left: 0, width: 0 };
    const rect = titleButtonsRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };
  
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      console.log('handleClickOutside',event.target.classList.contains(styles.titleButton));
      console.log('lastDatePopupClicked',lastDatePopupClicked.current);
      if (isDatePopupVisible && menuRef.current !== null && !(menuRef.current.contains(event.target)) && lastDatePopupClicked.current !== null && !(lastDatePopupClicked.current.contains(event.target))) {
        setIsDatePopupVisible(false);
      }
    };  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePopupVisible, menuRef]);

  const toggleEventPopup = (event: {clientX: number, clientY: number}) => {
    setIsEventPopupVisible(!isEventPopupVisible);
    eventPopupPosition.current.x = event.clientX;
    eventPopupPosition.current.y = event.clientY;
  }

  const EventPopup = ({ position }: {position: {x: number, y: number}}) => {
    return (
      <div className={styles.popupMenu} style={{ top: position.y, left: position.x }}>
          <button className={styles.monthSelectorItem} onClick={() => {setIsEventPopupVisible(false);}}>Add Event</button>
      </div>
    );
  };

  return (<>
    <div className={styles.calendarContainer} ref={(calendarContainer)}>
      <CalendarHeader month={month} monthIndex={monthIndex} year={year} isDatePopupVisible={isDatePopupVisible} setMonthIndex={setMonthIndex} setYear={setYear} setIsDatePopupVisible={setIsDatePopupVisible} titleButtonsRef={titleButtonsRef} setDatePopupContents={setDatePopupContents} calendarContainer={calendarContainer} lastDatePopupClicked={lastDatePopupClicked} monthButtonRef={monthButtonRef} yearButtonRef={yearButtonRef}/>
      <div className={styles.monthSelector}></div>
      <CalendarGrid monthIndex={monthIndex} year={year} dayNames={dayNames} toggleEventPopup={toggleEventPopup}/>    
    </div>
    {isDatePopupVisible && <DatePopup position={getDatePopupPosition()} />}
    {isEventPopupVisible && <EventPopup position={eventPopupPosition.current} />}
  </>)
}

function CalendarHeader({month, monthIndex, year, isDatePopupVisible, setMonthIndex, setYear, setIsDatePopupVisible, titleButtonsRef, setDatePopupContents, calendarContainer, lastDatePopupClicked, monthButtonRef, yearButtonRef}: { monthIndex: number, month: string, year: number, isDatePopupVisible: boolean, setMonthIndex: Function, setYear: Function, setIsDatePopupVisible: Function, titleButtonsRef: Ref<HTMLDivElement>, setDatePopupContents: Function, calendarContainer: RefObject<HTMLDivElement>, lastDatePopupClicked: RefObject<HTMLButtonElement>, monthButtonRef: RefObject<HTMLButtonElement>, yearButtonRef: RefObject<HTMLButtonElement>}) {
  const [movingCalendar, setMovingCalendar] = useState({moving: false, Xoffset: 0, Yoffset: 0});

  const navigate = (forward: boolean) => {
    if (monthIndex === (forward ? 11 : 0)) {
      setMonthIndex(forward ? 0 : 11);
      setYear(year + (forward ? 1 : -1));
    } else {
      setMonthIndex(monthIndex + (forward ? 1 : -1));
    }
  };
  
  const toggleDatePopup = (popupContents: string, buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!isDatePopupVisible && lastDatePopupClicked !== null) {
      (lastDatePopupClicked as any).current = buttonRef.current;
    }
    setIsDatePopupVisible(!isDatePopupVisible);
    setDatePopupContents(popupContents);
  };

  useDraggable(calendarContainer, movingCalendar, setMovingCalendar, styles.calendarHeader, styles.titleButton);
  
  return (<>
    <div className={styles.calendarHeader}>
      <button className={[styles.monthNavigation, styles.backButton].join(' ')} onClick={() => navigate(false)}>&#60;</button>
      <button className={[styles.monthNavigation, styles.nextButton].join(' ')} onClick={() => navigate(true)}>&#62;</button>
      <div className={styles.calendarTitle} ref={titleButtonsRef}>
        <button className={[styles.calendarMonth, styles.titleButton].join(' ')} ref={monthButtonRef} onClick={() => toggleDatePopup('month', monthButtonRef)}>{month}</button>
        <span> </span>
        <button className={[styles.calendarYear, styles.titleButton].join(' ')} ref={yearButtonRef} onClick={() => toggleDatePopup('year', yearButtonRef)}>{year}</button>
      </div>
    </div>
    </>);
}

function CalendarGrid({monthIndex, year, dayNames, toggleEventPopup}: {monthIndex: number, year: number, dayNames: string[], toggleEventPopup: MouseEventHandler<HTMLDivElement>}) {
  const date = new Date(year, monthIndex + 1, 0);
  const daysInMonth = date.getDate();
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
  const [eventData, setEventData] = useState<Event[]>([]);
  let highlightDay =-1;
  const today = new Date();
  if (year === today.getFullYear() && monthIndex === today.getMonth()) {
    highlightDay = today.getDate();
  }
  let timezoneOffset = today.getTimezoneOffset() * 60 * 1000;
  useEffect(() => {
    let startUtcTimestamp = Date.UTC(year, monthIndex, 1) - firstDayOfWeek * 24 * 60 * 60 * 1000;
    fetch(`/api/events?start_time=${startUtcTimestamp}&end_time=${startUtcTimestamp + 42 * 24 * 60 * 60 * 1000}`)
    .then((response) => response.json())
    .then((data) => {
      setEventData(data);
    })
    .catch((error) => {
      console.error('Error fetching events:', error);
    });
  },
  [monthIndex]);

  interface Events {
    [year: number]: {
      [month: number]: {
        [day: number]: Event[];
      };
    };
  }

  interface Event {
    end_time: number;
    start_time: number;
    title: string;
    color: string;
  }
  
  return (<>
    <div className={styles.calendarGrid}>
      {[...Array(7).keys()].map((i) => {
        return <div key={i} className={[styles.calendarGridItem, styles.dayName].join(' ')}>{dayNames[i]}</div>
      })}
      {[...Array(42).keys()].map((i) => {
        i = i - firstDayOfWeek + 1;
        let style = styles.calendarGridItem;
        let spanStyle = '';
        let events: Events = {};
        let dayNumber = i;
        let monthOfDayNumber = monthIndex;
        let yearOfDayNumber = year;

        if (i < 1) {
          style = [styles.calendarGridItem, styles.empty].join(' ');
          dayNumber = daysInPrevMonth + i;
          monthOfDayNumber = prevMonthIndex;
          yearOfDayNumber = prevYear;
        } else if (i === highlightDay) {
          spanStyle = styles.today;
        } else if (i > daysInMonth) {
          style = [styles.calendarGridItem, styles.empty].join(' ');
          dayNumber = i - daysInMonth;
          monthOfDayNumber = monthIndex === 11 ? 0 : monthIndex + 1;
          yearOfDayNumber = monthIndex === 11 ? year + 1 : year;
        }
        for (let event of eventData) {
          if (event.start_time >= Date.UTC(yearOfDayNumber, monthOfDayNumber, dayNumber) && event.end_time < Date.UTC(yearOfDayNumber, monthOfDayNumber, dayNumber + 1)) {
            events[yearOfDayNumber] ??= {};
            events[yearOfDayNumber][monthOfDayNumber] ??= {};
            events[yearOfDayNumber][monthOfDayNumber][dayNumber] ??= [];
            
            events[yearOfDayNumber][monthOfDayNumber][dayNumber].push(event);
          }
        }
        return <div key={i} className={style} onClick={toggleEventPopup}><span className={spanStyle}>{dayNumber}</span>
        {events[yearOfDayNumber]?.[monthOfDayNumber]?.[dayNumber] && [...events[yearOfDayNumber][monthOfDayNumber][dayNumber]].map((event, i) => {return <div key={i} className={styles.event} style={{background: "#"+event.color}}>{event.title}</div>})}
        </div>
        }
      )}
  </div>
  </>);
}