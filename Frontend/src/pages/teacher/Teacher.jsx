// בקובץ זה נמצא דף הבית הראשי עבור מורים במערכת
// הקובץ מציג גרפים סטטיסטיים על ביצועי התלמידים וסטטיסטיקות שאלות
// הוא מספק מידע על התקדמות התלמידים ועל התוכן הלימודי במערכת
// Frontend/src/pages/teacher/Teacher.jsx
import React, { useEffect, useState } from "react";
import styles from "./teacher.module.css";
import managerStyles from "../manager/home/manager.module.css";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import CourseGradesOverTimeChart from "../../components/charts/CourseGradesOverTimeChart";
import TopicFailureRateCard from "../../components/analytics/TopicFailureRateCard";
import DateRangeSelector from "../../components/analytics/DateRangeSelector";
import { getLast30DaysRange } from "../../utils/dateUtils";

/**
 * The TeacherDashboard component renders the main page for teachers.
 * It displays charts showing course grades over time, grade distribution, and topic failure rates.
 *
 * @returns {JSX.Element} The rendered TeacherDashboard component.
 */
const TeacherDashboard = () => {
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
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

  return (
    <div className={styles.teacherPage}>
      <div className={styles.teacherContent}>
        <div className={styles.chartsGrid}>
          {/* Course Grades Over Time Card */}
          <div className={managerStyles.statCard}>
            <h3 className={managerStyles.cardTitle}>מעקב ציונים לאורך זמן</h3>
            <div className={managerStyles.cardControls}>
              <div className={managerStyles.controlRow}>
                <label className={managerStyles.controlLabel}>קורס</label>
                <input
                  type="text"
                  list="courses-list-teacher"
                  className={managerStyles.controlInput}
                  value={courseName || ""}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="חפש או בחר קורס"
                  required
                  style={{ maxWidth: '200px' }}
                />
                <datalist id="courses-list-teacher">
                  {courses.map((course) => (
                    <option key={course.CourseID} value={course.CourseName}>
                      {course.CourseName}
                    </option>
                  ))}
                </datalist>
                <label className={managerStyles.controlLabel}>מתאריך</label>
                <input
                  type="date"
                  className={managerStyles.controlInput}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <label className={managerStyles.controlLabel}>עד תאריך</label>
                <input
                  type="date"
                  className={managerStyles.controlInput}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <div className={managerStyles.buttonRow} style={{ marginTop: 0, marginRight: 'auto' }}>
                  <button
                    className={managerStyles.smallButton}
                    onClick={() => {
                      const { from: fromDate, to: toDate } = getLast30DaysRange();
                      setFrom(fromDate);
                      setTo(toDate);
                    }}
                  >
                    30 יום אחרונים
                  </button>
                  <button
                    className={`${managerStyles.smallButton} ${managerStyles.secondary}`}
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
            <div className={managerStyles.chartContainer}>
              <CourseGradesOverTimeChart
                courseId={courseName ? courses.find(c => c.CourseName === courseName)?.CourseID : ""}
                from={from}
                to={to}
              />
            </div>
          </div>

          {/* Grade Distribution Card */}
          <div className={managerStyles.statCard}>
            <h3 className={managerStyles.cardTitle}>התפלגות ציונים</h3>
            <DateRangeSelector 
              from={gradeFrom} 
              to={gradeTo}
              onFromChange={setGradeFrom}
              onToChange={setGradeTo}
            />
            <div className={managerStyles.chartContainer}>
              <GradesDistributionChart from={gradeFrom} to={gradeTo} />
            </div>
          </div>

          {/* Topic Failure Rate Card */}
          <div className={`${managerStyles.statCard} ${styles.fullWidth}`}>
            <h3 className={managerStyles.cardTitle}>שיעור כישלונות לפי נושא</h3>
            <TopicFailureRateCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
