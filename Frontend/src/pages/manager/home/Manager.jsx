// בקובץ זה נמצא דף הבית הראשי עבור מנהלים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי המערכת ושימוש הסטודנטים
// הוא מספק מידע מקיף על פעילות המערכת עבור מנהלים
// Frontend/src/pages/manager/home/Manager.jsx
import "../../pages.css";
import styles from "./manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import SiteVisitStats from "../../../components/analytics/SiteVisitStats";
import { useAuth } from "../../../context/AuthContext";
import React, { useEffect, useState } from "react";
import { getSiteVisitsCount } from "../../../services/analyticsApi";
import StudentAvgLastExamsCard from "../../../components/analytics/StudentAvgLastExamsCard";
import StudentsReportCard from "../../../components/analytics/StudentsReportCard";
import TopicFailureRateCard from "../../../components/analytics/TopicFailureRateCard";
import DateRangeSelector from "../../../components/analytics/DateRangeSelector";

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
  const [visFrom, setVisFrom] = useState("");
  const [visTo, setVisTo] = useState("");
  const [visSeries, setVisSeries] = useState([]);
  const [gradeFrom, setGradeFrom] = useState("");
  const [gradeTo, setGradeTo] = useState("");


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
            <h2 className={styles.cardTitle} style={{ fontSize: "2rem", fontWeight: "bold" }}>דוח סטודנטים</h2>
            <StudentsReportCard />
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle} style={{ fontSize: "2rem", fontWeight: "bold" }}>ממוצע ציונים אחרונים</h3>
            <StudentAvgLastExamsCard />
          </div>

          {/* Site Visits Card */}
          <div className={styles.statCard}>
            <h2 className={styles.cardTitle} style={{ fontSize: "2rem", fontWeight: "bold" }}>סטטיסטיקות כניסות לאתר</h2>
            <DateRangeSelector 
              from={visFrom} 
              to={visTo}
              onFromChange={setVisFrom}
              onToChange={setVisTo}
            />
            <div className={`${styles.chartContainer} ${styles.chartContainerStretch}`}>
              <SiteVisitStats from={visFrom} to={visTo} />
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
            <h2 className={styles.cardTitle} style={{ fontSize: "2rem", fontWeight: "bold" }}>התפלגות ציונים</h2>
            <DateRangeSelector 
              from={gradeFrom} 
              to={gradeTo}
              onFromChange={setGradeFrom}
              onToChange={setGradeTo}
            />
            <div className={styles.chartContainer}>
              <GradesDistributionChart from={gradeFrom} to={gradeTo} />
            </div>
          </div>

          {/* Topic Failure Rate Card - Full Width at Bottom */}
          <div className={`${styles.statCard} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle} style={{ fontSize: "2rem", fontWeight: "bold" }}>שיעור כישלונות לפי נושא</h2>
            <TopicFailureRateCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Manager;
