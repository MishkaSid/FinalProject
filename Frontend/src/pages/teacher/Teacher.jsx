import React from "react";
import styles from "./teacher.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState } from "react";
import "../pages.css";
import "../../styles/admin-utils.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";
import { useAuth } from "../../context/AuthContext";

/**
 * The TeacherDashboard component renders the main page for teachers.
 * It includes a sidebar for navigation, a welcome message for the user,
 * and a main content area with charts displaying question statistics 
 * and grade distribution.
 *
 * The sidebar can be toggled open or closed, which blurs the background 
 * content. The component uses the Welcome, Sidebar, QuestionStatsChart, 
 * and GradesDistributionChart components to render the respective sections.
 *
 * @returns {JSX.Element} The rendered TeacherDashboard component.
 */

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.teacherPage}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userType="Teacher" />

      <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
        <div className={styles.background}></div>

        <div className={styles.teacherContent}>
          <div className={styles.dashboardHeader}>
            <h1 className={styles.dashboardTitle}>לוח בקרה - מורה</h1>
            <p className={styles.dashboardSubtitle}>ברוך הבא, {user?.name || "מורה"}</p>
          </div>
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
