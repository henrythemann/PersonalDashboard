'use client';
import styles from './page.module.css'
import { Ref, RefObject, useRef, useState, useEffect, FormEvent } from 'react';
import useDraggable from './hooks/useDraggable';
import { Event, Events, SplitDate } from './interfaces';

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
  const eventPopUpDate = useRef<SplitDate>({day: 0, month: 0, year: 0});
  const [eventData, setEventData] = useState<Event[]>([]);

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
      if (isDatePopupVisible && menuRef.current !== null && !(menuRef.current.contains(event.target)) && lastDatePopupClicked.current !== null && !(lastDatePopupClicked.current.contains(event.target))) {
        setIsDatePopupVisible(false);
      }
    };  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePopupVisible, menuRef]);

  const toggleEventPopup = (day: number, month: number, year: number, event: {clientX: number, clientY: number}) => {
    setIsEventPopupVisible(!isEventPopupVisible);
    eventPopUpDate.current.day = day;
    eventPopUpDate.current.month = month;
    eventPopUpDate.current.year = year;
    eventPopupPosition.current.x = event.clientX;
    eventPopupPosition.current.y = event.clientY;
  }

  // TODO: add form validation on empty event names and end time before start time
  const EventPopup = ({ position, handleSubmit }: {position: {x: number, y: number}, handleSubmit: Function}) => {
    const callAddEvent = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      let startHour = +(formData.get('startHour') ?? 0);
      let startMin = +(formData.get('startMin') ?? 0);
      let startAMPM = formData.get('startAMPM');
      let endHour = +(formData.get('endHour') ?? 0);
      let endMin = +(formData.get('endMin') ?? 0);
      let endAMPM = formData.get('endAMPM');
      if (startHour === 12 && startAMPM === 'AM') startHour = 0;
      else if (startAMPM === 'PM') startHour += 12;
      if (endHour === 12 && endAMPM === 'AM') endHour = 0;
      else if (endAMPM === 'PM') endHour += 12;
      const startTime = Date.UTC(eventPopUpDate.current.year, eventPopUpDate.current.month, eventPopUpDate.current.day, startHour, startMin) + today.getTimezoneOffset() * 60 * 1000;
      const endTime = Date.UTC(eventPopUpDate.current.year, eventPopUpDate.current.month, eventPopUpDate.current.day, endHour, endMin) + today.getTimezoneOffset() * 60 * 1000;
      const eventData = {
          start_time: startTime,
          end_time: endTime,
          title: formData.get('eventTitle'),
      };
      handleSubmit(eventData);
  };
    return (
      <form onSubmit={callAddEvent} className={styles.popupMenu} style={{ top: position.y, left: position.x }}>
          <input name="eventTitle" placeholder='Event Name'></input>
          start time:
          <div className={styles.timeSelectContainer}>
            <select name="startHour">
              {[...Array(12).keys()].map((i) => {
                return <option key={i} value={i+1}>{i+1}</option>
              })}
            </select>
            :
            <select name="startMin">
              {[...Array(4).keys()].map((i) => {
                return <option key={i} value={i*15}>{String(i*15).padStart(2,'0')}</option>
              })}
            </select>
            <select name="startAMPM">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          end time:
          <div className={styles.timeSelectContainer}>
            <select name="endHour">
              {[...Array(12).keys()].map((i) => {
                return <option key={i} value={i+1}>{i+1}</option>
              })}
            </select>
            :
            <select name="endMin">
              {[...Array(4).keys()].map((i) => {
                return <option key={i} value={i*15}>{String(i*15).padStart(2,'0')}</option>
              })}
            </select>
            <select name="endAMPM">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          <input type="submit" className={styles.monthSelectorItem} value="Add Event"></input>
      </form>
    );
  };

  const createEvent = (formData: {start_time: number, end_time: number, title: string, color: string}) => {
    setIsEventPopupVisible(false);
    fetch(`/api/events/add?start_time=${formData.start_time}&end_time=${formData.end_time}&title=${formData.title}`)
    .then((response) => response.json())
    .then((data) => {
      formData.color = "0000ff";
      setEventData([...eventData, formData]);
    })
    .catch((error) => {
      console.error('Error adding event:', error);
    });
  }

  return (<>
    <div className={styles.calendarContainer} ref={(calendarContainer)}>
      <CalendarHeader month={month} monthIndex={monthIndex} year={year} isDatePopupVisible={isDatePopupVisible} setMonthIndex={setMonthIndex} setYear={setYear} setIsDatePopupVisible={setIsDatePopupVisible} titleButtonsRef={titleButtonsRef} setDatePopupContents={setDatePopupContents} calendarContainer={calendarContainer} lastDatePopupClicked={lastDatePopupClicked} monthButtonRef={monthButtonRef} yearButtonRef={yearButtonRef}/>
      <div className={styles.monthSelector}></div>
      <CalendarGrid monthIndex={monthIndex} year={year} dayNames={dayNames} toggleEventPopup={toggleEventPopup} eventData={eventData} setEventData={setEventData}/>    
    </div>
    {isDatePopupVisible && <DatePopup position={getDatePopupPosition()} />}
    {isEventPopupVisible && <EventPopup position={eventPopupPosition.current} handleSubmit={createEvent}/>}
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

function CalendarGrid({monthIndex, year, dayNames, toggleEventPopup, eventData, setEventData}: {monthIndex: number, year: number, dayNames: string[], toggleEventPopup: Function, eventData: Event[], setEventData: Function}) {
  const date = new Date(year, monthIndex + 1, 0);
  const daysInMonth = date.getDate();
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
  let highlightDay =-1;
  const today = new Date();
  if (year === today.getFullYear() && monthIndex === today.getMonth()) {
    highlightDay = today.getDate();
  }
  useEffect(() => {
    let startUtcTimestamp = Date.UTC(year, monthIndex, 1) - firstDayOfWeek * 24 * 60 * 60 * 1000;
    fetch(`/api/events/get?start_time=${startUtcTimestamp}&end_time=${startUtcTimestamp + 42 * 24 * 60 * 60 * 1000}`)
    .then((response) => response.json())
    .then((data) => {
      setEventData(data);
    })
    .catch((error) => {
      console.error('Error fetching events:', error);
    });
  },
  [monthIndex]);
  
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
        return <div key={i} className={style} onClick={(e) => toggleEventPopup(dayNumber, monthOfDayNumber, yearOfDayNumber, e)}><span className={spanStyle}>{dayNumber}</span>
        {events[yearOfDayNumber]?.[monthOfDayNumber]?.[dayNumber] && [...events[yearOfDayNumber][monthOfDayNumber][dayNumber]].map((event, i) => {return <div key={i} className={styles.event} style={{background: "#"+event.color}}>{event.title}</div>})}
        </div>
        }
      )}
  </div>
  </>);
}