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
import Practice from "../pages/student/practice/practice questions/practice";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
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
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route
                path="/teacher/manageContent"
                element={<ManageContent />}
              />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/practice-dashboard" element={<PracticeDashboard />} />
              <Route path ="/student/practice" element={<Practice />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
