import React from "react";
import styles from "./student.module.css";
import { Bell, BookOpen, Home, Sidebar, User } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";

const StudentDashboard = () => {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.welcomeText}>Welcome, Student!</h1>
          <Bell className={styles.bellIcon} />
        </div>

        {/* Cards Section */}
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Course Progress</h2>
            <p className={styles.cardText}>You have completed 3 out of 5 modules.</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Upcoming Assignments</h2>
            <p className={styles.cardText}>Math Homework - Due in 2 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
