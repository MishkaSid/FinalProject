// בקובץ זה נמצא דף הבית הראשי עבור מנהלים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי המערכת ושימוש הסטודנטים
// הוא מספק מידע מקיף על פעילות המערכת עבור מנהלים
// Frontend/src/pages/manager/home/Manager.jsx
import "../../pages.css";
import styles from "./manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import StudentUsageChart from "../../../components/charts/StudentUsageChart";
import { useAuth } from "../../../context/AuthContext";
import React, { useState } from "react";
import CourseGradesOverTimeChart from "../../../components/charts/CourseGradesOverTimeChart";

/**
 * The Manager component renders the main page for managers.
 * It contains a sidebar with links to relevant pages, and a main content area
 * with three charts: a question statistics chart, a student usage chart, and a
 * grades distribution chart.
 *
 * @returns {JSX.Element} The rendered Manager component.
 */
function Manager() {
  const { user } = useAuth();
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <div className={styles.adminPage}>
      <div className={styles.background} />
      <div className={styles.managerPage}>
        <div className={styles.chartsGrid}>
          {/* Controls for courseId and date range */}
          <div className={styles.chartCard} style={{ padding: 16 }}>
            <h2 style={{ marginBottom: 12 }}>
              Course grades over time - controls
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <label
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span>Course ID</span>
                <input
                  type="text"
                  placeholder="Enter courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span>From</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span>To</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <button
                  onClick={() => {
                    // Quick set: last 30 days
                    const now = new Date();
                    const toStr = now.toISOString().slice(0, 10);
                    const fromD = new Date(now);
                    fromD.setDate(fromD.getDate() - 30);
                    const fromStr = fromD.toISOString().slice(0, 10);
                    setFrom(fromStr);
                    setTo(toStr);
                  }}
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  Clear range
                </button>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <CourseGradesOverTimeChart
                courseId={courseId}
                from={from}
                to={to}
              />
            </div>
          </div>
          {user?.role === "Teacher" && <QuestionStatsChart />}
          <StudentUsageChart />
          <GradesDistributionChart />
        </div>
      </div>
    </div>
  );
}

export default Manager;
