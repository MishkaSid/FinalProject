
import React from "react";
import styles from "../adminPages.module.css";

export default function UserPermissions() {
  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>הרשאות משתמשים</h1>
      <p className={styles.pageDescription}>
        כאן תוכל להקצות או להסיר הרשאות ממשתמשים קיימים במערכת.
      </p>
      {/* Future: Add user list, permission checkboxes, and save functionality */}
    </div>
  );
}
