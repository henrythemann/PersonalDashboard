import styles from '../page.module.css'
import { useRef, useState, useEffect } from 'react';
import CalendarGrid from './calendar-grid';
import CalendarHeader from './calendar-header';
import EventPopup from './event-popup';
import { Event, SplitDate } from '../interfaces';

/**
 * Renders a calendar component--the entire calendar.
 * 
 * @returns {JSX.Element} The calendar component.
 */
export default function Calendar() {
    // State for managing the current date, month, and year
    const today = new Date();
    const [monthIndex, setMonthIndex] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    // Array of month and day names for display
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[monthIndex];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // State for managing visibility and content of date popups
    const [isDatePopupVisible, setIsDatePopupVisible] = useState(false);
    const [datePopupContents, setDatePopupContents] = useState('');

    // Refs for various UI elements
    const titleButtonsRef = useRef<HTMLDivElement | null>(null);
    const datePopupRef = useRef<HTMLDivElement | null>(null);
    const eventPopupRef = useRef<HTMLFormElement | null>(null);

    // State for managing the range of years in the year popup
    const [yearRange, setYearRange] = useState({ start: today.getFullYear() - 10, end: today.getFullYear() + 10 });
    const calendarContainer = useRef<HTMLDivElement | null>(null);

    // State and ref for event popup management
    const [isEventPopupVisible, setIsEventPopupVisible] = useState(false);
    const eventPopupPosition = useRef({ x: 0, y: 0 });
    const lastDatePopupClicked = useRef<HTMLButtonElement | null>(null);
    const yearButtonRef = useRef<HTMLButtonElement | null>(null);
    const monthButtonRef = useRef<HTMLButtonElement | null>(null);
    const eventPopupDate = useRef<SplitDate>({ day: 0, month: 0, year: 0 });

    // State for storing event data
    const [eventData, setEventData] = useState<Event[]>([]);

    // Function to load more years into the year popup
    const handleYearLoad = (loadFutureYears: boolean) => {
        setYearRange(prev => ({ start: prev.start + (loadFutureYears ? 10 : -10), end: prev.end + (loadFutureYears ? 10 : -10) }));
    };

    // DatePopup component for selecting months and years
    const DatePopup = ({ position }: { position: { top: number, left: number, width: number } }) => {
        return (
            <>
                <div className={[styles.popupMenu, datePopupContents == 'year' ? styles.yearSelector : ''].join(' ')} ref={datePopupRef} style={{ top: position.top, left: position.left, minWidth: position.width }}>
                    {/* Month selector buttons */}
                    {isDatePopupVisible && datePopupContents == 'month' && monthNames.map((month, i) => (
                        <button key={i} className={styles.monthSelectorItem} onClick={() => {
                            setMonthIndex(i);
                            setIsDatePopupVisible(false);
                        }}>{month}</button>
                    ))}
                    {/* Year selector buttons */}
                    {isDatePopupVisible && datePopupContents == 'year' && (
                        <>
                            <button className={styles.yearLoadButton} onClick={() => handleYearLoad(false)}>↑</button>
                            {Array.from({ length: yearRange.end - yearRange.start + 1 }, (_, i) => {
                                const year = i + yearRange.start;
                                return <button key={i} className={styles.monthSelectorItem} onClick={() => {
                                    setYear(year);
                                    setIsDatePopupVisible(false);
                                }}>{year}</button>
                            })}
                            <button className={styles.yearLoadButton} onClick={() => handleYearLoad(true)}>↓</button>
                        </>
                    )}
                </div>
            </>
        );
    };

    // Function to calculate the position of the date popup
    const getDatePopupPosition = () => {
        if (titleButtonsRef.current === null) return { top: 0, left: 0, width: 0 };
        const rect = titleButtonsRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    };

    // Effect to handle closing popups when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDatePopupVisible && datePopupRef.current && !datePopupRef.current.contains(event.target as Node) && lastDatePopupClicked.current && !lastDatePopupClicked.current.contains(event.target as Node)) {
                setIsDatePopupVisible(false);
            }
            if (isEventPopupVisible && eventPopupRef.current && !eventPopupRef.current.contains(event.target as Node)) {
                setIsEventPopupVisible(false);
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDatePopupVisible(false);
                setIsEventPopupVisible(false);
            }
        };
        if (isDatePopupVisible || isEventPopupVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keyup', handleKeyUp);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [isDatePopupVisible, isEventPopupVisible]);

    // Function to toggle the visibility and set the position of the event popup
    const toggleEventPopup = (day: number, month: number, year: number, event: { clientX: number, clientY: number }) => {
        setIsEventPopupVisible(!isEventPopupVisible);
        eventPopupDate.current.day = day;
        eventPopupDate.current.month = month;
        eventPopupDate.current.year = year;
        eventPopupPosition.current.x = event.clientX;
        eventPopupPosition.current.y = event.clientY;
    }

    // Function to create a new event
    async function createEvent(formData: { start_time: number, end_time: number, title: string, color: string }) {
        setIsEventPopupVisible(false);
        try {
            await fetch(`/api/events/add?start_time=${formData.start_time}&end_time=${formData.end_time}&title=${formData.title}&color=${formData.color ?? 'ffb300'}`);
            setEventData([...eventData, formData]);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }

    // Rendering the calendar with its components  
    return (<>
      <div className={styles.calendarContainer} ref={(calendarContainer)}>
        <CalendarHeader month={month} monthIndex={monthIndex} year={year} isDatePopupVisible={isDatePopupVisible} setMonthIndex={setMonthIndex} setYear={setYear} setIsDatePopupVisible={setIsDatePopupVisible} titleButtonsRef={titleButtonsRef} setDatePopupContents={setDatePopupContents} calendarContainer={calendarContainer} lastDatePopupClicked={lastDatePopupClicked} monthButtonRef={monthButtonRef} yearButtonRef={yearButtonRef}/>
        <div className={styles.monthSelector}></div>
        <CalendarGrid monthIndex={monthIndex} year={year} dayNames={dayNames} toggleEventPopup={toggleEventPopup} eventData={eventData} setEventData={setEventData}/>    
      </div>
      {isDatePopupVisible && <DatePopup position={getDatePopupPosition()} />}
      {isEventPopupVisible && <EventPopup passedRef={eventPopupRef} eventPopUpDate={eventPopupDate} position={eventPopupPosition.current} handleSubmit={createEvent}/>}
    </>)
  }
  