import { useState, Ref, RefObject } from "react";
import styles from '../page.module.css';
import useDraggable from '../hooks/useDraggable';

/**
 * Renders a calendar header component--the top part of the calendar with the month and year and navigation buttons.
 * 
 * @param {string} month - The name of the active month
 * @param {number} monthIndex - The index of the active month (zero-indexed)
 * @param {number} year - The active year
 * @param {boolean} isDatePopupVisible - Whether the date popup is visible
 * @param {Function} setMonthIndex - A function to set the month index
 * @param {Function} setYear - A function to set the year
 * @param {Function} setIsDatePopupVisible - A function to set the visibility of the date popup
 * @param {Ref} titleButtonsRef - A ref to the title buttons
 * @param {Function} setDatePopupContents - A function to set the contents of the date popup
 * @param {RefObject} calendarContainer - A ref to the calendar container
 * @param {RefObject} lastDatePopupClicked - A ref to the last date popup button clicked
 * @param {RefObject} monthButtonRef - A ref to the month button
 * @param {RefObject} yearButtonRef - A ref to the year button
 * @returns {JSX.Element} The calendar header component.
 */
export default function CalendarHeader({month, monthIndex, year, isDatePopupVisible, setMonthIndex, setYear, setIsDatePopupVisible, titleButtonsRef, setDatePopupContents, calendarContainer, lastDatePopupClicked, monthButtonRef, yearButtonRef}: { monthIndex: number, month: string, year: number, isDatePopupVisible: boolean, setMonthIndex: Function, setYear: Function, setIsDatePopupVisible: Function, titleButtonsRef: Ref<HTMLDivElement>, setDatePopupContents: Function, calendarContainer: RefObject<HTMLDivElement>, lastDatePopupClicked: RefObject<HTMLButtonElement>, monthButtonRef: RefObject<HTMLButtonElement>, yearButtonRef: RefObject<HTMLButtonElement>}) {
    // State for tracking the calendar's drag movement
    const [movingCalendar, setMovingCalendar] = useState({moving: false, Xoffset: 0, Yoffset: 0});
  
    // Function to navigate between months
    const changeMonth = (forward: boolean) => {
      if (monthIndex === (forward ? 11 : 0)) {
        setMonthIndex(forward ? 0 : 11);
        setYear(year + (forward ? 1 : -1));
      } else {
        setMonthIndex(monthIndex + (forward ? 1 : -1));
      }
    };
    
    // Function to toggle visibility of the date popup
    const toggleDatePopup = (popupContents: string, buttonRef: React.RefObject<HTMLButtonElement>) => {
      // If the popup is not currently visible, keep track of the last button clicked
      if (!isDatePopupVisible && lastDatePopupClicked !== null) {
        (lastDatePopupClicked as any).current = buttonRef.current;
      }
      // Toggle the visibility of the date popup and set its contents
      setIsDatePopupVisible(!isDatePopupVisible);
      setDatePopupContents(popupContents);
    };
  
    // Custom hook to enable the ability to drag and move the calendar
    useDraggable(calendarContainer, movingCalendar, setMovingCalendar, styles.calendarHeader, styles.titleButton);
    
    // Render the calendar header
    return (<>
      <div className={styles.calendarHeader}>
        <button className={[styles.monthNavigation, styles.backButton].join(' ')} onClick={() => changeMonth(false)}>&#60;</button>
        <button className={[styles.monthNavigation, styles.nextButton].join(' ')} onClick={() => changeMonth(true)}>&#62;</button>
        <div className={styles.calendarTitle} ref={titleButtonsRef}>
          <button className={[styles.calendarMonth, styles.titleButton].join(' ')} ref={monthButtonRef} onClick={() => toggleDatePopup('month', monthButtonRef)}>{month}</button>
          <span> </span>
          <button className={[styles.calendarYear, styles.titleButton].join(' ')} ref={yearButtonRef} onClick={() => toggleDatePopup('year', yearButtonRef)}>{year}</button>
        </div>
      </div>
      </>);
  }