// Pre-Exam instructions page
// This page displays exam instructions and requires user confirmation before starting
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiAlertCircle, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import styles from "./preExam.module.css";

/**
 * @component PreExam
 * @description Displays exam instructions and requires user confirmation before starting the exam.
 * Shows important rules, time limits, and exam format information.
 * @returns {JSX.Element} The pre-exam instructions page
 */
export default function PreExam() {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleStartExam = () => {
    if (isConfirmed) {
      navigate("/student/exam");
    }
  };

  const handleBack = () => {
    navigate("/student");
  };

  return (
    <div className={styles.preExamContainer}>

      {/* Content */}
      <div className={styles.content}>
        {/* Back Button */}
        <button onClick={handleBack} className={styles.backButton}>
          <FiArrowLeft />
          חזור לדשבורד
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <FiAlertCircle size={48} />
          </div>
          <h1 className={styles.title}>הוראות לפני תחילת המבחן</h1>
          <p className={styles.subtitle}>אנא קרא בעיון את ההוראות הבאות לפני תחילת המבחן</p>
        </div>

        {/* Instructions Card */}
        <div className={styles.instructionsCard}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FiClock className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>מידע כללי על המבחן</h2>
            </div>
            <ul className={styles.instructionsList}>
            <li>משך המבחן: שעתיים וחצי</li>
            <li>ניתן לנווט בין השאלות בחופשיות</li>
              <li>המבחן מורכב משאלות אמריקריות</li>
              <li>המבחן כולל שאלות מכל הנושאים שלמדת</li>
              <li>במבחן זה, בשונה מהמבחן האמיתי, ציון ניתן על תשובה נכונה בלבד ולא ינתן ניקוד חלקי על דרך הפתרון היות ואין באפשרותנו לבדוק זאת.</li>
              
            </ul>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FiCheckCircle className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>חוקי המבחן</h2>
            </div>
            <ul className={styles.instructionsList}>
              <li className={styles.importantItem}>
                <strong>אסור</strong> להשתמש בחומר עזר או במחשבון חיצוני
              </li>
              <li className={styles.importantItem}>
                <strong>אסור</strong> לצאת מהמבחן לאחר תחילתו - הזמן ימשיך לרוץ
              </li>
              <li>ודא שיש לך חיבור אינטרנט יציב</li>
              <li>חומר עזר מותר: 
              מחשב כיס סטנדרטי, דף נוסחאות אשר מצורף בסוף הדף.</li>
            </ul>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FiAlertCircle className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>הערות חשובות</h2>
            </div>
            <ul className={styles.instructionsList}>
              <li>לחץ על "סיים מבחן" כאשר תסיים לענות על כל השאלות</li>
              <li>בסיום המבחן תקבל משוב מיידי על הציון והתשובות הנכונות</li>
              <li>אם הזמן יגמר, המבחן יסתיים אוטומטית</li>
              <li>מומלץ לעבוד בסביבה שקטה וללא הפרעות</li>
              <li>הדוקטור ממליץ להכין מחברת משבצות אשר בה תוכלו לפתור את השאלות ואז לסמן את התשובה הנכונה</li>
              <li className={styles.formulaLink}>
                <a href="http://localhost:5000/uploads/Formulas.png" target="_blank" rel="noopener noreferrer">
                   לחץ כאן לצפייה בדף נוסחאות
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className={styles.confirmationSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              קראתי והבנתי את ההוראות והכללים של המבחן
            </span>
          </label>
        </div>

        {/* Start Button */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.startButton} ${!isConfirmed ? styles.disabled : ""}`}
            onClick={handleStartExam}
            disabled={!isConfirmed}
          >
             בואו נתחיל 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

