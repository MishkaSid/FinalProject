// בקובץ זה נמצא הרכיב הראשי של האפליקציה
// הקובץ מגדיר את כל הנתיבים והרכיבים המוגנים במערכת
// הוא מספק את המבנה הבסיסי של הניווט והגישה לפי תפקידים
// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/Login/Login-page";
import ManagerDashboard from "../pages/manager/home/Manager";
import UserPermissions from "../pages/manager/permissions/UserPermissions";
import ManageContent from "../pages/manager/manageContent/ManageContent";
import TeacherDashboard from "../pages/teacher/Teacher";
import StudentDashboard from "../pages/student/dashboard/Student";
import PracticeDashboard from "../pages/student/practice/practice dashboard/PracticeDashboard"
import UnauthorizedPage from "../pages/unauthorize/Unauthorize";
import NotFound from "../pages/not found/NotFound";
import PracticeQuestions from "../pages/student/practice/practice questions/PracticeQuestions";
import Practice from "../pages/student/practice/practice questions/practice";
import PreExam from "../pages/student/exam/PreExam";
import Exam from "../pages/student/exam/Exam";
import AdminVideosPage from "../pages/admin/AdminVideosPage";
import AdminExamQuestionsPage from "../pages/admin/AdminExamQuestionsPage";
import AdminPracticeExercisesPage from "../pages/admin/AdminPracticeExercisesPage";
import ForgotPassword from "../pages/Login/ForgotPassword";
import ResetPassword from "../pages/Login/ResetPassword";

/**
 * The main app component, which wraps the entire app in the AuthProvider and
 * Router components. It also defines the routes for the app, including the
 * login page, unauthorized page, and the protected routes for the manager,
 * teacher, and student dashboards.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["Admin", "Teacher", "Examinee"]} />
            }
          >
            {/* Layout section */}
            <Route element={<Layout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route
                path="/manager/permissions"
                element={<UserPermissions />}
              />
              <Route
                path="/manager/manageContent"
                element={<ManageContent />}
              />
              <Route
                path="/admin/topics/:topicId/videos"
                element={<AdminVideosPage />}
              />
              <Route
                path="/admin/topics/:topicId/exam"
                element={<AdminExamQuestionsPage />}
              />
              <Route
                path="/admin/topics/:topicId/practice"
                element={<AdminPracticeExercisesPage />}
              />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route
                path="/teacher/manageContent"
                element={<ManageContent />}
              />
              <Route path="/student" element={<StudentDashboard />} />
              <Route
                path="/student/practice-dashboard/:topicId"
                element={<PracticeDashboard />}
              />
              <Route
                path="/student/practice-questions/:topicId"
                element={<PracticeQuestions />}
              />
              <Route path="/student/practice" element={<Practice />} />
              <Route path="/student/pre-exam" element={<PreExam />} />
              <Route path="/student/exam" element={<Exam />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
