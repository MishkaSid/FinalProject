import React from "react";
import { FiBook, FiCheck } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import Popup from "../../../components/popup/Popup";
import styles from "./student.module.css";

/**
 * SubjectsModal component displays the subjects selection modal
 * for practice and exam options
 */
const SubjectsModal = ({
  isOpen,
  onClose,
  subjects,
  subjectsLoading,
  selectedSubject,
  error,
  onSubjectSelect,
  onStartPractice,
  onStartExam,
  onRetryFetch,
}) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} header="בחר נושא לתרגול מהרשימה">
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>
          בחר את הנושא שברצונך לתרגל היום. הנושאים נטענים מהשרת
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.1)",
              border: "1px solid rgba(255,0,0,0.3)",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#dc3545", fontSize: "0.9rem" }}>
              {error}
            </span>
          </div>
        )}

        {subjectsLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>טוען נושאים זמינים...</p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                marginTop: "0.5rem",
              }}
            >
              אנא המתן
            </p>
            <div
              style={{
                background: "rgba(0,123,255,0.1)",
                border: "1px solid rgba(0,123,255,0.3)",
                borderRadius: "5px",
                padding: "8px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#007bff", fontSize: "0.8rem" }}>
                מתחבר לשרת...
              </span>
            </div>
          </div>
        ) : subjects.length > 0 ? (
          <div>
            <div
              style={{
                background: "rgba(40,167,69,0.1)",
                border: "1px solid rgba(40,167,69,0.3)",
                borderRadius: "5px",
                padding: "8px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  color: "#28a745",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                ✅ נטענו {subjects.length} נושאים בהצלחה
              </span>
            </div>
            <div className={styles.subjectsGrid}>
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`${styles.subjectCard} ${
                    selectedSubject?.id === subject.id ? styles.selected : ""
                  }`}
                  onClick={() => onSubjectSelect(subject)}
                >
                  <div className={styles.subjectInfo}>
                    <h3>{subject.name}</h3>
                    <p>{subject.description}</p>
                  </div>
                  {selectedSubject?.id === subject.id && (
                    <div className={styles.checkIcon}>
                      <FiCheck />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noSubjects}>
            <p>לא נמצאו נושאים זמינים כרגע</p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                marginTop: "0.5rem",
              }}
            >
              {error
                ? "שגיאה בטעינת נתונים"
                : "אנא נסה שוב מאוחר יותר או פנה למנהל המערכת"}
            </p>
            {error && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={onRetryFetch}
                  style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    marginRight: "10px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  נסה שוב
                </button>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  סגור
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.modalActions}>
          <button
            className={`${styles.startButton} ${styles.practiceButton} ${
              selectedSubject ? styles.active : styles.disabled
            }`}
            onClick={onStartPractice}
            disabled={!selectedSubject}
          >
            <FiBook />
            התחל תרגול בנושא
          </button>
          <button
            className={`${styles.startButton} ${styles.examButton} ${
              selectedSubject ? styles.active : styles.disabled
            }`}
            onClick={onStartExam}
            disabled={!selectedSubject}
          >
            <LuNotebookPen />
            התחל מבחן בנושא
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default SubjectsModal;
