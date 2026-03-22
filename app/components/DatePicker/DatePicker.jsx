"use client";

import useCalander from "@/app/store/calander";
import styles from "./DatePicker.module.css";

function shiftWeek(date, deltaDays) {
  const d = new Date(date);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

function DatePickerComponent() {
  const selectedDate = useCalander((state) => state.selectedDate);
  const setSelectedDate = useCalander((state) => state.setSelectedDate);

  const handleButtonClick = (direction) => {
    const delta = direction === "prev" ? -7 : 7;
    setSelectedDate(shiftWeek(selectedDate, delta));
  };

  return (
    <div className={styles.root} role="group" aria-label="주 이동">
      <button
        type="button"
        className={styles.button}
        onClick={() => handleButtonClick("prev")}
        aria-label="이전 주"
      >
        ‹
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => handleButtonClick("next")}
        aria-label="다음 주"
      >
        ›
      </button>
    </div>
  );
}

export default DatePickerComponent;
