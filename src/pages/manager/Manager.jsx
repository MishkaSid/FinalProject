import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/card/Card";
import "./manager.css";
import Sidebar from "../components/sidebar/Sidebar";

function Manager() {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="admin-page">
      <Sidebar/>
      {/* Main Content */}
      <div className="manager-page">
        <h1>לוח בקרה למנהל</h1>
        <div className="card-container">
          <Card
            title="הרשאות משתמשים"
            description="ניהול הרשאות הגישה למורים\תלמידים\מנהלי המערכת."
            handleNavigation={() => handleNavigation("/admin-pages/user-permissions/UserPermissions")}
            buttonText="נהל הרשאות"
          />
          
          <Card
            title="העלאת טבלאות "
            description="העלאת טבלאות אקסל להמרה למערכת"
            handleNavigation={() => handleNavigation("/admin-pages/student-data/StudentData")}
            buttonText="העלאת טבלה"
          />

          <Card
            title="ניהול תוכן"
            description="ניהול תרגילים ושאלות לתלמידים"
            handleNavigation={() => handleNavigation("/admin-pages/practice-data/PracticeData")}
            buttonText="נהל תרגילים"
          />
        </div>
      </div>
    </div>
  );
}

export default Manager;
