import React, { useState, useEffect } from "react";
import styles from "./student.module.css";
import Card from "../../../components/card/Card";
import { FiBook } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import { CgPlayButtonO } from "react-icons/cg";
import { FiUser, FiAward, FiTrendingUp, FiX, FiCheck } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

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

  // Fetch subjects from backend using general data endpoint
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await fetch('http://localhost:5000/api/topics/getTopics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      
      const data = await response.json();
      // Transform the data to match our component structure
      const transformedSubjects = data.map(topic => ({
        id: topic.TopicID,
        name: topic.TopicName,
        description: `נושא: ${topic.TopicName}`,
        courseName: topic.CourseName || "מתמטיקה"
      }));
      setSubjects(transformedSubjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      // Fallback to mock data
      const mockSubjects = [
        { id: 1, name: "אלגברה ליניארית", description: "נושא: אלגברה ליניארית", courseName: "מתמטיקה" },
        { id: 2, name: "חשבון דיפרנציאלי", description: "נושא: חשבון דיפרנציאלי", courseName: "מתמטיקה" },
        { id: 3, name: "גאומטריה", description: "נושא: גאומטריה", courseName: "מתמטיקה" },
        { id: 4, name: "סטטיסטיקה", description: "נושא: סטטיסטיקה", courseName: "מתמטיקה" },
        { id: 5, name: "טריגונומטריה", description: "נושא: טריגונומטריה", courseName: "מתמטיקה" }
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
      navigate(`/student/practice-dashboard/`);
      setShowSubjectModal(false);
      setSelectedSubject(null);
    }
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
            onClick={handlePracticeClick}
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

      {/* Subject Selection Modal */}
      {showSubjectModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>בחר נושא לתרגול</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            
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
                         selectedSubject?.id === subject.id ? styles.selected : ''
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
              <button
                className={`${styles.startButton} ${
                  selectedSubject ? styles.active : styles.disabled
                }`}
                onClick={handleStartPractice}
                disabled={!selectedSubject}
              >
                <FiBook />
                התחל תרגול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

