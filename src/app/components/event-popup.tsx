import styles from '../page.module.css'
import { RefObject, FormEvent, Fragment } from 'react';
import { SplitDate } from '../interfaces';

// TODO: add form validation on empty event names and end time before start time
export default function EventPopup({ position, handleSubmit, eventPopUpDate, passedRef }: {position: {x: number, y: number}, handleSubmit: Function, eventPopUpDate: RefObject<SplitDate>, passedRef: RefObject<HTMLFormElement>}) {
    const callAddEvent = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const today = new Date();
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
        if (eventPopUpDate && eventPopUpDate.current) {
            const startTime = Date.UTC(eventPopUpDate.current.year, eventPopUpDate.current.month, eventPopUpDate.current.day, startHour, startMin) + today.getTimezoneOffset() * 60 * 1000;
            const endTime = Date.UTC(eventPopUpDate.current.year, eventPopUpDate.current.month, eventPopUpDate.current.day, endHour, endMin) + today.getTimezoneOffset() * 60 * 1000;
            const eventData = {
                start_time: startTime,
                end_time: endTime,
                title: formData.get('eventTitle'),
                color: formData.get("colorSelectRadio")
            };
            handleSubmit(eventData);
        } else {
            console.error('Error adding event: eventPopUpDate.current is null');
        }
    };
    let colorArray = ["ffb300", "ff0000", "0000ff", "d90bd5", "0b8fd9", "d68a8a"];
  return (
    <form ref={passedRef} onSubmit={callAddEvent} className={styles.popupMenu} style={{ top: position.y, left: position.x }}>
        <input name="eventTitle" placeholder='Event Name'></input>
        <label>start time:</label>
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
        <label>end time:</label>
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
        <label>color:</label>
        <div className={styles.colorSelectContainer}>
        {[...colorArray].map((color, i) => {return (<Fragment key={i}>
            <div className={styles.colorSelectItem}>
                <input name="colorSelectRadio" type="radio" value={color}></input>
                <span style={{backgroundColor: "#"+color}}></span>
            </div>
        </Fragment>)})}
        </div>
        <input type="submit" className={styles.monthSelectorItem} value="Add Event"></input>
    </form>
  );
};