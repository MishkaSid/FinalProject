import { useState, useEffect } from "react";
import styles from "../adminPages.module.css";
import Upload from "../../../components/upload/UploadStudentTable";
import axios from "axios";

export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    axios
      .get("/api/generalData/users")
      .then((res) => {
        const fetchedUsers = res.data[0] || []; // Ensure only users are set
        setUsers(fetchedUsers);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const filtered = Array.isArray(users)
    ? users.filter(
        (user) =>
          user &&
          (user.name || "").toLowerCase().includes((search || "").toLowerCase())
      )
    : [];
    
  return (
    <>
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
              <th>ת.ז</th>
              <th>שם משתמש</th>
              <th>תפקיד</th>
              <th>אימייל</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user,index) => (
              <tr key={index}>
                <td>{user.UserID}</td>
                <td>{user.Name}</td>
                <td>{user.Role || "---"}</td>
                <td>{user.Email}</td>
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
            {!filtered.length && (
              <tr className="noResults">
                <td colSpan="5">לא נמצאו משתמשים</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
