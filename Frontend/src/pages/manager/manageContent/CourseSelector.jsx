// בקובץ זה נמצא רכיב בחירת הקורסים במערכת
// הקובץ מספק ממשק לבחירת קורסים, הוספת קורסים חדשים ומחיקת קורסים קיימים
// הוא מאפשר הוספת נושאים לקורס נבחר ומציג כפתורי פעולה שונים לפי המצב
// הוא משמש ככלי ניהול מרכזי עבור מנהלים ומורים לניהול קורסים ונושאים

// Frontend/src/pages/manager/manageContent/CourseSelector.jsx
import React from "react";
import styles from "../adminPages.module.css";

/**
 * @component CourseSelector
 * @description A component that provides a UI for selecting, adding, and deleting courses, as well as adding topics to a selected course.
 * It displays a dropdown of available courses. When a course is selected, it shows buttons for deleting the course and adding a new topic.
 * If no course is selected, it shows a button to add a new course.
 * @param {object} props - The component props.
 * @param {Array<object>} props.courses - The list of course objects to display in the dropdown.
 * @param {number|null} props.selectedCourse - The ID of the currently selected course.
 * @param {Function} props.onSelect - The function to call when a course is selected from the dropdown.
 * @param {Function} props.onAdd - The function to call when the "add course" button is clicked.
 * @param {Function} props.onDelete - The function to call when the "delete course" button is clicked.
 * @param {Function} props.onAddTopic - The function to call when the "add topic" button is clicked.
 * @returns {JSX.Element} The rendered course selector component.
 */
export default function CourseSelector({
  courses,
  selectedCourse,
  onSelect,
  onAdd,
  onDelete,
  onAddTopic,
}) {
  return (
    <div className={styles.addingLine}>
      <select
        id="courseSelect"
        className={styles.searchInput}
        value={selectedCourse || ""}
        onChange={e => onSelect(Number(e.target.value))}
      >
        <option value="" disabled>בחר קורס</option>
        {courses.map(course => (
          <option key={course.CourseID} value={course.CourseID}>{course.CourseName}</option>
        ))}
      </select>
      {selectedCourse ? (
        <>
          <button className={styles.deleteButtonLarge} style={{marginRight: 8}} onClick={() => onDelete(selectedCourse)}>
            מחק קורס
          </button>
          <button className={styles.addButton} onClick={onAddTopic} style={{marginRight: 8}}>
            הוסף נושא
          </button>
        </>
      ) : (
        <button className={styles.addButton} onClick={onAdd}>
          הוסף קורס
        </button>
      )}
    </div>
  );
} 