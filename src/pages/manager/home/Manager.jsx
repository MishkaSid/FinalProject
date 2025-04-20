import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/card/Card";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useState } from "react";
import "../../pages.css";
import styles from "../manager.module.css";
import {
  FiUsers,
  FiUpload,
  FiBookOpen,
  FiArchive,
  FiSettings,
} from "react-icons/fi";
import ActivityHeatMap from "../../../components/charts/ActivityHeatmap";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionDifficultyChart from "../../../components/charts/QuestionDifficultyChart";



function Manager() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.adminPage}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
        <div className={styles.background}></div>

        <div className={styles.managerPage}>
          <h1 className={styles.welcomeText}>Welcome, Manager!</h1>
          <div className={styles.cardContainer}>
            
            <GradesDistributionChart />
            <QuestionDifficultyChart/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Manager;
