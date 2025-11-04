// בקובץ זה נמצא תבנית הדף הראשי לנושאי הלימוד
// הקובץ מציג מידע על נושא, סרטוני הסבר ותרגול לפי רמות קושי
// הוא מספק ממשק אינטראקטיבי לסטודנטים לגישה לתוכן הלימוד
// Frontend/src/components/topic/TopicLandingTemplate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./topicLanding.module.css";
import {
  FiBook,
  FiVideo,
  FiTarget,
  FiChevronDown,
  FiPlay,
} from "react-icons/fi";

/**
 * Check if a URL is a YouTube URL.
 *
 * @param {string|null|undefined} url The URL to check.
 * @returns {boolean} True if the URL is a YouTube URL.
 */
function isYoutubeUrl(url) {
  if (!url) return false;
  const raw = String(url).trim();
  
  // If it doesn't start with http/https, assume it's a YouTube ID
  if (!/^https?:\/\//i.test(raw)) {
    return true;
  }
  
  try {
    const u = new URL(raw);
    return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
  } catch {
    return false;
  }
}

/**
 * Given a URL or ID, returns a YouTube embed URL.
 *
 * @param {string|null|undefined} urlOrId The URL or ID to convert.
 * @returns {string|null} The embed URL, or null if invalid.
 */
function toYoutubeEmbed(urlOrId) {
  if (!urlOrId) return null;
  const raw = String(urlOrId).trim();
  if (!/^https?:\/\//i.test(raw)) {
    const idOnly = raw.replace(/[^\w-]/g, "");
    return `https://www.youtube.com/embed/${idOnly}`;
  }
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/\//g, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] || "";
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.pathname.includes("/embed/")) return raw;
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) return `https://www.youtube.com/embed/${last}`;
  } catch {
    const idOnly = String(raw).replace(/[^\w-]/g, "");
    return idOnly ? `https://www.youtube.com/embed/${idOnly}` : null;
  }
  return null;
}

/**
 * Resolve video URL for local files.
 *
 * @param {string} url The URL to resolve.
 * @returns {string} The resolved URL.
 */
function resolveVideoUrl(url) {
  if (!url) return "";
  const SERVER = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  // If it's already a full URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  
  // If it starts with /
  if (url.startsWith("/")) {
    return `${SERVER}${url}`;
  }
  
  // Otherwise assume it's a filename in uploads
  return `${SERVER}/uploads/${url}`;
}

/**
 * Arrange videos into intro and levels.
 * @param {Array<Object>} videos Array of video objects.
 * @returns {{intro: Object|null, levels: Array<Object>}} Object with intro and levels.
 */
function arrangeVideos(videos) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return { intro: null, levels: [] };
  }
  const norm = videos
    .filter(Boolean)
    .map((v) => ({
      ...v,
      Difficulty: String(v?.Difficulty || "")
        .trim()
        .toLowerCase(),
      VideoUrl: v?.VideoUrl ? String(v.VideoUrl).trim() : "",
    }))
    .filter((v) => v.VideoUrl.length > 0);

  const pickFirstBy = (key) => norm.find((v) => v.Difficulty === key) || null;
  const intro = pickFirstBy("intro");
  const easy = pickFirstBy("easy");
  const medium = pickFirstBy("medium");
  const exam = pickFirstBy("exam");

  if (intro && easy && medium && exam) {
    return { intro, levels: [easy, medium, exam] };
  }

  let chosenIntro = intro;
  let remaining = norm.slice();
  if (!chosenIntro) {
    chosenIntro = remaining[0] || null;
    if (chosenIntro) remaining = remaining.filter((v) => v !== chosenIntro);
  } else {
    remaining = remaining.filter((v) => v !== chosenIntro);
  }

  const levels = [];
  /**
   * Attempt to push a candidate to the levels array, but only if the candidate is
   * truthy and the levels array has fewer than 3 elements.
   *
   * @param {Object} candidate A video object to attempt to push.
   * @returns {boolean} Whether the candidate was successfully pushed.
   */
  const tryPush = (candidate) =>
    candidate && levels.length < 3 && levels.push(candidate);

  tryPush(remaining.find((v) => v.Difficulty === "easy"));
  tryPush(remaining.find((v) => v.Difficulty === "medium"));
  tryPush(remaining.find((v) => v.Difficulty === "exam"));

  for (const v of remaining) {
    if (levels.length >= 3) break;
    if (!levels.includes(v)) tryPush(v);
  }

  return { intro: chosenIntro, levels };
}

/**
 * A template component for the practice landing page.
 * @returns {JSX.Element} A JSX element representing the landing page.
 * @example
 * <TopicLandingTemplate />
 */
