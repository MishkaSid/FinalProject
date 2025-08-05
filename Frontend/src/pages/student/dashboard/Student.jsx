import React, { useState, useEffect } from "react";
import styles from "./student.module.css";
import Card from "../../../components/card/Card";
import { FiBook } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import { CgPlayButtonO } from "react-icons/cg";
import { FiUser, FiAward, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

/**
 * The StudentDashboard component renders the main page for students.
 * It contains a hero section with the student's name and course, and a dashboard
 * with a card containing a link to exercises for the course.
 *
 * @returns {JSX.Element} The rendered StudentDashboard component.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use user.id if available, otherwise use a default value or skip API call
        const userId = user?.id || user?.UserID || '1';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`http://localhost:5000/api/student/dashboard/${userId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        if (err.name === 'AbortError') {
          setError('Request timeout - using demo data');
        } else {
          setError(err.message);
        }
        
        // Fallback to mock data if API fails
        setDashboardData({
          user: {
            name: user?.name || "סטודנט",
            course: user?.course || "מתמטיקה"
          },
          lastTest: {
            name: "מבחן שברים",
            grade: 85
          },
          averageGrade: 78
        });
      } finally {
        setLoading(false);
      }
    };

    // Always run the effect, even if user is not fully loaded
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.studentPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const studentData = dashboardData || {
    user: {
      name: user?.name || "סטודנט",
      course: user?.course || "מתמטיקה"
    },
    lastTest: {
      name: "מבחן שברים",
      grade: 85
    },
    averageGrade: 78
  };

  return (
    <div className={styles.studentPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground} />
        {/* Content on the right */}
        <div className={styles.heroContent}>
          <h1 className={styles.title}>שלום, {studentData.user.name}</h1>
          <p className={styles.subTitle}>{studentData.user.course}</p>
        </div>
        {/* Profile Section on the left */}
        <div className={styles.heroProfile}>
          <h2 className={styles.heroProfileTitle}>
            <FiUser className={styles.profileIcon} />
            פרופיל
          </h2>
          <div className={styles.heroProfileContent}>
            <div className={styles.profileStat}>
              <FiAward className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>מבחן אחרון:</span>
                <span className={styles.statValue}>
                  {studentData.lastTest?.name || "מבחן שברים"} - {studentData.lastTest?.grade || 85}%
                </span>
              </div>
            </div>
            <div className={styles.profileStat}>
              <FiTrendingUp className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>ממוצע ציונים:</span>
                <span className={styles.statValue}>{studentData.averageGrade || 78}%</span>
              </div>
            </div>
          </div>
        </div>
        
        
      </div>

      {/* Dashboard Section */}
      <div className={styles.dashboard}>
        <h2 className={styles.dashboardTitle}>מה תרצו לעשות היום?</h2>
        <div className={styles.cardContainer}>
          <Card
            title="תרגול שאלות"
            description="כאן תמיד יהיו תרגולים למתמטיקה"
            icon={<FiBook size={30} />}
            to="/student/practice"
            size="large"
            layout="horizontal"
          />
          <Card
            title="הדמיית מבחן"
            description="כאן תוכלו לדמות מבחן אמיתי"
            icon={<LuNotebookPen size={30} />}
            to="/exams"
            size="large"
            layout="horizontal"
          />
        </div>
      </div>
    </div>
  );
}

