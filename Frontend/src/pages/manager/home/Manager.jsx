// בקובץ זה נמצא דף הבית הראשי עבור מנהלים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי המערכת ושימוש הסטודנטים
// הוא מספק מידע מקיף על פעילות המערכת עבור מנהלים
// Frontend/src/pages/manager/home/Manager.jsx
import "../../pages.css";
import styles from "./manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import SiteVisitStats from "../../../components/analytics/SiteVisitStats";
import { useAuth } from "../../../context/AuthContext";
import React, { useEffect, useState } from "react";
import CourseGradesOverTimeChart from "../../../components/charts/CourseGradesOverTimeChart";
import { getSiteVisitsCount } from "../../../services/analyticsApi";
import StudentAvgLastExamsCard from "../../../components/analytics/StudentAvgLastExamsCard";
import StudentsReportCard from "../../../components/analytics/StudentsReportCard";
import TopicFailureRateCard from "../../../components/analytics/TopicFailureRateCard";
import DateRangeSelector from "../../../components/analytics/DateRangeSelector";
import { getLast30DaysRange } from "../../../utils/dateUtils";

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
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visFrom, setVisFrom] = useState("");
  const [visTo, setVisTo] = useState("");
  const [visSeries, setVisSeries] = useState([]);
  const [gradeFrom, setGradeFrom] = useState("");
  const [gradeTo, setGradeTo] = useState("");

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/courses/getCourses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        const coursesList = Array.isArray(data) ? data : [];
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    async function loadVisits() {
      try {
        const { series } = await getSiteVisitsCount(visFrom, visTo);
        setVisSeries(series);
      } catch (e) {
        console.error("visits load error", e);
      }
    }
    loadVisits();
  }, [visFrom, visTo]);

  return (
    <div className={styles.adminPage}>
        <div className={styles.background} />
      
      {/* Statistics Cards Grid */}
        <div className={styles.managerPage}>
        <div className={styles.cardsGrid}>
          {/* Report Cards */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>דוח סטודנטים</h3>
            <StudentsReportCard />
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>ממוצע ציונים אחרונים</h3>
            <StudentAvgLastExamsCard />
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>שיעור כישלונות לפי נושא</h3>
            <TopicFailureRateCard />
          </div>

          {/* Course Grades Card */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>מעקב ציונים לאורך זמן</h3>
            <div className={styles.cardControls}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>קורס</label>
                <input
                  type="text"
                  list="courses-list-manager"
                  className={styles.controlInput}
                  value={courseName || ""}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="חפש או בחר קורס"
                  required
                  style={{ maxWidth: '200px' }}
                />
                <datalist id="courses-list-manager">
                  {courses.map((course) => (
                    <option key={course.CourseID} value={course.CourseName}>
                      {course.CourseName}
                    </option>
                  ))}
                </datalist>
                <label className={styles.controlLabel}>מתאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <label className={styles.controlLabel}>עד תאריך</label>
                <input
                  type="date"
                  className={styles.controlInput}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <div className={styles.buttonRow} style={{ marginTop: 0, marginRight: 'auto' }}>
                  <button
                    className={styles.smallButton}
                    onClick={() => {
                      const { from: fromDate, to: toDate } = getLast30DaysRange();
                      setFrom(fromDate);
                      setTo(toDate);
                    }}
                  >
                    30 יום אחרונים
                  </button>
                  <button
                    className={`${styles.smallButton} ${styles.secondary}`}
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                  >
                    נקה
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <CourseGradesOverTimeChart
                courseId={courseName ? courses.find(c => c.CourseName === courseName)?.CourseID : ""}
                from={from}
                to={to}
              />
            </div>
          </div>

          {/* Site Visits Card */}
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>סטטיסטיקות כניסות לאתר</h3>
            <DateRangeSelector 
              from={visFrom} 
              to={visTo}
              onFromChange={setVisFrom}
              onToChange={setVisTo}
            />
            <div className={styles.chartContainer}>
              <SiteVisitStats from={visFrom} to={visTo} />
            </div>
          </div>

          {/* Charts Cards */}
          {user?.role === "Teacher" && (
            <div className={styles.statCard}>
              <h3 className={styles.cardTitle}>סטטיסטיקות שאלות</h3>
              <div className={styles.chartContainer}>
                <QuestionStatsChart />
              </div>
            </div>
          )}
          
          <div className={styles.statCard}>
            <h3 className={styles.cardTitle}>התפלגות ציונים</h3>
            <DateRangeSelector 
              from={gradeFrom} 
              to={gradeTo}
              onFromChange={setGradeFrom}
              onToChange={setGradeTo}
            />
            <div className={styles.chartContainer}>
              <GradesDistributionChart from={gradeFrom} to={gradeTo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Manager;
