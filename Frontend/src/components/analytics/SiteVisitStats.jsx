import React, { useState, useEffect } from "react";
import { getSiteVisitStats } from "../../services/analyticsApi";
import styles from "./SiteVisitStats.module.css";

/**
 * Enhanced Site Visit Statistics Component
 * - Shows aggregated stats by default (total examinees, who visited, percentage)
 * - When user ID entered: shows specific user's name, last visit, and total visits
 * - Supports date range filtering
 */
export default function SiteVisitStats({ from, to }) {
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const loadStats = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getSiteVisitStats({
        userId: userId || undefined,
        from,
        to,
      });
      setStats(data);
    } catch (err) {
      console.error("Error loading site visit stats:", err);
      setError(err.message || "Failed to load statistics");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadStats();
  };

  const handleClear = () => {
    setUserId("");
    setError("");
    // Reload with no userId
    loadStatsWithoutId();
  };

  const loadStatsWithoutId = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getSiteVisitStats({ from, to });
      setStats(data);
    } catch (err) {
      console.error("Error loading site visit stats:", err);
      setError(err.message || "Failed to load statistics");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "לא זמין";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatRangeDisplay = (fromDate, toDate) => {
    const formatSingle = (value) => {
      if (!value) return "";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return parsed.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const fromLabel = formatSingle(fromDate);
    const toLabel = formatSingle(toDate);

    if (fromLabel && toLabel) return `${fromLabel} עד ${toLabel}`;
    return fromLabel || toLabel || "ללא טווח תאריכים";
  };

  return (
    <div className={styles.container}>
      {/* User ID Input */}
      <div className={styles.controls}>
        <label className={styles.label}>
          <span className={styles.labelText}>חיפוש לפי ת.ז</span>
          <input
            type="text"
            className={styles.input}
            placeholder="הכנס ת.ז"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </label>
        <div className={styles.buttonGroup}>
          <button className={styles.primaryButton} onClick={handleSearch}>
            חפש
          </button>
          <button className={styles.secondaryButton} onClick={handleClear}>
            נקה
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        {/* Loading State */}
        {loading && (
          <div className={`${styles.feedback} ${styles.loading}`}>
            טוען נתונים...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`${styles.feedback} ${styles.error}`}>{error}</div>
        )}

        {/* Results */}
        {!loading && !error && stats && (
          <>
            {/* Specific User View */}
            {stats.userId && (
              <div className={styles.userCard}>
                {stats.found ? (
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>פרטי משתמש</h3>
                    <span className={styles.sectionSubtitle}>
                      {formatRangeDisplay(from, to)}
                    </span>
                  </div>
                ) : (
                  <div className={styles.notFound}>
                    <p>משתמש לא נמצא או שאינו נבחן</p>
                  </div>
                )}
                {stats.found && (
                  <div className={styles.userDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>שם:</span>
                      <span className={styles.detailValue}>{stats.name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ת.ז:</span>
                      <span className={styles.detailValue}>{stats.userId}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ביקור אחרון:</span>
                      <span className={styles.detailValue}>
                        {formatDate(stats.lastVisit)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>סה"כ ביקורים:</span>
                      <span className={styles.detailValueHighlight}>
                        {stats.totalVisits}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Aggregated View */}
            {!stats.userId && (
              <div className={styles.aggregatedCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>סטטיסטיקות כניסות לאתר</h3>
                  <span className={styles.sectionSubtitle}>
                    {formatRangeDisplay(stats.from, stats.to)}
                  </span>
                </div>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.totalExaminees}</div>
                    <div className={styles.statLabel}>סה"כ נבחנים במערכת</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>
                      {stats.examinessWhoVisited ??
                        stats.examineesWhoVisited ??
                        stats.visitors ??
                        0}
                    </div>
                    <div className={styles.statLabel}>
                      נבחנים שביקרו בטווח זה
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div
                      className={`${styles.statValue} ${styles.percentageValue}`}
                    >
                      {stats.percentage}%
                    </div>
                    <div className={styles.statLabel}>אחוז ביקורים</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

