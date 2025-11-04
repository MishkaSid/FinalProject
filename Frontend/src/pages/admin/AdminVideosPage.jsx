import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import Popup from "../../components/popup/Popup";
import styles from './AdminPages.module.css';

const AdminVideosPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    videoUrl: '',
    difficulty: 'intro'
  });
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchVideos();
  }, [topicId]);

  // Helper function to get Hebrew difficulty label
  const getDifficultyLabel = (difficulty) => {
    const difficultyMap = {
      'intro': 'מבוא',
      'easy': 'קל',
      'medium': 'בינוני',
      'exam': 'מבחן'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/topics/${topicId}/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for duplicate difficulty
    const existingVideoWithSameDifficulty = videos.find(v => 
      v.difficulty === formData.difficulty && 
      (!editingVideo || v.videoId !== editingVideo.videoId)
    );
    
    if (existingVideoWithSameDifficulty) {
      const difficultyLabel = getDifficultyLabel(formData.difficulty);
      setErrorMessage(`לא יכול להיות יותר מסרטון ${difficultyLabel} אחד, באפשרותך לשנות את הקיים או לשים את הסרטון הזה במקום אחר בדף`);
      setShowErrorPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const url = editingVideo 
        ? `${API_BASE}/api/videos/${editingVideo.videoId}`
        : `${API_BASE}/api/videos`;
      
      const method = editingVideo ? 'PUT' : 'POST';
      const body = editingVideo 
        ? formData 
        : { ...formData, topicId: parseInt(topicId) };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to save video');
      }

      setShowForm(false);
      setEditingVideo(null);
      setFormData({ videoUrl: '', difficulty: 'intro' });
      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      difficulty: video.difficulty
    });
    setShowForm(true);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הסרטון?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigate('/manager/manageContent');
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loading}>טוען...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          <FiArrowRight /> חזור
        </button>
        <h1 className={styles.pageTitle}>ניהול סרטונים</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setEditingVideo(null);
            setFormData({ videoUrl: '', difficulty: 'intro' });
            setShowForm(true);
          }}
        >
          <FiPlus /> הוסף סרטון
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {showForm && (
        <div className={styles.formModal}>
          <div className={styles.formContent}>
            <h2>{editingVideo ? 'עריכת סרטון' : 'הוספת סרטון חדש'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>קישור לסרטון:</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>רמת קושי:</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="intro">מבוא</option>
                  <option value="easy">קל</option>
                  <option value="medium">בינוני</option>
                  <option value="exam">מבחן</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editingVideo ? 'עדכן' : 'שמור'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>קישור</th>
              <th>רמת קושי</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.videoId}>
                <td>
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                    {video.videoUrl}
                  </a>
                </td>
                <td>
                  <span className={`${styles.difficulty} ${styles[video.difficulty]}`}>
                    {video.difficulty === 'intro' ? 'מבוא' : 
                     video.difficulty === 'easy' ? 'קל' :
                     video.difficulty === 'medium' ? 'בינוני' : 'מבחן'}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(video)}
                  >
                    <FiEdit />
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(video.videoId)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Popup */}
      <Popup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        header="שגיאה"
        text={errorMessage}
      />
    </div>
  );
};

export default AdminVideosPage;
