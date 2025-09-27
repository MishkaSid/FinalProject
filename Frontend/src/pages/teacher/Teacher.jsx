// בקובץ זה נמצא דף הבית הראשי עבור מורים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי התלמידים וסטטיסטיקות שאלות
// הוא מספק מידע על התקדמות התלמידים ועל התוכן הלימודי במערכת
// Frontend/src/pages/teacher/Teacher.jsx
import React from "react";
import styles from "./teacher.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState } from "react";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";
import { useAuth } from "../../context/AuthContext";

/**
 * The TeacherDashboard component renders the main page for teachers.
 * It includes a sidebar for navigation and a main content area with charts 
 * displaying question statistics and grade distribution.
 *
 * The sidebar can be toggled open or closed, which blurs the background
 * content. The component uses the Sidebar, QuestionStatsChart,
 * and GradesDistributionChart components to render the respective sections.
 *
 * @returns {JSX.Element} The rendered TeacherDashboard component.
 */
const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles navigation to the given route.
   * @param {string} route The route to navigate to.
   * @returns {void} No return value.
   */
  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.teacherPage}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userType="Teacher"
      />

      <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
        <div className={styles.background}></div>

        <div className={styles.teacherContent}>
          <div className={styles.chartsGrid}>
            <QuestionStatsChart />
            <GradesDistributionChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
