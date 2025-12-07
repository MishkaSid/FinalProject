// בקובץ זה נמצא דף הבית הראשי עבור מורים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי התלמידים וסטטיסטיקות שאלות
// הוא מספק מידע על התקדמות התלמידים ועל התוכן הלימודי במערכת
// Frontend/src/pages/teacher/Teacher.jsx
import React, { useState } from "react";
import styles from "./teacher.module.css";
import managerStyles from "../manager/home/manager.module.css";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import TopicFailureRateCard from "../../components/analytics/TopicFailureRateCard";
import DateRangeSelector from "../../components/analytics/DateRangeSelector";

/**
 * The TeacherDashboard component renders the main page for teachers.
 * It displays charts showing grade distribution and topic failure rates.
 *
 * @returns {JSX.Element} The rendered TeacherDashboard component.
 */
const TeacherDashboard = () => {
  const [gradeFrom, setGradeFrom] = useState("");
  const [gradeTo, setGradeTo] = useState("");


  return (
    <div className={styles.teacherPage}>
      <div className={styles.teacherContent}>
        <div className={styles.chartsGrid}>
          {/* Grade Distribution Card */}
          <div className={managerStyles.statCard}>
            <h3 className={managerStyles.cardTitle}>התפלגות ציונים</h3>
            <DateRangeSelector 
              from={gradeFrom} 
              to={gradeTo}
              onFromChange={setGradeFrom}
              onToChange={setGradeTo}
            />
            <div className={managerStyles.chartContainer}>
              <GradesDistributionChart from={gradeFrom} to={gradeTo} />
            </div>
          </div>

          {/* Topic Failure Rate Card */}
          <div className={`${managerStyles.statCard} ${styles.fullWidth}`}>
            <h3 className={managerStyles.cardTitle}>שיעור כישלונות לפי נושא</h3>
            <TopicFailureRateCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
