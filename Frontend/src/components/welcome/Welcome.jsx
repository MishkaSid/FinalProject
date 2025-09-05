import { ChevronDown } from "lucide-react";
import { scroller, Element } from "react-scroll";
import styles from "./welcome.module.css";

/**
 * Scroll down to the next section of the page.
 * @function
 * @return {JSX.Element} No return value.
 */
function Welcome({ user = { username: "User" }, children }) {
  /**
   * Scroll down to the next section of the page.
   * @function
   * @return {none} No return value.
   * @description
   *   This function uses the `react-scroll` module to scroll down to the
   *   element with the `nextSection` name. The animation is set to last 800ms
   *   and to use the `easeInOutQuart` timing function.
   */
  const scrollDown = () => {
    scroller.scrollTo("nextSection", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  return (
    <>
      <section className={styles.welcomeContainer}>
        <div className={styles.content}>
          <h1 className={styles.title}>Welcome {user.username}</h1>
          <p className={styles.subtitle}>כאן תוכל למצוא מידע על המערכת</p>

          <div className={styles.scrollIndicator} onClick={scrollDown}>
            <p>Scroll Down to Explore</p>
            <div className={styles.chevronContainer}>
              <ChevronDown className={styles.chevron} />
            </div>
          </div>
        </div>
      </section>

      <Element name="nextSection" className={styles.nextSection}>
        {children}
      </Element>
    </>
  );
}

export default Welcome;
