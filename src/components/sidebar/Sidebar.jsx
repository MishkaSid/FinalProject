import { Link } from "react-router-dom";
import { FiUsers, FiUpload, FiBookOpen, FiMenu } from "react-icons/fi";
import styles from "./sidebar.module.css";
import { useState } from "react";

function Sidebar({ isOpen, setIsOpen }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`}>
      <button className={styles.menuToggle} onClick={() => setExpanded(!expanded)}>
        <FiMenu size={30} />
      </button>
      
      <ul className={styles.navLinks}>
        <li>
          <Link to="/manager/permissions">
            <FiUsers size={30} className={styles.icon} />
            {expanded && <span>הרשאות משתמשים</span>}
          </Link>
        </li>
        <li>
          <Link to="/manager/upload">
            <FiUpload size={30} className={styles.icon} />
            {expanded && <span>העלאת טבלאות</span>}
          </Link>
        </li>
        <li>
          <Link to="/manager/manageContent">
            <FiBookOpen size={30} className={styles.icon} />
            {expanded && <span>תרגילים ושאלות</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
