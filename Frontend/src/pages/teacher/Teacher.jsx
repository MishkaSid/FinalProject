import React from "react";
import styles from "./teacher.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState } from "react";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";
import Welcome from "../../components/welcome/Welcome";
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
      <Welcome user={{ username: user?.name || "Teacher" }}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userType="Teacher" />

        <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
          <div className={styles.background}></div>

          <div className={styles.teacherContent}>
            <div className={styles.chartsGrid}>
              <QuestionStatsChart />
              <GradesDistributionChart />
            </div>
          </div>
        </div>
      </Welcome>
    </div>
  );
};

export default TeacherDashboard;
