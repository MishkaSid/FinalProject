import { useState, useEffect } from "react";
import styles from "../adminPages.module.css";
import Upload from "../../../components/upload/UploadStudentTable";
import axios from "axios";
import Popup from "../../../components/popup/Popup";
import UserForm from "../../../components/form/UserForm";

/**
 * @component UserPermissions
 * @description A page for managing user permissions. It displays a list of users that can be
 * searched and filtered by role. It provides functionality to add, edit, and delete users
 * through popups and forms. It also handles user confirmation for destructive actions like deletion.
 * @returns {JSX.Element} The rendered user permissions page.
 */
export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    UserID: "",
    Name: "",
    Email: "",
    Password: "",
    Role: "Examinee",
    CourseID: null,
  });
  const [popupConfig, setPopupConfig] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [originalId, setOriginalId] = useState(null);

  /**
   * @effect
   * @description Fetches all users from the server when the component mounts.
   */
  useEffect(() => {
    // Test backend connectivity first
    console.log("Testing backend connectivity...");
    axios
      .get("/api/general/users")
      .then((res) => {
        console.log("Backend response:", res.data);
        const fetchedUsers = res.data[0] || [];
        setUsers(fetchedUsers);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        console.error("Error details:", err.response?.data);
      });
  }, []);

  // Filter users based on the search input (name or ID).
  const filtered = Array.isArray(users)
    ? users.filter(
        (user) =>
          user &&
          ((user.Name || "")
            .toLowerCase()
            .includes((search || "").toLowerCase()) ||
            (user.UserID?.toString() || "").includes(search || ""))
      )
    : [];

  // Further filter users based on the selected role.
  const filteredByRole = filtered.filter((user) => {
    if (selectedRole === "") return true;
    if (selectedRole === "All") return true;
    return user.Role === selectedRole;
  });

  const roles = ["All", "Admin", "Teacher", "Examinee"];
  const roleOptions = roles.map((role) => (
    <option key={role} value={role}>
      {role}
    </option>
  ));

  /**
   * @function handleDeleteUser
   * @description Opens a confirmation popup before deleting a user. If the user confirms,
   * it sends a delete request to the server and removes the user from the local state.
   * @param {number} id - The ID of the user to delete.
   */
  function handleDeleteUser(id) {
    setPopupConfig({
      title: "האם אתה בטוח?",
      message: "מחיקת משתמש תמחק את כל הנתונים שלו",
      confirmLabel: "כן, מחק",
      cancelLabel: "ביטול",
      onConfirm: () => {
        axios
          .delete(`/api/user/deleteUser/${id}`)
          .then(() => {
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.UserID !== id)
            );
            setPopupConfig(null);
          })
          .catch((err) => {
            console.error("Error deleting user:", err);
            setPopupConfig(null);
          });
      },
    });
  }

  /**
   * @function handleAddUser
   * @description Opens the user form in 'add' mode, clearing any previous form data.
   */
  function handleAddUser() {
    setFormData({
      UserID: "",
      Name: "",
      Email: "",
      Password: "", // Will be auto-reset to ID for Examinee users
      Role: "Examinee",
      CourseID: null,
    });
    setIsEditMode(false);
    setIsFormOpen(true);
  }

  /**
   * @function handleEditUser
   * @description Opens the user form in 'edit' mode, populating it with the data of the selected user.
   * @param {object} user - The user object to be edited.
   */
  function handleEditUser(user) {
    const { Password, ...rest } = user;
    setFormData({ ...rest });
    setOriginalId(user.UserID);
    setIsEditMode(true);
    setIsFormOpen(true);
  }

  /**
   * @function refreshUsers
   * @description Refreshes the users list by fetching the latest data from the server.
   * This is called after bulk uploads to ensure the table shows the most up-to-date information.
   */
  function refreshUsers() {
    axios
      .get("/api/general/users")
      .then((res) => {
        const fetchedUsers = res.data[0] || [];
        setUsers(fetchedUsers);
      })
      .catch((err) => console.error("Error refreshing users:", err));
  }

  /**
   * @function handleSubmitUser
   * @description Handles the submission of the user form (for both adding and editing).
   * It performs client-side validation before sending the data to the server.
   * On success, it updates the local user state. It also handles specific backend
   * error messages by displaying them in a popup.
   * @param {object} values - The form values.
   */
  function handleSubmitUser(values) {
    const { UserID, Name, Password, Role, Email } = values;

    const idIsValid = /^\d{9}$/.test(UserID);
    const nameIsValid = /^[A-Za-z\u0590-\u05FF\s]{2,}$/.test(Name);

    // For Examinee users, password is optional (will be auto-reset to ID in backend)
    const passwordIsValid =
      Role === "Examinee"
        ? true
        : /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,10}$/.test(Password);

    if (!idIsValid) {
      setPopupConfig({
        title: "שגיאה",
        message: "תעודת זהות חייבת להכיל בדיוק 9 ספרות.",
        confirmLabel: "סגור",
        onConfirm: () => setPopupConfig(null),
      });
      return;
    }

    if (!nameIsValid) {
      setPopupConfig({
        title: "שגיאה",
        message: "השם חייב להכיל לפחות שני תווים, ורק אותיות ורווחים.",
        confirmLabel: "סגור",
        onConfirm: () => setPopupConfig(null),
      });
      return;
    }

    // Skip password validation for Examinee users (password is auto-reset to ID in backend)
    if (!isEditMode && !passwordIsValid && values.Role !== "Examinee") {
      setPopupConfig({
        title: "שגיאה",
        message:
          "הסיסמה חייבת להכיל לפחות אות אחת, מספר אחד, ואורכה בין 3 ל-8 תווים.",
        confirmLabel: "סגור",
        onConfirm: () => setPopupConfig(null),
      });
      return;
    }

    const endpoint = isEditMode
      ? `/api/user/updateUser/${originalId}`
      : "/api/user/addUser";

    const axiosMethod = isEditMode ? axios.put : axios.post;

    // Debug: Log what we're sending
    console.log("Sending user data:", values);
    console.log("Endpoint:", endpoint);

    // Ensure all required fields are present
    const userData = {
      UserID: values.UserID,
      Name: values.Name,
      Email: values.Email,
      Password: values.Password || "", // Ensure password is never undefined
      Role: values.Role,
      CourseID: values.CourseID || null,
    };

    console.log("Processed user data:", userData);

    axiosMethod(endpoint, userData)
      .then((res) => {
        if (isEditMode) {
          setUsers((prev) =>
            prev.map((u) => (u.UserID === originalId ? values : u))
          );
        } else {
          setUsers((prev) => [...prev, values]);
          setPopupConfig({
            title: "הצלחה",
            message: "המשתמש נוסף בהצלחה!",
            confirmLabel: "סגור",
            onConfirm: () => setPopupConfig(null),
          });
        }
        setIsFormOpen(false);
      })
      .catch((err) => {
        const backendMsg = err.response?.data?.error;
        if (
          err.response?.status === 400 &&
          (backendMsg === "משתמש זה כבר קיים" ||
            backendMsg === "אימייל זה כבר קיים" ||
            backendMsg === "תעודת זהות זו כבר קיימת")
        ) {
          setPopupConfig({
            title: "שגיאה",
            message: backendMsg,
            confirmLabel: "סגור",
            onConfirm: () => setPopupConfig(null),
          });
        } else {
          console.error("Error saving user:", err);
          setIsFormOpen(false);
        }
      });
  }

  return (
    <>
      <div className={styles.adminPage}>
        <h1 className={styles.pageTitle}>ניהול הרשאות</h1>
        {/* Search input */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder="חפש משתמש לפי שם או ת.ז..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Adding line */}
        <div className={styles.addingLine}>
          <button className={styles.addButton} onClick={handleAddUser}>
            הוסף משתמש
          </button>
          <Upload onUsersAdded={refreshUsers} />
          <div className={styles.sort}>
            <select
              id="role-select"
              className={styles.input}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="" disabled hidden>
                בחר תפקיד
              </option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "הצג הכל" : role}
                </option>
              ))}
            </select>
          </div>
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
            {filteredByRole.map((user, index) => (
              <tr key={index}>
                <td>{user.UserID}</td>
                <td>{user.Name}</td>
                <td>{user.Role || "---"}</td>
                <td>{user.Email}</td>
                <td>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleEditUser(user)}
                  >
                    ערוך ✏️
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteUser(user.UserID)}
                  >
                    מחק 🗑️
                  </button>
                </td>
              </tr>
            ))}
            {!filteredByRole.length && (
              <tr className="noResults">
                <td colSpan="5">לא נמצאו משתמשים</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <Popup isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <UserForm
            mode={isEditMode ? "edit" : "add"}
            initialValues={formData}
            onSubmit={handleSubmitUser}
            onValidationError={(msg) =>
              setPopupConfig({
                title: "שגיאה",
                message: msg,
                confirmLabel: "סגור",
                onConfirm: () => setPopupConfig(null),
              })
            }
          />
          {isEditMode && (
            <div className={styles.note}>
              <p>שינוי סיסמה יתבצע ממסך נפרד או בהרשמה מחדש בלבד.</p>
            </div>
          )}
        </Popup>
      )}
      {popupConfig && (
        <Popup
          header={popupConfig.title}
          text={popupConfig.message}
          isOpen={true}
          onClose={() => setPopupConfig(null)}
        >
          <button onClick={popupConfig.onConfirm}>
            {popupConfig.confirmLabel}
          </button>
        </Popup>
      )}
    </>
  );
}