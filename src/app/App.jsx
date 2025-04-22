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
              <Route path="/student" element={<Student/>} />
              <Route path ="*" element={<NotFound />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
