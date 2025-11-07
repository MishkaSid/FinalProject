// בקובץ זה נמצא רכיב הטופס הכללי למשתמשים במערכת
// הקובץ מספק טופס רב-שימושי להתחברות, הוספה ועריכת משתמשים
// הוא כולל ולידציה מתקדמת ותמיכה במצבים שונים של הטופס
import React, { useState } from "react";
import styles from "./form.module.css";
import Popup from "../popup/Popup";

const FIELD_CONFIG = {
  UserID: { label: "ת.ז", type: "text" },
  Name: { label: "שם", type: "text" },
  Email: { label: "אימייל", type: "email" },
  Password: { label: "סיסמה (אופציונלי לסטודנטים)", type: "password" },
  NewPassword: { label: "שנה סיסמה", type: "password" }, // Special field for edit mode
  Role: {
    label: "תפקיד",
    type: "select",
    options: ["Admin", "Teacher", "Examinee"],
  },
  CourseID: {
    label: "קורס",
    type: "course-select", // Special type for course selection
  },
  expired_date: { label: "תאריך תפוגה", type: "date" },
};

const MODE_FIELDS = {
  login: ["Email", "Password"],
  add: ["UserID", "Name", "Email", "Password", "Role", "CourseID", "expired_date"],
  edit: ["UserID", "Name", "Email", "NewPassword", "Role", "CourseID", "expired_date"], // NewPassword shown in edit
};

/**
 * @function validate
 * @description Validates the form values based on the fields required for the current mode.
 * It checks for specific formats (UserID, Name, Email, Password) and ensures that all required fields are filled.
 * @param {Array<string>} fields - An array of field names to validate.
 * @param {object} values - An object containing the current form values.
 * @param {string} mode - The current form mode ('login', 'add', or 'edit').
 * @returns {string|null} An error message string if validation fails, or null if it succeeds.
 */
