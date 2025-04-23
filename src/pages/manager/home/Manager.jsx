import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/card/Card";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useState } from "react";
import "../../pages.css";
import styles from "../manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import StudentUsageChart from "../../../components/charts/StudentUsageChart";
import Welcome from "../../../components/welcome/Welcome";

/**
 * The Manager component renders the main page for managers.
 * It contains a sidebar with links to relevant pages, and a main content area
 * with three charts: a question statistics chart, a student usage chart, and a
 * grades distribution chart.
 *
 * @returns {JSX.Element} The rendered Manager component.
 */
function Manager() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.adminPage}>
      <Welcome user={{ username: "Shani" }}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
          <div className={styles.background}></div>

          <div className={styles.managerPage}>
            <div className={styles.chartsGrid}>
              <QuestionStatsChart />
              <StudentUsageChart />
              <GradesDistributionChart />
            </div>
          </div>
        </div>
      </Welcome>
    </div>
  );
}

export default Manager;
