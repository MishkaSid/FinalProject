import React, { useState } from "react";
import styles from "../adminPages.module.css";

/**
 * @component TopicForm
 * @description A form for creating or editing a topic. It includes fields for the topic ID,
 * topic name, and a read-only field for the course ID. The submit button's text changes
 * based on whether the form is in 'add' or 'edit' mode.
 * @param {object} props - The component props.
 * @param {object} props.initialValues - The initial values for the form fields (TopicID, TopicName, CourseID).
 * @param {Function} props.onSubmit - The function to call when the form is submitted.
 * @param {Function} props.onClose - The function to call when the cancel button is clicked.
 * @param {string} props.mode - The mode of the form, either 'add' or 'edit'.
 * @returns {JSX.Element} The rendered topic form.
 */
export default function TopicForm({ initialValues, onSubmit, onClose, mode }) {
  const [topicId, setTopicId] = useState(initialValues.TopicID || "");
  const [topicName, setTopicName] = useState(initialValues.TopicName || "");
  const [courseId] = useState(initialValues.CourseID || "");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          TopicID: topicId,
          TopicName: topicName,
          CourseID: courseId,
        });
      }}
    >
      <div className={styles.inputContainer}>
        <label className={styles.label}>מזהה נושא (TopicID)</label>
        <input
          className={styles.input}
          type="number"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          placeholder="אוטומטי אלא אם שונה"
        />
      </div>
      <div className={styles.inputContainer}>
        <label className={styles.label}>שם נושא</label>
        <input
          className={styles.input}
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
        />
      </div>
      <div className={styles.inputContainer}>
        <label className={styles.label}>מזהה קורס (CourseID)</label>
        <input
          className={styles.input}
          type="number"
          value={courseId}
          disabled
        />
      </div>
      <button className={styles.submitButton} type="submit">
        {mode === "edit" ? "שמור" : "הוסף"}
      </button>
      <button
        className={styles.smallButton}
        type="button"
        onClick={onClose}
        style={{ marginTop: 8 }}
      >
        ביטול
      </button>
    </form>
  );
}
