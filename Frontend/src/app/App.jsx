import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Login from "../pages/Login/Login-page";
import Manager from "../pages/manager/home/Manager";
import UserPermissions from "../pages/manager/permissions/UserPermissions";
import ManageContent from "../pages/manager/manageContent/ManageContent";
import TeacherDashboard from "../pages/teacher/Teacher";
import Student from "../pages/student/Student";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import "./app.css";
import NotFound from "../pages/not found/NotFound";

/**
 * The main App component.
 * This component wraps the entire application with the BrowserRouter
 * component and provides the routes for the application. The routes are
 * as follows:
 * 
 * - / : The login page
 * - /manager : The manager dashboard
 * - /manager/permissions : The permissions management page
 * - /manager/manageContent : The content management page
 * - /teacher : The teacher dashboard
 * - /teacher/manageContent : The content management page for teachers
 * - /student : The student dashboard
 * - * : The not found page
 * 
 * The App component also includes a Header and Footer component.
 */
function App() {
  
  return (
    <BrowserRouter>
      <div className="app"> 
        <Header />
        <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/manager" element={<Manager />} />
              <Route path="/manager/permissions" element={<UserPermissions />} />
              <Route path="/manager/manageContent" element={<ManageContent />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/manageContent" element={<ManageContent />} />
              <Route path="/student" element={<Student/>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
