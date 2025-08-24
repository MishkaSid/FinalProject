// All comments in English. All user-facing text in Hebrew (RTL).
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./topicLanding.module.css";
import { FiBook, FiVideo, FiTarget } from "react-icons/fi";

/** Convert a YouTube full URL or raw ID into an embeddable URL (handles /shorts too) */
function toYoutubeEmbed(urlOrId) {
  if (!urlOrId) return null;
  const raw = String(urlOrId).trim();

  // If it's a plain ID (no protocol/domain)
  if (!/^https?:\/\//i.test(raw)) {
    const idOnly = raw.replace(/[^\w-]/g, "");
    return `https://www.youtube.com/embed/${idOnly}`;
  }

  try {
    const u = new URL(raw);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/\//g, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/shorts/<id>
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] || "";
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/embed/<id>
    if (u.pathname.includes("/embed/")) {
      return raw;
    }

    // youtube.com/watch?v=<id>
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;

    // Fallback: last path segment
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) return `https://www.youtube.com/embed/${last}`;
  } catch {
    const idOnly = String(raw).replace(/[^\w-]/g, "");
    return idOnly ? `https://www.youtube.com/embed/${idOnly}` : null;
  }

  return null;
}

/** Arrange into exactly one intro + up to 3 levels (easy, medium, exam) with robust fallbacks */
function arrangeVideos(videos) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return { intro: null, levels: [] };
  }

  // Normalize
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

  // Fallbacks
  let chosenIntro = intro;
  let remaining = norm.slice();

  if (!chosenIntro) {
    chosenIntro = remaining[0] || null;
    if (chosenIntro) remaining = remaining.filter((v) => v !== chosenIntro);
  } else {
    remaining = remaining.filter((v) => v !== chosenIntro);
  }

  const levels = [];
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

export default function TopicLandingTemplate() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Topic info
        const tRes = await fetch(
          `http://localhost:5000/api/practice-dashboard/topic/${topicId}`
        );
        if (!tRes.ok) {
          const errText = await tRes.text().catch(() => "");
          throw new Error(`Topic request failed: ${tRes.status} ${errText}`);
        }
        const tJson = await tRes.json();

        // Videos
        const vRes = await fetch(
          `http://localhost:5000/api/practice-dashboard/videos/${topicId}`
        );
        let vJson = [];
        if (vRes.ok) {
          vJson = await vRes.json();
        }

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

  const handlePractice = () => {
    navigate(`/student/practice-questions/${topicId}`);
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
      <section
        className={styles.descSection}
        aria-labelledby="topic-desc-title"
      >
        <h2 id="topic-desc-title" className={styles.visuallyHidden}>
          תיאור הנושא
        </h2>
        <div className={styles.descCard}>
          <p className={styles.descText}>{subjectDescription}</p>
        </div>
      </section>

      {/* Intro video */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true" className={styles.titleIcon}>
            <FiVideo />
          </span>
          סרטון פתיחה
        </h2>
        <article className={styles.introCard}>
          <div className={styles.introFrame}>
            {intro?.VideoUrl ? (
              <iframe
                className={styles.videoFrame}
                src={toYoutubeEmbed(intro.VideoUrl)}
                title={intro.VideoTopic || "סרטון פתיחה"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.placeholder}>אין כתובת וידאו להצגה</div>
            )}
          </div>
          <div className={styles.introInfo}>
            <h3 className={styles.videoTitle}>
              {intro?.VideoTopic || "סרטון פתיחה"}
            </h3>
            <p className={styles.videoDesc}>{topic?.TopicName || ""}</p>
          </div>
        </article>
      </section>

      {/* Levels videos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true" className={styles.titleIcon}>
            <FiTarget />
          </span>
          סרטונים לפי רמה
        </h2>
        <div className={styles.levelsGrid}>
          {["קל", "בינוני", "רמת מבחן"].map((label, i) => {
            const v = levels[i];
            return (
              <article key={v?.VideoID ?? i} className={styles.levelCard}>
                <div className={styles.levelHeader}>
                  <span className={styles.levelBadge}>{label}</span>
                </div>
                <div className={styles.levelFrame}>
                  {v?.VideoUrl ? (
                    <iframe
                      className={styles.videoFrame}
                      src={toYoutubeEmbed(v.VideoUrl)}
                      title={v.VideoTopic || label}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      אין כתובת וידאו להצגה
                    </div>
                  )}
                </div>
                <div className={styles.levelInfo}>
                  <h3 className={styles.videoTitle}>
                    {v?.VideoTopic || `סרטון ${label}`}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className={styles.ctaRow}>
        <button className={styles.ctaBtn} onClick={handlePractice}>
          <FiBook aria-hidden="true" />
          <span>עבור לתרגול שאלות</span>
        </button>
      </div>
    </div>
  );
}
