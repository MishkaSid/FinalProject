import React, { useState } from "react";
import styles from "../adminPages.module.css";
import Upload from "../../../components/upload/UploadStudentTable";

// Example user permissions data
const mockPermissions = [
  { id: 1, name: "יוסי כהן", role: "תלמיד", access: "קריאה בלבד" },
  { id: 2, name: "רות לוי", role: "מורה", access: "עריכה מלאה" },
  { id: 3, name: "יוסי כהן", role: "תלמיד", access: "קריאה בלבד" },
  { id: 4, name: "רות לוי", role: "מורה", access: "עריכה מלאה" },
  { id: 5, name: "יוסי כהן", role: "תלמיד", access: "קריאה בלבד" },
];

/**
 * The UserPermissions component renders a user interface for managing user permissions.
 * It includes a search bar to filter the list of users by name, a table displaying user
 * information such as name, role, and access level, and actions to edit or delete users.
 * Additionally, it provides a button to add new users and an upload component for bulk
 * user uploads.
 *
 * @returns {JSX.Element} The rendered UserPermissions component.
 */

export default function UserPermissions() {
  const [search, setSearch] = useState("");

  const filtered = mockPermissions.filter((user) => user.name.includes(search));

  return (
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
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.access}</td>
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
