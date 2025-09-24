import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
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
    videoTopic: '',
    videoUrl: '',
    difficulty: 'intro'
  });

  useEffect(() => {
    fetchVideos();
  }, [topicId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/topics/${topicId}/videos`, {
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
    try {
      const token = localStorage.getItem('token');
      const url = editingVideo 
        ? `http://localhost:5000/api/videos/${editingVideo.videoId}`
        : 'http://localhost:5000/api/videos';
      
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
      setFormData({ videoTopic: '', videoUrl: '', difficulty: 'intro' });
      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoTopic: video.videoTopic,
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
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
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
            setFormData({ videoTopic: '', videoUrl: '', difficulty: 'intro' });
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
                <label>נושא הסרטון:</label>
                <input
                  type="text"
                  value={formData.videoTopic}
                  onChange={(e) => setFormData({...formData, videoTopic: e.target.value})}
                  required
                />
              </div>
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
              <th>נושא</th>
              <th>קישור</th>
              <th>רמת קושי</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.videoId}>
                <td>{video.videoTopic}</td>
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
    </div>
  );
};

export default AdminVideosPage;
