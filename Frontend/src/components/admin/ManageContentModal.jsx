import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiBook, FiEdit3 } from 'react-icons/fi';
import styles from './ManageContentModal.module.css';

/**
 * ManageContentModal component for admin content management
 * Shows 3 action cards for managing videos, exam questions, and practice exercises
 */
const ManageContentModal = ({ isOpen, onClose, topicId, topicName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleActionClick = (action) => {
    switch (action) {
      case 'videos':
        navigate(`/admin/topics/${topicId}/videos`);
        break;
      case 'exam':
        navigate(`/admin/topics/${topicId}/exam`);
        break;
      case 'practice':
        navigate(`/admin/topics/${topicId}/practice`);
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>ניהול תוכן - {topicName}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.actionCards}>
          <div 
            className={styles.actionCard}
            onClick={() => handleActionClick('videos')}
          >
            <div className={styles.cardIcon}>
              <FiVideo size={48} />
            </div>
            <h3 className={styles.cardTitle}>סרטונים</h3>
            <p className={styles.cardDescription}>
              ניהול סרטוני לימוד ותוכן וידאו
            </p>
          </div>

          <div 
            className={styles.actionCard}
            onClick={() => handleActionClick('exam')}
          >
            <div className={styles.cardIcon}>
              <FiBook size={48} />
            </div>
            <h3 className={styles.cardTitle}>תוכן למבחן</h3>
            <p className={styles.cardDescription}>
              ניהול שאלות ותוכן למבחנים
            </p>
          </div>

          <div 
            className={styles.actionCard}
            onClick={() => handleActionClick('practice')}
          >
            <div className={styles.cardIcon}>
              <FiEdit3 size={48} />
            </div>
            <h3 className={styles.cardTitle}>תוכן לתרגול</h3>
            <p className={styles.cardDescription}>
              ניהול תרגילים ותוכן לתרגול
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageContentModal;
