import React from "react";
import styles from "../adminPages.module.css";

// Renders a table of practice content exercises.
export default function PracticeContentTable({ contentList, onDeleteContent, onEditContent }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.tableFullWidth}>
        <thead>
          <tr>
            <th>תמונה</th>
            <th>אפשרויות תשובה</th>
            <th>תשובה נכונה</th>
            <th>עריכה</th>
            <th>מחיקה</th>
          </tr>
        </thead>
        <tbody>
          {(contentList || []).map(content => {
            // Parse AnswerOptions from JSON string to array
            let answerOptions = [];
            try {
              if (content.AnswerOptions) {
                answerOptions = typeof content.AnswerOptions === 'string' 
                  ? JSON.parse(content.AnswerOptions) 
                  : content.AnswerOptions;
              }
            } catch (error) {
              console.warn('Failed to parse AnswerOptions:', error);
              answerOptions = [];
            }
            
            return (
              <tr key={content.ExerciseID}>
                <td>
                  {content.ContentType === "image" && (
                    <img src={content.ContentValue} alt="img" style={{ maxWidth: 80, maxHeight: 60, borderRadius: 8 }} />
                  )}
                </td>
                <td>
                  {(answerOptions || []).map((opt, i) => (
                    <div key={i}>{String.fromCharCode(65 + i)}. {opt}</div>
                  ))}
                </td>
                <td>{content.CorrectAnswer}</td>
                <td>
                  <button 
                    className={styles.smallButton} 
                    onClick={() => onEditContent(content)}
                    style={{ marginLeft: '5px', backgroundColor: '#007bff', color: 'white' }}
                  >
                    ערוך
                  </button>
                </td>
                <td>
                  <button className={styles.smallButton} onClick={() => onDeleteContent(content.ExerciseID)}>מחק</button>
                </td>
              </tr>
            );
          })}
          {(contentList || []).length === 0 && (
            <tr><td colSpan="5">אין תוכן</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 