import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import styles from './AdminPages.module.css';
import Popup from '../../components/popup/Popup';

const AdminPracticeExercisesPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    contentType: 'image', // Always image type
    contentValue: '',
    answerOptions: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'easy'
  });
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [imagePopup, setImagePopup] = useState({ isOpen: false, imageUrl: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, exerciseId: null });

  useEffect(() => {
    fetchExercises();
  }, [topicId]);

  // ממפה מערך אפשרויות לאותיות A,B,C,D,E,F וכו'
  const mapOptionsToLetters = (arr) => {
    const mapped = {};
    arr.forEach((option, index) => {
      if (option && option.trim()) {
        const letter = String.fromCharCode(65 + index); // A=65, B=66, etc.
        mapped[letter] = option;
      }
    });
    return mapped;
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/topics/${topicId}/practice-exercises`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }

      const data = await response.json();
      setExercises(data);
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
      
      // Handle file upload
      let contentValue = formData.contentValue;
      if (!editingExercise) {
        // For new exercises, file is required
        if (fileUpload) {
          contentValue = await uploadFileToServer();
        } else {
          setError('יש לבחור תמונה');
          return;
        }
      } else {
        // For editing, file is optional - upload if provided
        if (fileUpload) {
          contentValue = await uploadFileToServer();
        }
      }

      // Validate correct answer
      const optionsObj = mapOptionsToLetters(formData.answerOptions);
      const correct = String(formData.correctAnswer || "").trim();
      if (!correct || !optionsObj[correct]) {
        const availableKeys = Object.keys(optionsObj).join(", ");
        setError(`התשובה הנכונה חייבת להיות אחת מהמפתחות ${availableKeys} שקיבלו ערך`);
        return;
      }

      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const url = editingExercise 
        ? `${API_BASE}/api/practice-exercises/${editingExercise.exerciseId}`
        : `${API_BASE}/api/practice-exercises`;
      
      const method = editingExercise ? 'PUT' : 'POST';
      const body = editingExercise 
        ? { ...formData, contentValue }
        : { ...formData, topicId: parseInt(topicId), contentValue };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to save exercise');
      }

      setShowForm(false);
      setEditingExercise(null);
      setFormData({ 
        contentType: 'image', 
        contentValue: '', 
        answerOptions: ['', '', '', ''], 
        correctAnswer: '', 
        difficulty: 'easy' 
      });
      setFileUpload(null);
      setFilePreview('');
      setError(null);
      fetchExercises();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      contentType: exercise.contentType,
      contentValue: exercise.contentValue,
      answerOptions: exercise.answerOptions,
      correctAnswer: exercise.correctAnswer,
      difficulty: exercise.difficulty
    });
    setFileUpload(null);
    setFilePreview('');
    setShowForm(true);
  };

  const handleDelete = (exerciseId) => {
    setDeleteConfirm({ isOpen: true, exerciseId });
  };

  const handleDeleteConfirm = async () => {
    const exerciseId = deleteConfirm.exerciseId;
    if (!exerciseId) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/practice-exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }

      setDeleteConfirm({ isOpen: false, exerciseId: null });
      fetchExercises();
    } catch (err) {
      setError(err.message);
      setDeleteConfirm({ isOpen: false, exerciseId: null });
    }
  };

  const handleBack = () => {
    navigate('/manager/manageContent');
  };

  const handleImageClick = (imageUrl) => {
    console.log('Opening image popup with URL:', imageUrl);
    setImagePopup({ isOpen: true, imageUrl });
  };

  const closeImagePopup = () => {
    setImagePopup({ isOpen: false, imageUrl: '' });
  };

  const resolveImageUrl = (contentValue) => {
    if (!contentValue) return '';
    const SERVER = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    // אם זה כבר URL מלא עם http/https
    if (/^https?:\/\//i.test(contentValue)) {
      return contentValue;
    }
    
    // אם זה מתחיל ב־/ (נתיב יחסי מהשרת)
    if (contentValue.startsWith('/')) {
      return `${SERVER}${contentValue}`;
    }
    
    // אם זה רק שם קובץ
    return `${SERVER}/uploads/practice-exercises/${contentValue}`;
  };

  const addAnswerOption = () => {
    setFormData({
      ...formData,
      answerOptions: [...formData.answerOptions, '']
    });
  };

  const removeAnswerOption = (index) => {
    if (formData.answerOptions.length > 2) {
      const newOptions = formData.answerOptions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        answerOptions: newOptions
      });
    }
  };

  const updateAnswerOption = (index, value) => {
    const newOptions = [...formData.answerOptions];
    newOptions[index] = value;
    setFormData({
      ...formData,
      answerOptions: newOptions
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileUpload(file);
    
    // Create preview URL
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview('');
    }
  };

  const uploadFileToServer = async () => {
    if (!fileUpload) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', fileUpload);
      
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/practice/practiceExercise/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
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
        <h1 className={styles.pageTitle}>ניהול תרגילים</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setEditingExercise(null);
            setFormData({ 
              contentType: 'image', 
              contentValue: '', 
              answerOptions: ['', '', '', ''], 
              correctAnswer: '', 
              difficulty: 'easy' 
            });
            setFileUpload(null);
            setFilePreview('');
            setError(null);
            setShowForm(true);
          }}
        >
          <FiPlus /> הוסף תרגיל
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
            <h2>{editingExercise ? 'עריכת תרגיל' : 'הוספת תרגיל חדש'}</h2>
            <form onSubmit={handleSubmit}>
              {!editingExercise ? (
                <div className={styles.formGroup}>
                  <label>תמונת תרגיל:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    required
                  />
                  {filePreview && (
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '240px', display: 'block', marginTop: '8px' }}
                    />
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label>העלה תמונה חדשה:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {filePreview && (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        style={{ maxWidth: '240px', display: 'block', marginTop: '8px' }}
                      />
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>קישור תמונה קיים:</label>
                    <input
                      type="url"
                      value={formData.contentValue}
                      onChange={(e) => setFormData({...formData, contentValue: e.target.value})}
                      placeholder="קישור קיים בלבד בעריכה"
                      disabled
                    />
                    <small>כדי להחליף תמונה, העלה תמונה חדשה למעלה או צור תרגיל חדש</small>
                  </div>
                </>
              )}
              
              <div className={styles.formGroup}>
                <label>אפשרויות תשובה:</label>
                {formData.answerOptions.map((option, index) => (
                  <div key={index} className={styles.answerOption}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateAnswerOption(index, e.target.value)}
                      placeholder={`אפשרות ${index + 1}`}
                      required={!editingExercise}
                    />
                    {formData.answerOptions.length > 2 && (
                      <button 
                        type="button"
                        className={styles.removeOption}
                        onClick={() => removeAnswerOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button"
                  className={styles.addOption}
                  onClick={addAnswerOption}
                >
                  הוסף אפשרות
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>תשובה נכונה:</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                  required={!editingExercise}
                >
                  <option value="">בחר תשובה</option>
                  {formData.answerOptions.map((option, index) => {
                    if (option && option.trim()) {
                      const letter = String.fromCharCode(65 + index);
                      return (
                        <option key={index} value={letter}>
                          {letter}
                        </option>
                      );
                    }
                    return null;
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>רמת קושי:</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="easy">קל</option>
                  <option value="medium">בינוני</option>
                  <option value="exam">מבחן</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editingExercise ? 'עדכן' : 'שמור'}
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
              <th>תוכן</th>
              <th>אפשרויות תשובה</th>
              <th>תשובה נכונה</th>
              <th>רמת קושי</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.exerciseId}>
                <td>
                  {exercise.contentType === 'text' ? (
                    <div className={styles.textContent}>
                      {exercise.contentValue}
                    </div>
                  ) : exercise.contentType === 'image' ? (
                    <div className={styles.thumbnailWrapper}>
                      <img 
                        src={resolveImageUrl(exercise.contentValue)} 
                        alt="Exercise" 
                        className={styles.exerciseImage}
                        onClick={() => handleImageClick(resolveImageUrl(exercise.contentValue))}
                        title="לחץ להגדלה"
                        onError={(e) => {
                          console.error('Failed to load image:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className={styles.zoomHint}>🔍</div>
                    </div>
                  ) : (
                    <video 
                      src={exercise.contentValue} 
                      className={styles.exerciseVideo}
                      controls
                    />
                  )}
                </td>
                <td>
                  <ul className={styles.answerList}>
                    {exercise.answerOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </td>
                <td>{exercise.correctAnswer}</td>
                <td>
                  <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
                    {exercise.difficulty === 'easy' ? 'קל' :
                     exercise.difficulty === 'medium' ? 'בינוני' : 'מבחן'}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(exercise)}
                  >
                    <FiEdit />
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(exercise.exerciseId)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Popup Modal */}
      {imagePopup.isOpen && (
        <div className={styles.imagePopupOverlay} onClick={closeImagePopup}>
          <div className={styles.imagePopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closePopupButton} onClick={closeImagePopup}>
              ×
            </button>
            <div style={{ marginBottom: '10px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
              URL: {imagePopup.imageUrl}
            </div>
            <img
              src={imagePopup.imageUrl}
              alt="Full size exercise"
              className={styles.fullSizeImage}
              onError={(e) => {
                console.error('Failed to load image:', imagePopup.imageUrl);
                e.target.style.display = 'none';
                e.target.parentElement.insertAdjacentHTML('beforeend', 
                  '<div style="padding: 40px; text-align: center; color: red;">שגיאה בטעינת התמונה<br/>' + imagePopup.imageUrl + '</div>');
              }}
              onLoad={() => console.log('Image loaded successfully:', imagePopup.imageUrl)}
            />
            <div className={styles.imagePopupHint}>
              לחץ על הרקע או X לסגירה
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <Popup
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, exerciseId: null })}
        header="⚠️ אישור מחיקה"
      >
        <div style={{ padding: "2.5rem", textAlign: "center" }}>
          <div style={{ 
            fontSize: '22px', 
            marginBottom: '24px',
            fontWeight: '600',
            color: '#2c3e50',
            lineHeight: '1.5'
          }}>
            האם אתה בטוח שברצונך למחוק את התרגיל?
          </div>
          <div style={{ 
            fontSize: '16px', 
            marginBottom: '32px', 
            color: '#e74c3c',
            backgroundColor: '#ffebee',
            padding: '16px 20px',
            borderRadius: '8px',
            border: '2px solid #e74c3c',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>⚠️ אזהרה!</strong>
            פעולה זו היא קבועה ולא ניתנת לביטול.
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              className={styles.deleteButtonLarge}
              onClick={handleDeleteConfirm}
              style={{ 
                width: '180px',
                fontSize: '1.4rem',
                padding: '0.7rem 1.5rem'
              }}
            >
              🗑️ מחק
            </button>
            <button
              className={styles.addButton}
              onClick={() => setDeleteConfirm({ isOpen: false, exerciseId: null })}
              style={{ 
                width: '180px',
                fontSize: '1.4rem',
                padding: '0.7rem 1.5rem',
                backgroundColor: '#6c757d'
              }}
            >
              ❌ ביטול
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default AdminPracticeExercisesPage;
