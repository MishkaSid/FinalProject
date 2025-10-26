// Frontend/src/components/analytics/DateRangeSelector.jsx
import React from "react";
import styles from "../../pages/manager/home/manager.module.css";
import { getLast30DaysRange } from "../../utils/dateUtils";

/**
 * @component DateRangeSelector
 * @description A reusable component for selecting date ranges with quick action buttons
 * @param {object} props - The component props
 * @param {string} props.from - The "from" date value (YYYY-MM-DD)
 * @param {string} props.to - The "to" date value (YYYY-MM-DD)
 * @param {Function} props.onFromChange - Callback when "from" date changes
 * @param {Function} props.onToChange - Callback when "to" date changes
 * @returns {JSX.Element} The rendered date range selector
 */
export default function DateRangeSelector({ from, to, onFromChange, onToChange }) {
  const handleLast30Days = () => {
    const { from: fromDate, to: toDate } = getLast30DaysRange();
    onFromChange(fromDate);
    onToChange(toDate);
  };

  const handleClear = () => {
    onFromChange("");
    onToChange("");
  };

  return (
    <div className={styles.cardControls}>
      <div className={styles.controlRow}>
        <label className={styles.controlLabel}>מתאריך</label>
        <input
          type="date"
          className={styles.controlInput}
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          style={{ maxWidth: '200px' }}
        />
        <label className={styles.controlLabel}>עד תאריך</label>
        <input
          type="date"
          className={styles.controlInput}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          style={{ maxWidth: '200px' }}
        />
        <div className={styles.buttonRow} style={{ marginTop: 0, marginRight: 'auto' }}>
          <button className={styles.smallButton} onClick={handleLast30Days}>
            30 יום אחרונים
          </button>
          <button className={`${styles.smallButton} ${styles.secondary}`} onClick={handleClear}>
            נקה
          </button>
        </div>
      </div>
    </div>
  );
}
