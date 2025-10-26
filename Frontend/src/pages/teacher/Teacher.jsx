// בקובץ זה נמצא דף הבית הראשי עבור מורים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי התלמידים וסטטיסטיקות שאלות
// הוא מספק מידע על התקדמות התלמידים ועל התוכן הלימודי במערכת
// Frontend/src/pages/teacher/Teacher.jsx
import React from "react";
import styles from "./teacher.module.css";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";

/**
 * The TeacherDashboard component renders the main page for teachers.
 * It displays charts showing question statistics and grade distribution.
 *
 * @returns {JSX.Element} The rendered TeacherDashboard component.
 */
const TeacherDashboard = () => {

  return (
    <div className={styles.teacherPage}>
      <div className={styles.teacherContent}>
        <div className={styles.chartsGrid}>
          <QuestionStatsChart />
          <GradesDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
