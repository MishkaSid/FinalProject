import React from "react";
import styles from "./teacher.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState } from "react";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";
import Welcome from "../../components/welcome/Welcome";

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.container}>
      <Welcome user={{ username: "Dr. haim" }}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userType="teacher" />

        <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
          <div className={styles.background}></div>

          <div className={styles.teacherPage}>
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
