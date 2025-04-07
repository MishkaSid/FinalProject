import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Login from "../Login/Login-page";  
import Manager from "../manager/Manager";
import Student from "../student/Student";
import TeacherDashboard from "../teacher/Teacher";

import Footer from "../components/footer/Footer";
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
