import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import styles from './AdminPages.module.css';

const AdminExamQuestionsPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionPicURL: '',
    answerOptions: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, [topicId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/topics/${topicId}/exam-questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
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
      const url = editingQuestion 
        ? `http://localhost:5000/api/exam-questions/${editingQuestion.questionId}`
        : 'http://localhost:5000/api/exam-questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';
      const body = editingQuestion 
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
        throw new Error('Failed to save question');
      }

      setShowForm(false);
      setEditingQuestion(null);
      setFormData({ questionPicURL: '', answerOptions: ['', '', '', ''], correctAnswer: '' });
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionPicURL: question.questionPicURL,
      answerOptions: question.answerOptions,
      correctAnswer: question.correctAnswer
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את השאלה?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exam-questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      fetchQuestions();
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
        <h1 className={styles.pageTitle}>ניהול שאלות למבחן</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setEditingQuestion(null);
            setFormData({ questionPicURL: '', answerOptions: ['', '', '', ''], correctAnswer: '' });
            setShowForm(true);
          }}
        >
          <FiPlus /> הוסף שאלה
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
            <h2>{editingQuestion ? 'עריכת שאלה' : 'הוספת שאלה חדשה'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>קישור לתמונה:</label>
                <input
                  type="url"
                  value={formData.questionPicURL}
                  onChange={(e) => setFormData({...formData, questionPicURL: e.target.value})}
                  required
                />
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

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editingQuestion ? 'עדכן' : 'שמור'}
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
              <th>תמונה</th>
              <th>אפשרויות תשובה</th>
              <th>תשובה נכונה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.questionId}>
                <td>
                  <img 
                    src={question.questionPicURL} 
                    alt="Question" 
                    className={styles.questionImage}
                  />
                </td>
                <td>
                  <ul className={styles.answerList}>
                    {question.answerOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </td>
                <td>{question.correctAnswer}</td>
                <td>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(question)}
                  >
                    <FiEdit />
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(question.questionId)}
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

export default AdminExamQuestionsPage;
