import React from "react";
import styles from "./teacher.module.css";
import { Book, ClipboardList, Home, Users } from "lucide-react";

const TeacherDashboard = () => {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <Home className={styles.icon} />
        <Users className={styles.icon} />
        <Book className={styles.icon} />
        <ClipboardList className={styles.icon} />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.welcomeText}>Welcome, Teacher!</h1>
        </div>

        {/* Cards Section */}
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manage Classes</h2>
            <p className={styles.cardText}>Create, edit, and monitor class activities.</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Assignments</h2>
            <p className={styles.cardText}>Review and grade student submissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
