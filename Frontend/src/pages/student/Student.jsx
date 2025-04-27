import React from "react";
import styles from "./student.module.css";
import Card from "../../components/card/Card";
import { FiBook } from "react-icons/fi";
/**
 * The StudentDashboard component renders the main page for students.
 * It contains a hero section with the student's name and course, and a dashboard
 * with a card containing a link to exercises for the course.
 *
 * @returns {JSX.Element} The rendered StudentDashboard component.
 */
export default function StudentDashboard() {
  const student = {
    name: "מיכאל סידוריוק",
    course: "מתמטיקה",
  };

  return (
    <div className={styles.studentPage}>
      <div className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>שלום, {student.name} 🌟</h1>
          <p className={styles.subTitle}>{student.course}</p>
        </div>
      </div>

      <div className={styles.dashboard}>
        <Card
          title="תרגולים"
          description="כאן תמיד יהיו תרגולים למתמטיקה"
          icon={<FiBook size={30} />}
          size="medium"
          layout="horizontal"
        />
      </div>
    </div>
  );
}
