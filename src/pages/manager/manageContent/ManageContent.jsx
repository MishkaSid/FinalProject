import React, { useState } from "react";
import styles from "../adminPages.module.css";

const mockData = [
  { id: 1, topic: "משוואות", level: "בינוני", type: "אמריקאית" },
  { id: 2, topic: "גאומטריה", level: "קשה", type: "אמריקאית" },
];

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

      <button className={styles.addButton}>➕ הוסף תוכן</button>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>נושא</th>
            <th>רמת קושי</th>
            <th>סוג שאלה</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td>{item.topic}</td>
              <td>{item.level}</td>
              <td>{item.type}</td>
              <td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
