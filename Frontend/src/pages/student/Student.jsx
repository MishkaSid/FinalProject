import React from "react";
import styles from "./student.module.css";
import Card from "../../components/card/Card";
import { FiBook } from "react-icons/fi";
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
