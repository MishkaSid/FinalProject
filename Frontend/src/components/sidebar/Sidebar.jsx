// בקובץ זה נמצא רכיב סרגל הצד לניווט במערכת
// הקובץ מציג תפריט ניווט שונה לפי תפקיד המשתמש ומאפשר התנתקות
// הוא מספק גישה מהירה לכל הדפים הרלוונטיים לכל סוג משתמש
// Frontend/src/components/sidebar/Sidebar.jsx
import { Link , useNavigate } from "react-router-dom";
import { FiUsers, FiHome, FiBookOpen, FiBook, FiMenu, FiLogOut } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import styles from "./sidebar.module.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
/**
 * Sidebar component for navigation.
 *
 * This component renders a sidebar with navigation links based on the user type.
 * It can be toggled between expanded and collapsed states.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the sidebar is open.
 * @param {function} props.setIsOpen - Function to toggle the open state of the sidebar.
 * @param {string} [props.userType="guest"] - The type of user to determine which menu items to render.
 *
 * @returns {JSX.Element} The rendered sidebar component.
 */
function Sidebar({ isOpen, setIsOpen, userType = "guest" }) {
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(isOpen);

  const menuItems = {
    Admin: [
      { to: "/manager", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/manager/permissions", icon: <FiUsers size={30} className={styles.icon} />, label: "ניהול משתמשים" },
      { to: "/manager/manageContent", icon: <FiBookOpen size={30} className={styles.icon} />, label: "ניהול תכנים" }
    ],
    Teacher: [
      { to: "/teacher", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/teacher/manageContent", icon: <FiBookOpen size={30} className={styles.icon} />, label: "שיעורים" }
    ],
    Examinee: [
      { to: "/student", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/student/practice", icon: <FiBook size={30} className={styles.icon} />, label: "תרגול כללי" },
      { to: "/student/exam", icon: <LuNotebookPen size={30} className={styles.icon} />, label:" הדמיית מבחן" }
    ],
    guest: []
  };

  /**
   * Logs out the user and navigates to the homepage.
   * @function
   */
  function hadleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`}>
      <button className={styles.menuToggle} onClick={() => {
        setIsOpen(!isOpen);
        setExpanded(!expanded);
      }}>
        <FiMenu size={30} />
      </button>

      <ul className={styles.navLinks}>
        {(menuItems[userType] || []).map((item, index) => (
          <li key={index}>
            <Link to={item.to}>
              {item.icon}
              {expanded && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <button className={styles.logoutButton} onClick={hadleLogout}>
        <FiLogOut size={30} />
        {expanded && <span>התנתק/י</span>}
      </button>
    </div>
  );
}

export default Sidebar;