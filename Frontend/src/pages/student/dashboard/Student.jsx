// בקובץ זה נמצא דף הבית הראשי עבור סטודנטים במערכת
// הקובץ מציג מידע אישי על הסטודנט ואפשרויות תרגול ובחינות
// הוא מספק ממשק אינטראקטיבי לגישה לכל הפונקציונליות הלימודית
// Frontend/src/pages/student/dashboard/Student.jsx
import React, { useState, useEffect, useCallback } from "react";
import styles from "./student.module.css";
import Card from "../../../components/card/Card";
import { CgPlayButtonO } from "react-icons/cg";
import { FiBook, FiPenTool } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import ProfileSection from "./ProfileSection";
import SubjectsModal from "./SubjectsModal";

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
  console.log("StudentDashboard: Component rendered with user data:", user);
  console.log("StudentDashboard: User ID from user.id:", user?.id);
  console.log("StudentDashboard: User ID from user.UserID:", user?.UserID);
  console.log("StudentDashboard: Current refreshing state:", refreshing);
  console.log("StudentDashboard: Current dashboard data:", dashboardData);

  // Fetch dashboard data (includes last exam and average)
  // בתוך הקומפוננטה StudentDashboard
  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      const currentUser = user;

      // אימות מזהה משתמש
      if (!currentUser?.id && !currentUser?.UserID) {
        setRefreshing(false);
        setDashboardData({
          user: { name: "משתמש לא מזוהה", role: "student" },
          lastExam: null,
          overallAverage: 0,
          totalExams: 0,
        });
        return;
      }

      try {
        if (forceRefresh) setRefreshing(true);
        setError(null);

        const userId = currentUser?.id || currentUser?.UserID;

        // קבלת טוקן מהדפדפן. אם אתם עובדים עם קוקיז HttpOnly, מחק את headers והוסף credentials: "include"
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/student/dashboard/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            // אם עובדים עם קוקיז HttpOnly במקום Bearer:
            // credentials: "include"
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch dashboard data: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();

        // נרמול מבנה התגובה כדי שלא יפיל את ה־UI במקרה של שדות חסרים
        const normalizedData = {
          user: {
            id: data.user?.id || userId,
            name: data.user?.name || currentUser?.name || "משתמש לא מזוהה",
            email: data.user?.email || currentUser?.email || "",
            course: data.user?.course || currentUser?.course || "מתמטיקה",
          },
          lastExam: data.lastExam || null,
          overallAverage:
            typeof data.overallAverage === "number" ? data.overallAverage : 0,
          totalExams: typeof data.totalExams === "number" ? data.totalExams : 0,
        };

        setDashboardData(normalizedData);
      } catch (err) {
        console.error("StudentDashboard: dashboard fetch error:", err);
        setError(err.message);
        setDashboardData((prev) => ({
          user: {
            id:
              prev?.user?.id || currentUser?.id || currentUser?.UserID || null,
            name: prev?.user?.name || currentUser?.name || "משתמש לא מזוהה",
            role: "student",
          },
          lastExam: null,
          overallAverage: 0,
          totalExams: 0,
        }));
      } finally {
        setRefreshing(false);
      }
    },
    [user?.id, user?.UserID]
  );

  // Initial data fetch - only run once when user changes
  useEffect(() => {
    console.log(
      "StudentDashboard: Initial data fetch effect triggered with user:",
      user
    );
    if (user) {
      console.log(
        "StudentDashboard: User available, calling fetchDashboardData function"
      );
      fetchDashboardData();
    } else {
      console.log(
        "StudentDashboard: No user available, setting default fallback data immediately"
      );
      // If no user, set default data immediately
      setDashboardData({
        user: { name: "משתמש לא מזוהה", role: "student" },
        lastExam: null,
        overallAverage: 0,
        totalExams: 0,
      });
    }
  }, [user?.id, user?.UserID]); // Remove fetchDashboardData dependency to prevent loops

  // Refresh data when component gains focus (e.g., returning from exam)
  useEffect(() => {
    const handleFocus = () => {
      console.log(
        "StudentDashboard: Page focused, refreshing dashboard data from server"
      );
      if (user && !refreshing) {
        fetchDashboardData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refreshing]);

  // Refresh data when navigating back to this page
  useEffect(() => {
    const handlePopState = () => {
      console.log(
        "StudentDashboard: Navigation detected, refreshing dashboard data from server"
      );
      if (user && !refreshing) {
        fetchDashboardData(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user, refreshing]);

  // Listen for exam completion events
  useEffect(() => {
    const handleExamCompleted = (event) => {
      console.log(
        "StudentDashboard: Exam completed event received, refreshing dashboard data from server"
      );
      const { userId } = event.detail;
      if (userId === (user?.id || user?.UserID) && !refreshing) {
        // Add a small delay to ensure the exam data is saved
        setTimeout(() => {
          if (user && !refreshing) {
            fetchDashboardData(true);
          }
        }, 1000);
      }
    };

    window.addEventListener("examCompleted", handleExamCompleted);
    return () =>
      window.removeEventListener("examCompleted", handleExamCompleted);
  }, [user, refreshing]);

  // Manual refresh function
  const handleRefresh = () => {
    console.log(
      "StudentDashboard: Manual refresh button clicked, refreshing data from server"
    );
    if (!refreshing) {
      setError(null); // Clear previous errors
      fetchDashboardData(true);
    }
  };

  // Retry dashboard data fetch with exponential backoff
  const retryDashboardFetch = async (attempt = 1) => {
    if (attempt > 3) {
      setError("נכשל בטעינת נתונים לאחר 3 ניסיונות. אנא נסה שוב מאוחר יותר");
      return;
    }

    try {
      console.log(
        `StudentDashboard: Retry attempt ${attempt} for dashboard data`
      );
      await fetchDashboardData(true);
    } catch (err) {
      console.error(`StudentDashboard: Retry attempt ${attempt} failed:`, err);
      setTimeout(
        () => retryDashboardFetch(attempt + 1),
        Math.pow(2, attempt) * 1000
      );
    }
  };

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (refreshing) {
      const timeout = setTimeout(() => {
        console.log(
          "StudentDashboard: Safety timeout triggered, stopping refresh"
        );
        setRefreshing(false);
        setError("Timeout: נסה שוב או פנה למנהל המערכת");
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [refreshing]);

  // Always show the dashboard, never show loading
  const studentData = dashboardData || {
    user: { name: user?.name || "משתמש לא מזוהה", role: "student" },
    lastExam: null,
    overallAverage: 0,
    totalExams: 0,
  };

  // Check if we have valid data
  const hasValidData =
    dashboardData &&
    dashboardData.user &&
    dashboardData.user.name !== "משתמש לא מזוהה";

  // Fetch subjects from backend using general data endpoint
  const fetchSubjects = useCallback(async (retryCount = 0) => {
    try {
      setSubjectsLoading(true);
      // Only clear error on fresh fetch, not on retries
      if (retryCount === 0) {
        setError(null);
      }
      console.log("StudentDashboard: Fetching subjects from server...");

      const response = await fetch(
        "http://localhost:5000/api/topics/getTopics",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "StudentDashboard: Subjects API error:",
          response.status,
          errorText
        );
        throw new Error(
          `Failed to fetch subjects: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("StudentDashboard: Subjects API response received:", data);

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      // Get user's courseId for filtering
      const userCourseId = user?.courseId;
      console.log("StudentDashboard: Filtering topics for courseId:", userCourseId);

      // Filter topics by user's courseId if available
      let filteredData = data;
      if (userCourseId) {
        filteredData = data.filter((topic) => topic.CourseID === userCourseId);
        console.log(
          `StudentDashboard: Filtered ${filteredData.length} topics out of ${data.length} for courseId ${userCourseId}`
        );
      } else {
        console.warn("StudentDashboard: No courseId found for user, showing all topics");
      }

      // Transform the data to match our component structure
      const transformedSubjects = filteredData.map((topic) => ({
        id: topic.TopicID,
        name: topic.TopicName,
        description: `נושא: ${topic.TopicName}`,
        courseName: topic.CourseName || "מתמטיקה",
        courseId: topic.CourseID,
      }));

      setSubjects(transformedSubjects);
      console.log(
        "StudentDashboard: Subjects transformed and set:",
        transformedSubjects
      );
    } catch (err) {
      console.error(
        "StudentDashboard: Error fetching subjects from server:",
        err
      );

      // Retry logic for network errors
      if (
        retryCount < 2 &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("Network"))
      ) {
        console.log(
          `StudentDashboard: Retrying subjects fetch, attempt ${retryCount + 1}`
        );
        setTimeout(
          () => fetchSubjects(retryCount + 1),
          1000 * (retryCount + 1)
        );
        return;
      }

      // Set empty array instead of mock data
      setSubjects([]);
      // Show error in the modal
      setError(`שגיאה בטעינת נושאים: ${err.message}`);
    } finally {
      setSubjectsLoading(false);
    }
  }, [user?.courseId]); // Depend on user's courseId for filtering

  const handlePracticeClick = useCallback(() => {
    setShowSubjectModal(true);
    setError(null); // Clear any previous errors
    fetchSubjects(); // Fetch subjects when modal opens
  }, [fetchSubjects]); // Add fetchSubjects dependency

  const handleSubjectSelect = useCallback((subject) => {
    setSelectedSubject(subject);
  }, []);

  const handleStartPractice = useCallback(() => {
    if (selectedSubject) {
      navigate(`/student/practice-dashboard/${selectedSubject.id}`);
      setShowSubjectModal(false);
      setSelectedSubject(null);
    }
  }, [selectedSubject, navigate]);

  const handleStartExam = useCallback(() => {
    navigate("/student/pre-exam");
    setShowSubjectModal(false);
    setSelectedSubject(null);
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    setShowSubjectModal(false);
    setSelectedSubject(null);
    setError(null); // Clear error when modal is closed
  }, []);

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
        <ProfileSection
          studentData={studentData}
          refreshing={refreshing}
          error={error}
          hasValidData={hasValidData}
        />
      </div>

      {/* Dashboard Section */}
      <div className={styles.dashboard}>
        <h2 className={styles.dashboardTitle}>מה תרצו לעשות היום?</h2>
        
        <div className={styles.cardContainer}>
          <Card
            title="תרגול נושא ספציפי"
            description="תרגול שאלות מנושא מסוים לפי בחירתך"
            icon={<FiPenTool size={30} />}
            onClick={handlePracticeClick}
            size="large"
            layout="horizontal"
          />
          <Card
            title="תרגול כללי"
            description="תרגול שאלות מכל הנושאים הזמינים במערכת"
            icon={<FiBook size={30} />}
            onClick={() => navigate("/student/practice")}
            size="large"
            layout="horizontal"
          />
          <Card
            title="הדמיית מבחן"
            description="כאן תוכלו לדמות מבחן אמיתי עם שאלות מכל הנושאים"
            icon={<LuNotebookPen size={30} />}
            onClick={() => navigate("/student/pre-exam")}
            size="large"
            layout="horizontal"
          />
        </div>
      </div>

      {/* Subject Selection Modal */}
      <SubjectsModal
        isOpen={showSubjectModal}
        onClose={handleCloseModal}
        subjects={subjects}
        subjectsLoading={subjectsLoading}
        selectedSubject={selectedSubject}
        error={error}
        onSubjectSelect={handleSubjectSelect}
        onStartPractice={handleStartPractice}
        onStartExam={handleStartExam}
        onRetryFetch={fetchSubjects}
      />
    </div>
  );
}