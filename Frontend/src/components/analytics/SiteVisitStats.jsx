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
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </label>
        <div className={styles.buttonGroup}>
          <button className={styles.searchButton} onClick={handleSearch}>
            חפש
          </button>
          <button className={styles.clearButton} onClick={handleClear}>
            נקה
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div className={styles.loading}>טוען נתונים...</div>}

      {/* Error State */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Results */}
      {!loading && !error && stats && (
        <>
          {/* Specific User View */}
          {stats.userId && (
            <div className={styles.userCard}>
              {stats.found ? (
                <>
                  <h3 className={styles.cardTitle}>פרטי משתמש</h3>
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
                </>
              ) : (
                <div className={styles.notFound}>
                  <p>משתמש לא נמצא או שאינו נבחן</p>
                </div>
              )}
            </div>
          )}

          {/* Aggregated View */}
          {!stats.userId && (
            <div className={styles.aggregatedView}>
              <h3 className={styles.cardTitle}>
                סטטיסטיקות כניסות - {stats.from} עד {stats.to}
              </h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.totalExaminees}</div>
                  <div className={styles.statLabel}>סה"כ נבחנים במערכת</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {stats.examinessWhoVisited}
                  </div>
                  <div className={styles.statLabel}>
                    נבחנים שביקרו בטווח זה
                  </div>
                </div>
                <div className={`${styles.statCard} ${styles.percentageCard}`}>
                  <div className={styles.statValue}>{stats.percentage}%</div>
                  <div className={styles.statLabel}>אחוז ביקורים</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

