import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Login from "../pages/Login/Login-page";
import Manager from "../pages/manager/Manager";
import TeacherDashboard from "../pages/teacher/Teacher";
import Student from "../pages/student/Student";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import "./app.css";

function App() {
  
  
  return (
    <BrowserRouter>
      <div className="app"> 
        <Header />
        <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/manager" element={<Manager />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<Student/>} />
            </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
