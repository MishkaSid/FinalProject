
import React from "react";
import styles from "../adminPage.module.css";

export default function ManageContent() {
  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>ניהול תכנים</h1>
      <p className={styles.pageDescription}>
        הוסף, ערוך או מחק שאלות, נושאים וקטגוריות מהמערכת.
      </p>
      {/* Future: Add tabs, content filters, and editor modals */}
    </div>
  );
}
