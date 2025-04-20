
import React from "react";
import styles from "../adminPage.module.css";
import Sidebar from "../../../components/sidebar/Sidebar";

export default function UploadStudentTable() {
  return (
    <div className={styles.adminPage}>
      <Sidebar />
      <h1 className={styles.pageTitle}>העלאת טבלת תלמידים</h1>
      <p className={styles.pageDescription}>
        בחר קובץ CSV או Excel עם רשימת תלמידים לייבוא.
      </p>
      <input type="file" accept=".xlsx" />
      {/* Future: Show preview, validation messages, and upload status */}
    </div>
  );
}
