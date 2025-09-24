import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import styles from './AdminPages.module.css';

const AdminPracticeExercisesPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    contentType: 'text',
    contentValue: '',
    answerOptions: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'easy'
  });

  useEffect(() => {
    fetchExercises();
  }, [topicId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/topics/${topicId}/practice-exercises`, {
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
      const url = editingExercise 
        ? `http://localhost:5000/api/practice-exercises/${editingExercise.exerciseId}`
        : 'http://localhost:5000/api/practice-exercises';
      
      const method = editingExercise ? 'PUT' : 'POST';
      const body = editingExercise 
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
        throw new Error('Failed to save exercise');
      }

      setShowForm(false);
      setEditingExercise(null);
      setFormData({ 
        contentType: 'text', 
        contentValue: '', 
        answerOptions: ['', '', '', ''], 
        correctAnswer: '', 
        difficulty: 'easy' 
      });
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
    setShowForm(true);
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את התרגיל?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/practice-exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }

      fetchExercises();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigate('/manager/manageContent');
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
              contentType: 'text', 
              contentValue: '', 
              answerOptions: ['', '', '', ''], 
              correctAnswer: '', 
              difficulty: 'easy' 
            });
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
              <div className={styles.formGroup}>
                <label>סוג תוכן:</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                >
                  <option value="text">טקסט</option>
                  <option value="image">תמונה</option>
                  <option value="video">וידאו</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>תוכן:</label>
                {formData.contentType === 'text' ? (
                  <textarea
                    value={formData.contentValue}
                    onChange={(e) => setFormData({...formData, contentValue: e.target.value})}
                    rows={4}
                    required
                  />
                ) : (
                  <input
                    type="url"
                    value={formData.contentValue}
                    onChange={(e) => setFormData({...formData, contentValue: e.target.value})}
                    placeholder="קישור לתמונה או וידאו"
                    required
                  />
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>אפשרויות תשובה:</label>
                {formData.answerOptions.map((option, index) => (
                  <div key={index} className={styles.answerOption}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateAnswerOption(index, e.target.value)}
                      placeholder={`אפשרות ${index + 1}`}
                      required
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
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                  required
                />
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
                    <img 
                      src={exercise.contentValue} 
                      alt="Exercise" 
                      className={styles.exerciseImage}
                    />
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
    </div>
  );
};

export default AdminPracticeExercisesPage;
