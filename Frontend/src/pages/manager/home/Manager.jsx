// בקובץ זה נמצא דף הבית הראשי עבור מנהלים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי המערכת ושימוש הסטודנטים
// הוא מספק מידע מקיף על פעילות המערכת עבור מנהלים
// Frontend/src/pages/manager/home/Manager.jsx
import "../../pages.css";
import styles from "./manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import StudentUsageChart from "../../../components/charts/StudentUsageChart";
import { useAuth } from "../../../context/AuthContext";
import React, { useEffect, useState } from "react";
import CourseGradesOverTimeChart from "../../../components/charts/CourseGradesOverTimeChart";
import { getSiteVisitsCount } from "../../../services/analyticsApi";
import StudentAvgLastExamsCard from "../../../components/analytics/StudentAvgLastExamsCard";
import StudentsReportCard from "../../../components/analytics/StudentsReportCard";
import TopicFailureRateCard from "../../../components/analytics/TopicFailureRateCard";

/**
 * The Manager component renders the main page for managers.
 * It contains a sidebar with links to relevant pages, and a main content area
 * with three charts: a question statistics chart, a student usage chart, and a
 * grades distribution chart.
 *
 * @returns {JSX.Element} The rendered Manager component.
 */
function Manager() {
  const { user } = useAuth();
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visFrom, setVisFrom] = useState("");
  const [visTo, setVisTo] = useState("");
  const [visSeries, setVisSeries] = useState([]);

  useEffect(() => {
    async function loadVisits() {
      try {
        const { series } = await getSiteVisitsCount(visFrom, visTo);
        setVisSeries(series);
      } catch (e) {
        console.error("visits load error", e);
      }
    }
    loadVisits();
  }, [visFrom, visTo]);

  return (
    <div className={styles.adminPage}>
        <div className={styles.background} />
      
      {/* Statistics Cards Grid */}
        <div className={styles.managerPage}>
        <div className={styles.cardsGrid}>
          {/* Report Cards */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>דוח סטודנטים</h3>
            <StudentsReportCard />
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>ממוצע ציונים אחרונים</h3>
            <StudentAvgLastExamsCard />
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>שיעור כישלונות לפי נושא</h3>
            <TopicFailureRateCard />
          </div>

          {/* Course Grades Card */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>מעקב ציונים לאורך זמן</h3>
            <div className={styles.cardControls}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>מזהה קורס</label>
                <input
                  type="text"
                  className={styles.controlInput}
                  placeholder="הזן מזהה קורס"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                />
              </div>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>מתאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>עד תאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className={styles.buttonRow}>
                <button
                  className={styles.smallButton}
                  onClick={() => {
                    const now = new Date();
                    const toStr = now.toISOString().slice(0, 10);
                    const fromD = new Date(now);
                    fromD.setDate(fromD.getDate() - 30);
                    const fromStr = fromD.toISOString().slice(0, 10);
                    setFrom(fromStr);
                    setTo(toStr);
                  }}
                >
                  30 יום אחרונים
                </button>
                <button
                  className={`${styles.smallButton} ${styles.secondary}`}
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  נקה
                </button>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <CourseGradesOverTimeChart
                courseId={courseId}
                from={from}
                to={to}
              />
            </div>
          </div>

          {/* Site Visits Card */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>סטטיסטיקות כניסות לאתר</h3>
            <div className={styles.cardControls}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>מתאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={visFrom}
                  onChange={(e) => setVisFrom(e.target.value)}
                />
              </div>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>עד תאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={visTo}
                  onChange={(e) => setVisTo(e.target.value)}
                />
              </div>
              <div className={styles.buttonRow}>
                <button
                  className={styles.smallButton}
                  onClick={() => {
                    const now = new Date();
                    const toStr = now.toISOString().slice(0, 10);
                    const fromD = new Date(now);
                    fromD.setDate(fromD.getDate() - 30);
                    const fromStr = fromD.toISOString().slice(0, 10);
                    setVisFrom(fromStr);
                    setVisTo(toStr);
                  }}
                >
                  30 יום אחרונים
                </button>
                <button
                  className={`${styles.smallButton} ${styles.secondary}`}
                  onClick={() => {
                    setVisFrom("");
                    setVisTo("");
                  }}
                >
                  נקה
                </button>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <StudentUsageChart from={visFrom} to={visTo} />
            </div>
          </div>

          {/* Charts Cards */}
          {user?.role === "Teacher" && (
            <div className={styles.statCard}>
              <h3 className={styles.cardTitle}>סטטיסטיקות שאלות</h3>
              <div className={styles.chartContainer}>
                <QuestionStatsChart />
              </div>
            </div>
          )}
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>התפלגות ציונים</h3>
            <div className={styles.chartContainer}>
            <GradesDistributionChart />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Manager;
