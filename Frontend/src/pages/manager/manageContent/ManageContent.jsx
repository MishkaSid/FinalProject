import React, { useState } from "react";
import styles from "../adminPages.module.css";

const mockData = [
  { id: 1, topic: "משוואות", level: "בינוני", type: "אמריקאית" },
  { id: 2, topic: "גאומטריה", level: "קשה", type: "אמריקאית" },
];

/**
 * The ManageContent component renders the main page for managing content.
 * It contains a search bar and a table of content items. The table is
 * filtered based on the search input. The table has four columns: topic,
 * level, type and actions. The actions column contains two buttons: edit
 * and delete. The edit button navigates to the edit page, and the delete
 * button opens a confirmation dialog.
 *
 * @returns {JSX.Element} The rendered ManageContent component.
 */

export default function ManageContent() {
  const [search, setSearch] = useState("");

  const filtered = mockData.filter((item) => item.topic.includes(search));

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>ניהול תכנים</h1>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="חפש שאלה או נושא..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles.addingLine}>
        <button className={styles.addButton}>הוסף תוכן</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>נושא</th>
            <th>רמת קושי</th>
            <th>סוג שאלה</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td>{item.topic}</td>
              <td>{item.level}</td>
              <td>{item.type}</td>
              <td>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                >
                  ✏️ ערוך
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  🗑️ מחק
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