function validate(fields, values, mode) {
  // Returns error message string or null
  if (fields.includes("UserID")) {
    if (!/^\d{9}$/.test(values.UserID || "")) {
      return "תעודת זהות חייבת להכיל בדיוק 9 ספרות.";
    }
  }
  if (fields.includes("Name")) {
    if (!/^[A-Za-z\u0590-\u05FF\s]{2,}$/.test(values.Name || "")) {
      return "השם חייב להכיל לפחות שני תווים, ורק אותיות ורווחים.";
    }
  }
  if (fields.includes("Email")) {
    if (!/^\S+@\S+\.\S+$/.test(values.Email || "")) {
      return "יש להזין כתובת אימייל תקינה.";
    }
  }
  if (fields.includes("expired_date")) {
    if (!values.expired_date) {
      return "יש לבחור תאריך תפוגה.";
    }
    // Validate that the date is not in the past
    const selectedDate = new Date(values.expired_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    if (selectedDate < today) {
      return "תאריך התפוגה לא יכול להיות בעבר.";
    }
  }
  if (fields.includes("Password") && mode !== "edit") {
    // Skip password validation for Examinee users (password is auto-reset to ID in backend)
    if (
      values.Role !== "Examinee" &&
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/.test(values.Password || "")
    ) {
      return "הסיסמה חייבת להכיל לפחות אות אחת, מספר אחד, ואורכה בין 3 ל-8 תווים.";
    }
  }
  // Validate NewPassword in edit mode (optional, but if provided must be valid)
  if (fields.includes("NewPassword") && mode === "edit" && values.NewPassword) {
    if (
      values.Role !== "Examinee" &&
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/.test(values.NewPassword || "")
    ) {
      return "הסיסמה חייבת להכיל לפחות אות אחת, מספר אחד, ואורכה בין 3 ל-8 תווים.";
    }
  }
  // All required fields must be filled (except password for Examinee users, NewPassword which is optional, and expired_date which is validated above)
  for (const field of fields) {
    if (field === "Password" && values.Role === "Examinee") {
      continue; // Skip password validation for Examinee users
    }
    if (field === "NewPassword") {
      continue; // NewPassword is optional in edit mode
    }
    if (field === "expired_date") {
      continue; // expired_date validation is handled above
    }
    if (!values[field]) {
      return `יש למלא את שדה ${FIELD_CONFIG[field].label}`;
    }
  }
  return null;
}

/**
 * @component UserForm
 * @description A reusable form for user-related actions like login, adding a new user, or editing an existing one.
 * The form's fields, validation logic, and submit button text change based on the 'mode' prop.
 * It uses a shared `FIELD_CONFIG` for field properties and `MODE_FIELDS` to determine which fields are visible.
 * It has its own validation and can display error messages in a popup.
 * @param {object} props - The component props.
 * @param {string} [props.mode='login'] - The mode of the form, can be 'login', 'add', or 'edit'.
 * @param {object} [props.initialValues={}] - The initial values for the form fields.
 * @param {Function} props.onSubmit - The function to call when the form is submitted successfully.
 * @param {Function} [props.onValidationError] - An optional callback to handle validation errors. If not provided, a default popup is used.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the form element.
 * @returns {JSX.Element} The rendered user form component.
 */
export default function UserForm({
  mode = "login",
  initialValues = {},
  onSubmit,
  onValidationError,
  className = "",
  courses = [], // Available courses from parent
  onCreateCourse, // Callback to create new course
}) {
  const [values, setValues] = useState({
    UserID: initialValues.UserID || "",
    Name: initialValues.Name || "",
    Email: initialValues.Email || "",
    Password: initialValues.Password || "",
    NewPassword: "", // Separate field for password change in edit mode
    Role: initialValues.Role || "Examinee",
    CourseID: initialValues.CourseID || "",
    expired_date: initialValues.expired_date || "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");



  const fields = MODE_FIELDS[mode];

  /**
   * @function handleChange
   * @description A generic change handler for all form inputs. It updates the component's 'values' state
   * with the new value of the input that triggered the event.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * @function handleSubmit
   * @description Handles the form submission. It first validates the form values based on the current mode.
   * If validation fails, it either calls the `onValidationError` prop or shows a popup with the error.
   * If validation succeeds, it calls the `onSubmit` prop with the form values.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with values:", values);
    console.log("Form mode:", mode);
    console.log("Form fields:", fields);

    const error = validate(fields, values, mode);
    if (error) {
      console.log("Validation error:", error);
      if (onValidationError) {
        onValidationError(error);
      } else {
        setPopupMsg(error);
        setShowPopup(true);
      }
      return;
    }

    console.log("Validation passed, calling onSubmit with:", values);

    // For login, only send Email and Password
    if (mode === "login") {
      onSubmit({ email: values.Email, password: values.Password });
    } else if (mode === "edit") {
      // In edit mode, send NewPassword as Password if provided, otherwise don't send password field
      const submitValues = { ...values };
      if (submitValues.NewPassword && submitValues.NewPassword.trim() !== "") {
        submitValues.Password = submitValues.NewPassword;
      } else {
        delete submitValues.Password; // Don't send password if not provided
      }
      delete submitValues.NewPassword; // Remove NewPassword from submission
      onSubmit(submitValues);
    } else {
      onSubmit(values);
    }
  };

  /**
   * @function handleCreateNewCourse
   * @description Handles creating a new course
   */
  const handleCreateNewCourse = async () => {
    if (!newCourseName.trim()) {
      setPopupMsg("יש להזין שם קורס");
      setShowPopup(true);
      return;
    }
    
    if (onCreateCourse) {
      const newCourse = await onCreateCourse(newCourseName);
      if (newCourse) {
        setValues((prev) => ({ ...prev, CourseID: newCourse.CourseID }));
        setShowNewCourseInput(false);
        setNewCourseName("");
      }
    }
  };

  return (
    <>
      <form className={`${styles.form} ${className}`} onSubmit={handleSubmit}>
        {fields.map((field) => {
          const config = FIELD_CONFIG[field];
          
          // Special handling for course selection
          if (config.type === "course-select") {
            return (
              <div className={styles.inputContainer} key={field}>
                <label className={styles.label}>{config.label}</label>
                {!showNewCourseInput ? (
                  <>
                    <select
                      className={styles.input}
                      name={field}
                      value={values[field]}
                      onChange={handleChange}
                      required
                    >
                      <option value="">בחר קורס</option>
                      {courses.map((course) => (
                        <option key={course.CourseID} value={course.CourseID}>
                          {course.CourseName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCourseInput(true)}
                      style={{ marginTop: "0.5rem" , color:'white !important', marginInline:'auto'}}
                    >
                      + צור קורס חדש
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column",width:'100%' }}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="שם הקורס החדש"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleCreateNewCourse}
                      >
                        שמור קורס
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                          setShowNewCourseInput(false);
                          setNewCourseName("");
                        }}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          
          if (config.type === "select") {
            return (
              <div className={styles.inputContainer} key={field}>
                <label className={styles.label}>{config.label}</label>
                <select
                  className={styles.input}
                  name={field}
                  value={values[field]}
                  onChange={handleChange}
                >
                  {config.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return (
            <div className={styles.inputContainer} key={field}>
              <label className={styles.label}>{config.label}</label>
              <input
                className={styles.input}
                type={config.type}
                name={field}
                value={values[field]}
                onChange={handleChange}
                autoComplete={
                  field === "Password" ? "current-password" : 
                  field === "NewPassword" ? "new-password" : 
                  undefined
                }
                min={field === "expired_date" ? new Date().toISOString().split('T')[0] : undefined}
              />
            </div>
          );
        })}
        <button className={styles.submitButton} type="submit">
          {mode === "login" ? "התחבר" : mode === "add" ? "הוסף" : "שמור"}
        </button>

        {/* Show note for Examinee users */}
        {mode === "add" && values.Role === "Examinee" && (
          <div className={styles.studentNote}>
          <strong>הערה:</strong>
          <span>עבור סטודנטים, הסיסמה תותאם אוטומטית למספר תעודת הזהות</span>
        </div>
        )}
      </form>
      <Popup
        header="שגיאה"
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      >
        <div style={{ color: "black" }}>{popupMsg}</div>
      </Popup>
    </>
  );
}
