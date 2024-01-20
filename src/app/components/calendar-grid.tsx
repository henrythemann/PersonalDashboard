import { useEffect } from "react";
import styles from '../page.module.css';
import { Event, Events } from '../interfaces';

/**
 * Renders a calendar grid component--the grid of days in a month.
 *  
 * @param {number} monthIndex - The index of the month (zero-indexed)
 * @param {number} year - The year
 * @param {string[]} dayNames - An array of day names
 * @param {Function} toggleEventPopup - A function to toggle the event popup.
 * @param {Event[]} eventData - An array of event data for the days in the grid.
 * @param {Function} setEventData - A function to set the event data.
 * @returns {JSX.Element} The calendar grid component.
 */
export default function CalendarGrid({monthIndex, year, dayNames, toggleEventPopup, eventData, setEventData}: {monthIndex: number, year: number, dayNames: string[], toggleEventPopup: Function, eventData: Event[], setEventData: Function}) {
    const date = new Date(year, monthIndex + 1, 0);
    const daysInMonth = date.getDate();
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
    let highlightDay =-1;
    const today = new Date();

    // If the active month and year are today's month and year, highlight the current day
    if (year === today.getFullYear() && monthIndex === today.getMonth()) {
      highlightDay = today.getDate();
    }
  
    // Fetch events for the active days in the grid (the current month and a few days on either side)
    useEffect(() => {
      async function fetchEvents() {
        let startUtcTimestamp = Date.UTC(year, monthIndex, 1) - firstDayOfWeek * 24 * 60 * 60 * 1000;
          try {
            const response = await fetch(`/api/events/get?start_time=${startUtcTimestamp}&end_time=${startUtcTimestamp + 42 * 24 * 60 * 60 * 1000}`);
            const data = await response.json();
            setEventData(data);
          } catch (error) {
            console.error('Error fetching events:', error);
          }
      }
      fetchEvents();
    }, [monthIndex]);
    
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
          
          // set the style and day number for each day in the grid so that the toggleEventPopup function can be called with the correct date
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
          // If there are events for the day, add them to the events object
          if (eventData.length) {
            for (let event of eventData) {
              if (event.start_time >= Date.UTC(yearOfDayNumber, monthOfDayNumber, dayNumber) && event.end_time < Date.UTC(yearOfDayNumber, monthOfDayNumber, dayNumber + 1) + today.getTimezoneOffset() * 60 * 1000) {
                events[yearOfDayNumber] ??= {};
                events[yearOfDayNumber][monthOfDayNumber] ??= {};
                events[yearOfDayNumber][monthOfDayNumber][dayNumber] ??= [];
                
                events[yearOfDayNumber][monthOfDayNumber][dayNumber].push(event);
              }
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