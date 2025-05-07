import React from "react";
import styles from "./student.module.css";
import Card from "../../components/card/Card";
import { FiBook } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import { CgPlayButtonO } from "react-icons/cg";
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
    lastTest: {
      name: "מבחן 1",
      grade: 80,
    },
    averageGrade: 85,
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
          to="/practice"
          size="medium"
          layout="horizontal"
        />
        <Card
          title="מבחנים"
          description="כאן תוכלו לדמות מבחן אמיתי"
          icon={<LuNotebookPen size={30} />}
          to="/exams"
          size="medium"
          layout="horizontal"
        />
        <Card
          title="סרטונים"
          description="כאן תוכלו לראות סרטוני הסברה"
          icon={<CgPlayButtonO size={30} />}
          to="/videos"
          size="medium"
          layout="horizontal"
        />
        <div className={styles.profile}>
          <h2 className={styles.profileTitle}>פרופיל</h2>
          <div className={styles.profileContent}>
            <p>
              מבחן אחרון: {student.lastTest.name} - {student.lastTest.grade}%
            </p>
            <p>ממוצע ציונים: {student.averageGrade}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