export default function TopicLandingTemplate() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const [openLevels, setOpenLevels] = useState([false, false, false]);
  /**
   * Toggle the `openLevels` state for the given level index.
   *
   * @param {number} idx The index of the level to toggle.
   * @returns {void}
   */
  const toggleLevel = (idx) =>
    setOpenLevels((prev) => prev.map((v, i) => (i === idx ? !v : v)));

  useEffect(() => {
    let cancelled = false;
    /**
     * Loads the topic and videos from the server.
     * If the topic or videos request fails, sets error state.
     * If the videos request is successful, sets videos state.
     * If the topic request is successful, sets topic state.
     * Finally, sets loading state to false.
     *
     * @returns {Promise<void>}
     */
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const tRes = await fetch(
          `${API_BASE}/api/practice-dashboard/topic/${topicId}`
        );
        if (!tRes.ok) {
          const errText = await tRes.text().catch(() => "");
          throw new Error(`Topic request failed: ${tRes.status} ${errText}`);
        }
        const tJson = await tRes.json();

        const vRes = await fetch(
          `${API_BASE}/api/practice-dashboard/videos/${topicId}`
        );
        let vJson = [];
        if (vRes.ok) vJson = await vRes.json();

        if (!cancelled) {
          setTopic(tJson);
          setVideos(Array.isArray(vJson) ? vJson : []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Landing load error:", e);
          setError(
            "שגיאה בטעינת הנתונים מהשרת. נסו לרענן את הדף או לחזור מאוחר יותר."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const subjectName = useMemo(() => {
    if (!topic) return "";
    const course = topic.CourseName || "קורס";
    const name = topic.TopicName || "נושא";
    return `${course} – ${name}`;
  }, [topic]);

  const subjectDescription = useMemo(() => {
    if (!topic) return "";
    if (
      topic.TopicDescription &&
      String(topic.TopicDescription).trim().length > 0
    ) {
      return String(topic.TopicDescription).trim();
    }
    return "אין תיאור לנושא זה.";
  }, [topic]);

  const { intro, levels } = useMemo(() => arrangeVideos(videos), [videos]);

  /**
   * Navigate to the practice questions page for the current topic.
   *
   * @returns {void}
   */
  const handlePractice = () => {
    navigate(`/student/practice-questions/${topicId}`);
  };

  /**
   * Navigate to the practice questions page for the current topic
   * with the given difficulty level.
   *
   * @param {string} difficulty The difficulty level of the practice questions
   * to navigate to. Must be one of "easy", "medium", or "exam".
   * @returns {void}
   */
  const handlePracticeLevel = (difficulty) => {
    navigate(`/student/practice-questions/${topicId}?level=${difficulty}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox} role="status" aria-live="polite">
          <div className={styles.spinner} />
          <p>טוען תוכן…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox} role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{subjectName}</h1>
        </div>
      </header>

      {/* Description */}
      <section className={styles.descSection}>
        <div className={styles.descCard}>
          <p className={styles.descText}>{subjectDescription}</p>
        </div>
      </section>

      {/* Intro video */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
           סרטון הסבר קצר מהדוקטור
           <FiVideo />       </h2>
        <article className={styles.introCard}>
          <div className={styles.introFrame}>
            {intro?.VideoUrl ? (
              isYoutubeUrl(intro.VideoUrl) ? (
                <iframe
                  className={styles.videoFrame}
                  src={toYoutubeEmbed(intro.VideoUrl)}
                  title="סרטון פתיחה"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className={styles.videoFrame}
                  controls
                  preload="metadata"
                >
                  <source src={resolveVideoUrl(intro.VideoUrl)} type="video/mp4" />
                  הדפדפן שלך אינו תומך בתגית וידאו.
                </video>
              )
            ) : (
              <div className={styles.placeholder}>אין כתובת וידאו להצגה</div>
            )}
          </div>
        </article>
      </section>

      {/* Levels */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
           סרטונים לפי רמה
           <FiTarget /></h2>
        <div className={styles.levelsGrid}>
          {["קל", "בינוני", "רמת מבחן"].map((label, i) => {
            const v = levels[i];
            const isOpen = openLevels[i];
            const diffKey = i === 0 ? "easy" : i === 1 ? "medium" : "exam";

            return (
              <article key={v?.VideoID ?? i} className={styles.levelCard}>
                <div className={styles.levelHeader}>
                  <span className={styles.levelBadge}>{label}</span>
                  <button
                    type="button"
                    className={`${styles.levelToggleBtn} ${
                      isOpen ? styles.levelToggleBtnOpen : ""
                    }`}
                    onClick={() => toggleLevel(i)}
                  >
                    <FiChevronDown />
                  </button>
                </div>

                <div
                  className={`${styles.levelCollapse} ${
                    isOpen ? styles.levelCollapseOpen : ""
                  }`}
                >
                  <div className={styles.levelFrame}>
                    {v?.VideoUrl ? (
                      isYoutubeUrl(v.VideoUrl) ? (
                        <iframe
                          className={styles.videoFrame}
                          src={toYoutubeEmbed(v.VideoUrl)}
                          title={label}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          className={styles.videoFrame}
                          controls
                          preload="metadata"
                        >
                          <source src={resolveVideoUrl(v.VideoUrl)} type="video/mp4" />
                          הדפדפן שלך אינו תומך בתגית וידאו.
                        </video>
                      )
                    ) : (
                      <div className={styles.placeholder}>
                        אין כתובת וידאו להצגה
                      </div>
                    )}
                  </div>

                </div>

                {/* Practice button */}
                <div className={styles.practiceRow}>
                  <button
                    className={styles.practiceBtn}
                    onClick={() => handlePracticeLevel(diffKey)}
                  >
                    <FiPlay /> לתרגול ברמה זו
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <div className={styles.ctaRow}>
        <button className={styles.ctaBtn} onClick={handlePractice}>
           תרגול רנדומלי מכל הרמות
        </button>
      </div>
    </div>
  );
}