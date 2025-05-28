import "../../pages.css";
import styles from "./manager.module.css";
import GradesDistributionChart from "../../../components/charts/GradeDistributionChart";
import QuestionStatsChart from "../../../components/charts/QuestionStatsChart";
import StudentUsageChart from "../../../components/charts/StudentUsageChart";
import Welcome from "../../../components/welcome/Welcome";

/**
 * The Manager component renders the main page for managers.
 * It contains a sidebar with links to relevant pages, and a main content area
 * with three charts: a question statistics chart, a student usage chart, and a
 * grades distribution chart.
 *
 * @returns {JSX.Element} The rendered Manager component.
 */

function Manager() {
  return (
    <div className={styles.adminPage}>
      <Welcome user={{ username: "Shani" }}>
        <div className={styles.background} />
        <div className={styles.managerPage}>
          <div className={styles.chartsGrid}>
            <QuestionStatsChart />
            <StudentUsageChart />
            <GradesDistributionChart />
          </div>
        </div>
      </Welcome>
    </div>
  );
}

export default Manager;
