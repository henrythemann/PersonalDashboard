import styles from '../page.module.css'
import { useRef, useState, useEffect } from 'react';
import CalendarGrid from './calendar-grid';
import CalendarHeader from './calendar-header';
import EventPopup from './event-popup';
import { Event, SplitDate } from '../interfaces';

export default function Calendar() {
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
  
    async function createEvent(formData: {start_time: number, end_time: number, title: string, color: string}) {
        setIsEventPopupVisible(false);
        try {
            await fetch(`/api/events/add?start_time=${formData.start_time}&end_time=${formData.end_time}&title=${formData.title}&color=${formData.color ?? 'ffb300'}`)
            setEventData([...eventData, formData]);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }
  
    return (<>
      <div className={styles.calendarContainer} ref={(calendarContainer)}>
        <CalendarHeader month={month} monthIndex={monthIndex} year={year} isDatePopupVisible={isDatePopupVisible} setMonthIndex={setMonthIndex} setYear={setYear} setIsDatePopupVisible={setIsDatePopupVisible} titleButtonsRef={titleButtonsRef} setDatePopupContents={setDatePopupContents} calendarContainer={calendarContainer} lastDatePopupClicked={lastDatePopupClicked} monthButtonRef={monthButtonRef} yearButtonRef={yearButtonRef}/>
        <div className={styles.monthSelector}></div>
        <CalendarGrid monthIndex={monthIndex} year={year} dayNames={dayNames} toggleEventPopup={toggleEventPopup} eventData={eventData} setEventData={setEventData}/>    
      </div>
      {isDatePopupVisible && <DatePopup position={getDatePopupPosition()} />}
      {isEventPopupVisible && <EventPopup eventPopUpDate={eventPopUpDate} position={eventPopupPosition.current} handleSubmit={createEvent}/>}
    </>)
  }
  