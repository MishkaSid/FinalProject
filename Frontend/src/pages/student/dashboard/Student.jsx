import React, { useState, useEffect, useCallback } from "react";
import styles from "./student.module.css";
import Card from "../../../components/card/Card";
import { FiBook } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import { CgPlayButtonO } from "react-icons/cg";
import { FiUser, FiAward, FiTrendingUp, FiX, FiCheck, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Popup from "../../../components/popup/Popup";

/**
 * The StudentDashboard component renders the main page for students.
 * It contains a hero section with the student's name and course, and a dashboard
 * with a card containing a link to exercises for the course.
 *
 * @returns {JSX.Element} The rendered StudentDashboard component.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Debug user data
  console.log('StudentDashboard rendered with user:', user);
  console.log('User ID:', user?.id);
  console.log('User UserID:', user?.UserID);
  console.log('Current refreshing state:', refreshing);
  console.log('Current dashboard data:', dashboardData);

  // Fetch dashboard data (includes last exam and average)
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.id && !user?.UserID) {
      console.log('No user ID available, using default data');
      setRefreshing(false);
      setDashboardData({
        user: { name: "סטודנט", role: "student" },
        lastExam: null,
        overallAverage: 0,
        totalExams: 0
      });
      return;
    }

    try {
      if (forceRefresh) {
        console.log('Setting refreshing to true');
        setRefreshing(true);
      }
      setError(null);

      const userId = user?.id || user?.UserID;
      console.log('Fetching dashboard data for user:', userId);

      const response = await fetch(
        `http://localhost:5000/api/student/dashboard/${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard API response:', data);
      
      // Validate and normalize the data structure
      const normalizedData = {
        user: {
          id: data.user?.id || userId,
          name: data.user?.name || user?.name || "סטודנט",
          email: data.user?.email || "student@example.com",
          course: data.user?.course || "מתמטיקה"
        },
        lastExam: data.lastExam || null,
        overallAverage: data.overallAverage || 0,
        totalExams: data.totalExams || 0
      };
      
      setDashboardData(normalizedData);
      console.log('Dashboard data updated:', normalizedData);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      
      // Fallback to default data
      setDashboardData({
        user: { 
          id: user?.id || user?.UserID,
          name: user?.name || "סטודנט", 
          role: "student" 
        },
        lastExam: null,
        overallAverage: 0,
        totalExams: 0
      });
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, user?.UserID, user?.name]);

  // Initial data fetch - only run once when user changes
  useEffect(() => {
    console.log('Initial data fetch effect triggered with user:', user);
    if (user) {
      console.log('User available, calling fetchDashboardData');
      fetchDashboardData();
    } else {
      console.log('No user available, setting default data immediately');
      // If no user, set default data immediately
      setDashboardData({
        user: { name: "סטודנט", role: "student" },
        lastExam: null,
        overallAverage: 0,
        totalExams: 0
      });
    }
  }, [user?.id, user?.UserID]); // Only depend on user ID changes, not the function

  // Refresh data when component gains focus (e.g., returning from exam)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, refreshing dashboard data');
      if (user) {
        fetchDashboardData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, fetchDashboardData]);

  // Refresh data when navigating back to this page
  useEffect(() => {
    const handlePopState = () => {
      console.log('Navigation detected, refreshing dashboard data');
      if (user) {
        fetchDashboardData(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, fetchDashboardData]);

  // Listen for exam completion events
  useEffect(() => {
    const handleExamCompleted = (event) => {
      console.log('Exam completed event received, refreshing dashboard data');
      const { userId } = event.detail;
      if (userId === (user?.id || user?.UserID)) {
        // Add a small delay to ensure the exam data is saved
        setTimeout(() => {
          if (user) {
            fetchDashboardData(true);
          }
        }, 500);
      }
    };

    window.addEventListener('examCompleted', handleExamCompleted);
    return () => window.removeEventListener('examCompleted', handleExamCompleted);
  }, [user, fetchDashboardData]);

  // Manual refresh function
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchDashboardData(true);
  };

  // Always show the dashboard, never show loading
  const studentData = dashboardData || {
    user: { name: user?.name || "סטודנט", role: "student" },
    lastExam: null,
    overallAverage: 0
  };

  // Fetch subjects from backend using general data endpoint
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/topics/getTopics"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }

      const data = await response.json();
      // Transform the data to match our component structure
      const transformedSubjects = data.map((topic) => ({
        id: topic.TopicID,
        name: topic.TopicName,
        description: `נושא: ${topic.TopicName}`,
        courseName: topic.CourseName || "מתמטיקה",
      }));
      setSubjects(transformedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      // Fallback to mock data
      const mockSubjects = [
        {
          id: 1,
          name: "אלגברה ליניארית",
          description: "נושא: אלגברה ליניארית",
          courseName: "מתמטיקה",
        },
        {
          id: 2,
          name: "חשבון דיפרנציאלי",
          description: "נושא: חשבון דיפרנציאלי",
          courseName: "מתמטיקה",
        },
        {
          id: 3,
          name: "גאומטריה",
          description: "נושא: גאומטריה",
          courseName: "מתמטיקה",
        },
        {
          id: 4,
          name: "סטטיסטיקה",
          description: "נושא: סטטיסטיקה",
          courseName: "מתמטיקה",
        },
        {
          id: 5,
          name: "טריגונומטריה",
          description: "נושא: טריגונומטריה",
          courseName: "מתמטיקה",
        },
      ];
      setSubjects(mockSubjects);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handlePracticeClick = () => {
    setShowSubjectModal(true);
    fetchSubjects(); // Fetch subjects when modal opens
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleStartPractice = () => {
    if (selectedSubject) {
      navigate(`/student/practice-dashboard/${selectedSubject.id}`);
      setShowSubjectModal(false);
      setSelectedSubject(null);
    }
  };

  const handleStartExam = () => {
    navigate('/student/exam');
    setShowSubjectModal(false);
    setSelectedSubject(null);
  };

  const handleCloseModal = () => {
    setShowSubjectModal(false);
    setSelectedSubject(null);
  };

  return (
    <div className={styles.studentPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground} />
        {/* Content on the right */}
        <div className={styles.heroContent}>
          <h1 className={styles.title}>שלום, {studentData.user.name}</h1>
          <p className={styles.subTitle}>מתמטיקה</p>
        </div>
        {/* Profile Section on the left */}
                 <div className={styles.heroProfile}>
          
          {/* Small loading indicator when refreshing */}
          {refreshing && (
            <div style={{background: 'rgba(255,255,255,0.2)', padding: '5px', margin: '5px', borderRadius: '5px', textAlign: 'center'}}>
              <div className={styles.miniSpinner} style={{margin: '0 auto'}}></div>
              <span style={{color: 'white', fontSize: '12px'}}>מרענן נתונים...</span>
            </div>
          )}
          
          {/* Error display in profile area */}
          {error && (
            <div style={{background: 'rgba(255,0,0,0.2)', padding: '5px', margin: '5px', borderRadius: '5px', textAlign: 'center', border: '1px solid rgba(255,0,0,0.3)'}}>
              <span style={{color: 'white', fontSize: '12px'}}>שגיאה: {error}</span>
              <button 
                onClick={handleRefresh} 
                style={{
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '2px 8px', 
                  borderRadius: '3px', 
                  fontSize: '10px', 
                  marginLeft: '5px',
                  cursor: 'pointer'
                }}
              >
                נסה שוב
              </button>
            </div>
          )}
          
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
                  {(() => {
                    if (studentData.lastExam) {
                      try {
                        const date = new Date(studentData.lastExam.date);
                        if (isNaN(date.getTime())) {
                          return `${studentData.lastExam.date} - ${studentData.lastExam.grade || 0}%`;
                        }
                        const formattedDate = date.toLocaleDateString('he-IL');
                        const grade = studentData.lastExam.grade || 0;
                        return `${formattedDate} - ${grade}%`;
                      } catch (error) {
                        return `${studentData.lastExam.date} - ${studentData.lastExam.grade || 0}%`;
                      }
                    } else {
                      return "לא נעשה מבחן עדיין";
                    }
                  })()}
                </span>
              </div>
            </div>
                         <div className={styles.profileStat}>
               <FiTrendingUp className={styles.statIcon} />
               <div className={styles.statInfo}>
                 <span className={styles.statLabel}>ממוצע ציונים:</span>
                 <span className={styles.statValue}>
                   {studentData.overallAverage > 0 
                     ? `${studentData.overallAverage.toFixed(2)}%` 
                     : "—"
                   }
                 </span>
               </div>
             </div>
             <div className={styles.profileStat}>
               <FiAward className={styles.statIcon} />
               <div className={styles.statInfo}>
                 <span className={styles.statLabel}>סה"כ מבחנים:</span>
                 <span className={styles.statValue}>
                   {studentData.totalExams > 0 
                     ? studentData.totalExams 
                     : "0"
                   }
                 </span>
               </div>
             </div>
          </div>
          
          {/* Refresh button for manual data refresh */}
          <button 
            onClick={handleRefresh} 
            className={styles.refreshButton}
            title="רענן נתונים"
            disabled={refreshing}
          >
            {refreshing ? (
              <div className={styles.miniSpinner}></div>
            ) : (
              <FiRefreshCw size={16} />
            )}
            {refreshing ? 'מרענן...' : 'רענן'}
          </button>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className={styles.dashboard}>
        <h2 className={styles.dashboardTitle}>מה תרצו לעשות היום?</h2>
        <div className={styles.cardContainer}>
          <Card
            title="תרגול כללי"
            description="תרגול שאלות מכל הנושאים הזמינים"
            icon={<FiBook size={30} />}
            onClick={() => navigate('/student/practice')}
            size="large"
            layout="horizontal"
          />
          <Card
            title="תרגול נושא ספציפי"
            description="תרגול שאלות מנושא מסוים"
            icon={<FiBook size={30} />}
            onClick={handlePracticeClick}
            size="large"
            layout="horizontal"
          />
          <Card
            title="הדמיית מבחן"
            description="כאן תוכלו לדמות מבחן אמיתי"
            icon={<LuNotebookPen size={30} />}
                         onClick={() => navigate('/student/exam')}
            size="large"
            layout="horizontal"
          />
        </div>
      </div>

      {/* Subject Selection Modal */}
      {showSubjectModal && (
        <Popup
          isOpen={showSubjectModal}
          onClose={handleCloseModal}
          header="בחר נושא לתרגול"
        >
          <div className={styles.modalContent}>
            <p className={styles.modalDescription}>
              בחר את הנושא שברצונך לתרגל היום
            </p>

            {subjectsLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>טוען נושאים...</p>
              </div>
            ) : subjects.length > 0 ? (
              <div className={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`${styles.subjectCard} ${
                      selectedSubject?.id === subject.id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <div className={styles.subjectInfo}>
                      <h3>{subject.name}</h3>
                      <p>{subject.description}</p>
                    </div>
                    {selectedSubject?.id === subject.id && (
                      <div className={styles.checkIcon}>
                        <FiCheck />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noSubjects}>
                <p>לא נמצאו נושאים זמינים</p>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <div className={styles.modalActions}>
              <button
                className={`${styles.startButton} ${styles.practiceButton} ${
                  selectedSubject ? styles.active : styles.disabled
                }`}
                onClick={handleStartPractice}
                disabled={!selectedSubject}
              >
                <FiBook />
                התחל תרגול
              </button>
              <button
                className={`${styles.startButton} ${styles.examButton} ${
                  selectedSubject ? styles.active : styles.disabled
                }`}
                onClick={handleStartExam}
                disabled={!selectedSubject}
              >
                <LuNotebookPen />
                התחל מבחן
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
    
  );
}