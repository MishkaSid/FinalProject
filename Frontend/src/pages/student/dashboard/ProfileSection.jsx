// בקובץ זה נמצא רכיב הפרופיל של הסטודנט במערכת
// הקובץ מציג מידע אישי על הסטודנט כולל מבחן אחרון, ממוצע ציונים ומספר מבחנים
// הוא מספק כפתור רענון נתונים ומציג סטטוס טעינה ושגיאות
// הוא משמש כחלק מדף הבית של הסטודנט ומציג את המידע האישי שלו

// Frontend/src/pages/student/dashboard/ProfileSection.jsx
import React from "react";
import { FiUser, FiAward, FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import styles from "./student.module.css";

/**
 * ProfileSection component displays the student's profile information
 * including last exam, average grade, total exams, and refresh functionality
 */
const ProfileSection = ({
  studentData,
  refreshing,
  error,
  hasValidData,
  onRefresh,
  onRetryWithBackoff,
}) => {
  return (
    <div className={styles.heroProfile}>
      {/* Data status indicator */}
      <div
        style={{
          background: hasValidData
            ? "rgba(40,167,69,0.2)"
            : "rgba(255,193,7,0.2)",
          border: `1px solid ${
            hasValidData ? "rgba(40,167,69,0.3)" : "rgba(255,193,7,0.3)"
          }`,
          borderRadius: "5px",
          padding: "5px",
          margin: "5px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "11px",
            fontWeight: "500",
          }}
        >
          {hasValidData ? "✅ נתונים נטענו בהצלחה" : "⏳ טוען נתונים..."}
        </span>
      </div>

      {/* Small loading indicator when refreshing */}
      {refreshing && (
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "8px",
            margin: "5px",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          <div
            className={styles.miniSpinner}
            style={{ margin: "0 auto" }}
          ></div>
          <span
            style={{
              color: "white",
              fontSize: "12px",
              display: "block",
              marginTop: "5px",
            }}
          >
            מרענן נתונים מהשרת...
          </span>
        </div>
      )}

      {/* Error display in profile area */}
      {error && (
        <div
          style={{
            background: "rgba(255,0,0,0.2)",
            padding: "8px",
            margin: "5px",
            borderRadius: "5px",
            textAlign: "center",
            border: "1px solid rgba(255,0,0,0.3)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "12px",
              display: "block",
              marginBottom: "5px",
            }}
          >
            שגיאה בטעינת נתונים: {error}
          </span>
          <button
            onClick={onRefresh}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              padding: "3px 10px",
              borderRadius: "3px",
              fontSize: "11px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.3)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.2)")
            }
          >
            נסה שוב
          </button>
          <button
            onClick={onRetryWithBackoff}
            style={{
              background: "rgba(0,123,255,0.2)",
              color: "white",
              border: "none",
              padding: "3px 10px",
              borderRadius: "3px",
              fontSize: "11px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginLeft: "5px",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "rgba(0,123,255,0.3)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "rgba(0,123,255,0.2)")
            }
          >
            נסה עם ניסיונות חוזרים
          </button>
        </div>
      )}

      <h2 className={styles.heroProfileTitle}>
        <FiUser className={styles.profileIcon} />
        פרופיל
      </h2>

      <div className={styles.heroProfileContent}>
        {/* Last Exam */}
        <div className={styles.profileStat}>
          <FiAward className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>מבחן אחרון:</span>
            <span className={styles.statValue}>
              {(() => {
                if (studentData.lastExam) {
                  try {
                    const date = new Date(studentData.lastExam.date);
                    if (isNaN(date.getTime())) {
                      return `${studentData.lastExam.date} - ${
                        studentData.lastExam.grade || 0
                      }%`;
                    }
                    const formattedDate = date.toLocaleDateString("he-IL");
                    const grade = studentData.lastExam.grade || 0;
                    return `${formattedDate} - ${grade}%`;
                  } catch (error) {
                    return `${studentData.lastExam.date} - ${
                      studentData.lastExam.grade || 0
                    }%`;
                  }
                } else {
                  return "לא נעשה מבחן עדיין";
                }
              })()}
            </span>
          </div>
        </div>

        {/* Average Grade */}
        <div className={styles.profileStat}>
          <FiTrendingUp className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>ממוצע ציונים:</span>
            <span className={styles.statValue}>
              {studentData.overallAverage > 0
                ? `${studentData.overallAverage.toFixed(2)}%`
                : "אין נתונים"}
            </span>
          </div>
        </div>

        {/* Total Exams */}
        <div className={styles.profileStat}>
          <FiAward className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>סה"כ מבחנים:</span>
            <span className={styles.statValue}>
              {studentData.totalExams > 0
                ? studentData.totalExams
                : "אין מבחנים"}
            </span>
          </div>
        </div>
      </div>

      {/* Refresh button for manual data refresh */}
      <button
        onClick={onRefresh}
        className={styles.refreshButton}
        title="רענן נתונים מהשרת"
        disabled={refreshing}
      >
        {refreshing ? (
          <div className={styles.miniSpinner}></div>
        ) : (
          <FiRefreshCw size={16} />
        )}
        {refreshing ? "מרענן..." : "רענן נתונים"}
      </button>
    </div>
  );
};

export default ProfileSection;
