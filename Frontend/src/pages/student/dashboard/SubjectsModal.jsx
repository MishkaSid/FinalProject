// בקובץ זה נמצא רכיב החלון הקופץ לבחירת נושאים לתרגול
// הקובץ מציג רשימה של נושאים זמינים עם אפשרות בחירה לתרגול או מבחן
// הוא מטפל בטעינת נתונים, הצגת שגיאות ומספק כפתורי התחלת תרגול ומבחן
// הוא משמש כחלון בחירה עבור סטודנטים לבחירת נושא ספציפי לתרגול

// Frontend/src/pages/student/dashboard/SubjectsModal.jsx
import React from "react";
import { FiBook, FiCheck, FiAlertCircle } from "react-icons/fi";
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
    <Popup isOpen={isOpen} onClose={onClose} header="בחירת נושא ללמידה">
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>
          בחר נושא לתרגול או למבחן מהרשימה המוצגת למטה
        </p>

        {error && (
          <div className={styles.errorAlert}>
            <FiAlertCircle className={styles.errorIcon} />
            <div className={styles.errorContent}>
              <span className={styles.errorText}>{error}</span>
            </div>
          </div>
        )}

        {subjectsLoading ? (
          <div className={styles.modalLoadingState}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>טוען נושאים זמינים...</p>
            <p className={styles.loadingSubtext}>אנא המתן, מתחבר לשרת</p>
          </div>
        ) : subjects.length > 0 ? (
          <div className={styles.subjectsContainer}>
            
            <div className={styles.subjectsGrid}>
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`${styles.subjectCard} ${
                    selectedSubject?.id === subject.id ? styles.selectedCard : ""
                  }`}
                  onClick={() => onSubjectSelect(subject)}
                >
                  <div className={styles.subjectCardContent}>
                    <h3 className={styles.subjectTitle}>{subject.name}</h3>
                  </div>
                  {selectedSubject?.id === subject.id && (
                    <div className={styles.checkIconWrapper}>
                      <FiCheck className={styles.checkIconSvg} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noSubjectsState}>
            <FiAlertCircle className={styles.noSubjectsIcon} />
            <p className={styles.noSubjectsTitle}>לא נמצאו נושאים זמינים</p>
            <p className={styles.noSubjectsSubtext}>
              {error
                ? "שגיאה בטעינת הנתונים מהשרת"
                : "אנא נסה שוב מאוחר יותר או פנה למנהל המערכת"}
            </p>
            {error && (
              <div className={styles.noSubjectsActions}>
                <button
                  onClick={onRetryFetch}
                  className={styles.retryButtonStyled}
                >
                  נסה שוב
                </button>
                <button
                  onClick={onClose}
                  className={styles.closeButtonStyled}
                >
                  סגור
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.modalActionsGrid}>
          <button
            className={`${styles.actionButton} ${styles.practiceActionButton} ${
              !selectedSubject ? styles.actionButtonDisabled : ""
            }`}
            onClick={onStartPractice}
            disabled={!selectedSubject}
          >
            <FiBook className={styles.actionButtonIcon} />
            <span className={styles.actionButtonText}>התחל תרגול</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.examActionButton} ${
              !selectedSubject ? styles.actionButtonDisabled : ""
            }`}
            onClick={onStartExam}
            disabled={!selectedSubject}
          >
            <LuNotebookPen className={styles.actionButtonIcon} />
            <span className={styles.actionButtonText}>התחל מבחן</span>
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default SubjectsModal;
