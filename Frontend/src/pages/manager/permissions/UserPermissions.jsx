import React, { useState, useEffect } from "react";
import styles from "../adminPages.module.css";
import Upload from "../../../components/upload/UploadStudentTable";
import Sidebar from "../../../components/sidebar/Sidebar";
import axios from "axios";

export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("/api/users")
      .then((res) => {
        console.log("Fetched users:", res.data);
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const filtered = Array.isArray(users)
    ? users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <>
      <Sidebar userType="admin" />
      <div className={styles.adminPage}>
        <h1 className={styles.pageTitle}>ניהול הרשאות</h1>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="חפש משתמש לפי שם..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.addingLine}>
          <button className={styles.addButton}>הוסף משתמש</button>
          <Upload />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>תפקיד</th>
              <th>הרשאה</th>
              <th>אימייל</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.access || "---"}</td>
                <td>{user.email}</td>
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
    </>
  );
}
