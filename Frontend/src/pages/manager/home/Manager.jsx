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
  return (
    <div className={styles.adminPage}>
      <div className={styles.background} />
      <div className={styles.managerPage}>
        <div className={styles.chartsGrid}>
          {user?.role === "Teacher" && <QuestionStatsChart />}
          <StudentUsageChart />
          <GradesDistributionChart />
        </div>
      </div>
    </div>
  );
}

export default Manager;
