import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/Login/Login-page';
import UnauthorizedPage from '../pages/unauthorize/Unauthorize';
import ManagerDashboard from '../pages/manager/home/Manager';
import TeacherDashboard from '../pages/teacher/Teacher';
import StudentDashboard from '../pages/student/dashboard/Student';
import NotFound from '../pages/not found/NotFound';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute allowedRoles={['manager', 'teacher', 'student']} />}>
              <Route path="/" element={<ManagerDashboard />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

