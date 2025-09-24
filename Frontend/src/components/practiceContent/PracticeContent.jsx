// בקובץ זה נמצא רכיב לניהול תוכן התרגול במערכת
// הקובץ מספק ממשק להוספת ועריכת תרגילים עם תמונות ואפשרויות תשובה
// הוא משמש לניהול תוכן התרגול עבור מנהלים ומורים במערכת
// Frontend/src/components/practiceContent/PracticeContent.jsx
import React, { useState, useEffect } from "react";
import styles from "./practiceContent.module.css";
import Popup from "../popup/Popup";
import axios from "axios";

const contentTypeOptions = [
  { value: "image", label: "תמונה" },
];

/**
 * @function getDefaultContent
 * @description Returns a default content object for a new practice exercise.
 * This is used to initialize the state for the "add content" form.
 * @returns {object} A default content object with properties for contentType, contentValue, AnswerOptions, and CorrectAnswer.
 */
function getDefaultContent() {
  return {
    contentType: "image",
    contentValue: "",
    AnswerOptions: ["", ""],
    CorrectAnswer: "A",
  };
}

/**
 * @component PracticeContent
 * @description A component that displays and manages the practice content for a given topic.
 * It fetches the exercises for the topic and displays them. It also includes a form within a popup
 * to add new practice exercises, including support for image uploads and multiple-choice answers.
 * @param {object} props - The component props.
 * @param {object} props.topic - The topic object for which to display and manage content.
 * @param {boolean} props.isOpen - Whether the main popup for this component is open.
 * @param {Function} props.onClose - The function to call to close the main popup.
 * @returns {JSX.Element} The rendered practice content component.
 */
export default function PracticeContent({ topic, isOpen, onClose, onContentAdded, initialValues, mode = "add" }) {
  const [topicExercises, setTopicExercises] = useState([]);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [newContent, setNewContent] = useState(getDefaultContent());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * @effect
   * @description Fetches the practice exercises for the selected topic from the server
   * whenever the 'topic' prop changes. It filters the exercises by the topic's ID.
   */
  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    axios.get("/api/practice/practiceExercises")
      .then(res => {
        setTopicExercises((res.data || []).filter(e => e.TopicID === topic.TopicID));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topic]);

  /**
   * @effect
   * @description Initializes the form with existing values when editing content.
   */
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      // Parse AnswerOptions if it's a JSON string
      let answerOptions = initialValues.AnswerOptions;
      if (typeof answerOptions === 'string') {
        try {
          answerOptions = JSON.parse(answerOptions);
        } catch (error) {
          console.warn('Failed to parse AnswerOptions:', error);
          answerOptions = ["", ""];
        }
      }
      
      setNewContent({
        contentType: initialValues.ContentType || "image",
        contentValue: initialValues.ContentValue || "",
        AnswerOptions: answerOptions || ["", ""],
        CorrectAnswer: initialValues.CorrectAnswer || "A",
      });
    }
  }, [mode, initialValues]);

  /**
   * @function handleAddContent
   * @description Handles the submission of the "add content" form. It performs validation to ensure
   * that all required fields are filled, then sends a POST request to the server to create
   * the new practice exercise. On success, it updates the local state to display the new exercise.
   * @returns {Promise<void>}
   */
  const handleAddContent = async () => {
    if (!newContent.contentValue) return;
    if (newContent.AnswerOptions.length < 2 || newContent.AnswerOptions.some(opt => !opt.trim())) return;
    if (!newContent.CorrectAnswer) return;
    const payload = {
      TopicID: topic.TopicID,
      ContentType: newContent.contentType,
      ContentValue: newContent.contentValue,
      AnswerOptions: newContent.AnswerOptions,
      CorrectAnswer: newContent.CorrectAnswer,
    };
    
    if (mode === "edit" && initialValues) {
      // Edit mode - call the callback with updated data
      if (onContentAdded) {
        onContentAdded(payload);
      }
    } else {
      // Add mode - create new content
      axios.post("/api/practice/practiceExercise", payload)
        .then(res => {
          setTopicExercises(prev => [...prev, res.data]);
          // Call the callback to notify parent component
          if (onContentAdded) {
            onContentAdded(topic.TopicID, res.data);
          }
          setIsAddContentOpen(false);
          setNewContent(getDefaultContent());
          setUploadError("");
        });
    }
  };

  /**
   * @function handleFileUpload
   * @description Handles the file upload process for the practice content. It takes the selected file,
   * sends it to the server's upload endpoint, and on success, updates the 'newContent' state
   * with the URL of the uploaded file.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   * @returns {Promise<void>}
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/practice/practiceExercise/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setNewContent((c) => ({ ...c, contentValue: res.data.url }));
      setUploading(false);
    } catch (err) {
      setUploadError("שגיאה בהעלאת קובץ");
      setUploading(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose} header={mode === "edit" ? "ערוך תוכן תרגול" : topic?.TopicName}>
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault();
          handleAddContent();
        }}
      >
        {(newContent.contentType === "image") && (
          <div className={styles.inputContainer}>
            <label className={styles.label}>בחר תמונה</label>
            <input
              className={styles.input}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
            {uploading && <div className={styles.uploadingMsg}>מעלה...</div>}
            {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
          </div>
        )}
        <div className={styles.inputContainer}>
          <label className={styles.label}>אפשרויות תשובה</label>
          {newContent.AnswerOptions.map((option, idx) => (
            <div key={idx} className={styles.answerOptionRow}>
              <input
                className={`${styles.input} ${styles.answerOptionInput}`}
                type="text"
                placeholder={`תשובה ${String.fromCharCode(65 + idx)}`}
                value={option}
                onChange={e => {
                  const updated = [...newContent.AnswerOptions];
                  updated[idx] = e.target.value;
                  setNewContent(c => ({ ...c, AnswerOptions: updated }));
                }}
                required
              />
              <input
                type="radio"
                name="correctAnswer"
                className={styles.answerOptionRadioSmall}
                checked={newContent.CorrectAnswer === String.fromCharCode(65 + idx)}
                onChange={() => setNewContent(c => ({ ...c, CorrectAnswer: String.fromCharCode(65 + idx) }))}
              />
              <span className={styles.answerOptionLabel}>{String.fromCharCode(65 + idx)}</span>
              {newContent.AnswerOptions.length > 2 && (
                <button
                  type="button"
                  className={styles.answerOptionRemove}
                  onClick={() => {
                    const updated = newContent.AnswerOptions.filter((_, i) => i !== idx);
                    let correct = newContent.CorrectAnswer;
                    if (correct === String.fromCharCode(65 + idx)) correct = "A";
                    setNewContent(c => ({ ...c, AnswerOptions: updated, CorrectAnswer: correct }));
                  }}
                >✕</button>
              )}
            </div>
          ))}
          <button
            type="button"
            className={styles.addOptionButton}
            onClick={() => {
              setNewContent(c => ({ ...c, AnswerOptions: [...c.AnswerOptions, ""] }));
            }}
          >הוסף אפשרות</button>
          <div className={styles.optionHint}>בחר את התשובה הנכונה (עיגול ימני)</div>
        </div>
        <button className={styles.submitButton} type="submit" disabled={uploading}>
          {mode === "edit" ? "עדכן" : "הוסף"}
        </button>
      </form>
    </Popup>
  );
} 