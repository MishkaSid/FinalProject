"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./welcome.module.css";

/**
 * Reusable Welcome section component with scroll behavior.
 * @param {React.ReactNode} children - The content to scroll to.
 * @returns {JSX.Element}
 */
const Welcome = ({ user = { username: "User" }, children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const nextSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollDown = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className={styles.welcomeContainer}>
        <div className={styles.content}>
          <h1 className={styles.title}>welcome {user.username}</h1>
          <p className={styles.subtitle}>כאן תוכל למצוא מידע על המערכת</p>

          {isVisible && (
            <div className={styles.scrollIndicator} onClick={scrollDown}>
              <p>Scroll Down to Explore</p>
              <div className={styles.chevronContainer}>
                <ChevronDown className={styles.chevron} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={nextSectionRef} className={styles.nextSection}>
        {children}
      </div>
    </>
  );
};

export default Welcome;
