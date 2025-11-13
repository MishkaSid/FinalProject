import { Link, useNavigate } from "react-router-dom";
import { FiUsers, FiHome, FiBookOpen, FiBook, FiLogOut } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import styles from "./navbar.module.css";
import { useAuth } from "../../context/AuthContext";

/**
 * Navbar component for navigation.
 *
 * This component renders a horizontal navbar with navigation links based on the user type.
 * Positioned below the header with transparent background.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.userType="guest"] - The type of user to determine which menu items to render.
 *
 * @returns {JSX.Element} The rendered navbar component.
 */

function Navbar({ userType = "guest" }) {
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = {
    Admin: [
      
      { to: "/manager/permissions", icon: <FiUsers size={24} className={styles.icon} />, label: "ניהול משתמשים" },
      { to: "/manager/manageContent", icon: <FiBookOpen size={24} className={styles.icon} />, label: "ניהול תכנים" },
      { to: "/manager", icon: <FiHome size={24} className={styles.icon} />, label: "בית" }
    ],
    Teacher: [
      { to: "/teacher", icon: <FiHome size={24} className={styles.icon} />, label: "בית" },
      { to: "/teacher/manageContent", icon: <FiBookOpen size={24} className={styles.icon} />, label: "ניהול תכנים" }
    ],
    Examinee: [
      { to: "/student/pre-exam", icon: <LuNotebookPen size={24} className={styles.icon} />, label: "הדמיית מבחן" },
      { to: "/student/practice", icon: <FiBook size={24} className={styles.icon} />, label: "תרגול כללי" },
      { to: "/student", icon: <FiHome size={24} className={styles.icon} />, label: "בית" }
    ],
    guest: []
  };

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <ul className={styles.navLinks}>
          {(menuItems[userType] || []).map((item, index) => (
            <li key={index}>
              <Link to={item.to} className={styles.navLink}>
                {item.icon}
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut size={24} />
          <span className={styles.logoutLabel}>התנתק/י</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
