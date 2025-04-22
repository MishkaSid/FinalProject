import React from "react";
import styles from "./teacher.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState } from "react";
import "../pages.css";
import GradesDistributionChart from "../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../components/charts/QuestionStatsChart";


const TeacherDashboard = () => {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
   const navigate = useNavigate();
 
   const handleNavigation = (route) => {
     navigate(route);
   };
 
   return (
     <div className={styles.container}>
       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
 
       <div className={`pageContent ${isSidebarOpen ? "blurred" : ""}`}>
         <div className={styles.background}></div>
 
         <div className={styles.teacherPage}>
           <h1 className={styles.welcomeText}>Welcome, Teacher!</h1>
           <div className={styles.chartsGrid}>
             <QuestionStatsChart /> 
             <GradesDistributionChart />
           </div>
         </div>
       </div>
     </div>
   );
};

export default TeacherDashboard;
