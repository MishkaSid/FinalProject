import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./practiceDashboard.module.css";
import Card from "../../../../components/card/Card";
import { FiPlay, FiBook, FiArrowLeft } from "react-icons/fi";

/**
 * PracticeDashboard component displays practice content for a specific topic
 * including hero section, video content, and navigation to practice questions
 */
export default function PracticeDashboard() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [topicData, setTopicData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setLoading(true);
        
        // Fetch topic information using general data endpoint
        const topicResponse = await fetch(`http://localhost:5000/api/topics/getTopic/${topicId || '1'}`);
        const topicInfo = await topicResponse.json();
        setTopicData(topicInfo);
        
        // Fetch videos
        const videosResponse = await fetch(`http://localhost:5000/api/practice-dashboard/videos/${topicId || '1'}`);
        const videosData = await videosResponse.json();
        setVideos(videosData);
        
      } catch (err) {
        console.error('Error fetching topic data:', err);
        // Fallback to mock data
        setTopicData({
          TopicName: "אלגברה ליניארית",
          TopicDescription: "נושא זה עוסק בפתרון מערכות משוואות ליניאריות ושימוש במטריצות. נלמד כיצד לפתור בעיות מתמטיות מורכבות באמצעות כלים מתקדמים.",
          CourseName: "מתמטיקה"
        });
        setVideos([
          {
            VideoID: 1,
            VideoTopic: "מבוא לאלגברה ליניארית",
            TopicName: "אלגברה ליניארית"
          },
          {
            VideoID: 2,
            VideoTopic: "פתרון מערכות משוואות",
            TopicName: "אלגברה ליניארית"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [topicId]);

  const handlePracticeClick = () => {
    navigate(`/student/practice-questions/${topicId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען תוכן...</p>
        </div>
      </div>
    );
  }

  const subjectName = `${topicData?.CourseName || 'מתמטיקה'} – ${topicData?.TopicName || 'אלגברה ליניארית'}`;
  const subjectDescription = `נושא זה עוסק ב${topicData?.TopicName || 'אלגברה ליניארית'}. נלמד כיצד לפתור בעיות מתמטיות מורכבות באמצעות כלים מתקדמים.`;

  return (
    <div className={styles.container}>

      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{subjectName}</h1>
        <p className={styles.heroDescription}>{subjectDescription}</p>
      </div>

             {/* Video Section */}
       <div className={styles.videoSection}>
         <h2 className={styles.sectionTitle}>סרטוני הסברה</h2>
         <div className={styles.videoCard}>
           <div className={styles.videoContainer}>
             <iframe
               className={styles.videoFrame}
               src="https://www.youtube.com/embed/E8YQPBHLUrY"
               title="סרטון הסברה - אלגברה ליניארית"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
           </div>
           <div className={styles.videoInfo}>
             <h3>{videos[0]?.VideoTopic || 'מבוא לאלגברה ליניארית'}</h3>
             <p>סרטון הסברה מפורט על הנושא הנוכחי</p>
           </div>
         </div>
       </div>

      {/* Practice Button */}
      <div className={styles.buttonContainer}>
        <button className={styles.practiceButton} onClick={handlePracticeClick}>
          <FiBook className={styles.buttonIcon} />
          עבור לתרגול שאלות
        </button>
      </div>
    </div>
  );
}
