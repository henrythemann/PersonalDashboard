import { useState, Ref, RefObject } from "react";
import styles from '../page.module.css';
import useDraggable from '../hooks/useDraggable';

export default function CalendarHeader({month, monthIndex, year, isDatePopupVisible, setMonthIndex, setYear, setIsDatePopupVisible, titleButtonsRef, setDatePopupContents, calendarContainer, lastDatePopupClicked, monthButtonRef, yearButtonRef}: { monthIndex: number, month: string, year: number, isDatePopupVisible: boolean, setMonthIndex: Function, setYear: Function, setIsDatePopupVisible: Function, titleButtonsRef: Ref<HTMLDivElement>, setDatePopupContents: Function, calendarContainer: RefObject<HTMLDivElement>, lastDatePopupClicked: RefObject<HTMLButtonElement>, monthButtonRef: RefObject<HTMLButtonElement>, yearButtonRef: RefObject<HTMLButtonElement>}) {
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