import { Link } from "react-router-dom";
import { FiUsers, FiHome, FiBookOpen, FiBook, FiMenu } from "react-icons/fi";
import styles from "./sidebar.module.css";
import { useState } from "react";

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
  const [expanded, setExpanded] = useState(isOpen);

  const menuItems = {
    admin: [
      { to: "/manager", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/manager/permissions", icon: <FiUsers size={30} className={styles.icon} />, label: "הרשאות משתמשים" },
      { to: "/manager/manageContent", icon: <FiBookOpen size={30} className={styles.icon} />, label: "ניהול תכנים" }
    ],
    teacher: [
      { to: "/teacher", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/teacher/manageContent", icon: <FiBookOpen size={30} className={styles.icon} />, label: "שיעורים" }
    ],
    student: [
      { to: "/student", icon: <FiHome size={30} className={styles.icon} />, label: "בית" },
      { to: "/practice", icon: <FiBook size={30} className={styles.icon} />, label: "תרגול" }
    ],
    guest: []
  };

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
    </div>
  );
}

export default Sidebar;

