import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";
import { FiUsers, FiUpload, FiBookOpen, FiMenu } from "react-icons/fi";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      {/* Move the toggle button OUTSIDE of the menu list */}
      <button className="menu-toggle" onClick={() => setExpanded(!expanded)}>
        <FiMenu size={30} />
      </button>

      <ul className="nav-links">
        <li>
          <Link to="/admin-pages/user-permissions">
            <FiUsers size={30} className="icon" />
            {expanded && <span>הרשאות משתמשים</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin-pages/student-data">
            <FiUpload size={30} className="icon" />
            {expanded && <span>העלאת טבלאות</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin-pages/practice-data">
            <FiBookOpen size={30} className="icon" />
            {expanded && <span>תרגילים ושאלות</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
