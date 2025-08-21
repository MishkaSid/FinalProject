import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiClock, FiFlag } from "react-icons/fi";
import styles from "./exam.module.css";

export default function Exam() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [topicId]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // Fetch topic information
      const topicResponse = await fetch(`/api/student/topics/${topicId}`);
      const topicInfo = await topicResponse.json();
      setTopicData(topicInfo);
      
      // Fetch exam questions
      const questionsResponse = await fetch(`/api/student/exams/questions/${topicId}`);
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);
      
    } catch (err) {
      console.error('Error fetching exam data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFlagQuestion = (questionId) => {
    // Toggle flag for review
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], flagged: !prev[questionId]?.flagged }
    }));
  };

  const handleSubmitExam = async () => {
    try {
      const examData = {
        topicId: parseInt(topicId),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          selectedAnswer: answer.selectedAnswer || answer,
          grade: 0 // Will be calculated on backend
        }))
      };

      const response = await fetch('/api/student/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        setExamSubmitted(true);
      } else {
        throw new Error('Failed to submit exam');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Failed to submit exam');
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToDashboard = () => {
    navigate('/student');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען מבחן...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>שגיאה בטעינת המבחן</h2>
          <p>{error}</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.examIntro}>
          <h1>מבחן: {topicData?.TopicName}</h1>
          <div className={styles.examInfo}>
            <h2>פרטי המבחן:</h2>
            <ul>
              <li>מספר שאלות: {questions.length}</li>
              <li>זמן: שעה אחת</li>
              <li>נושא: {topicData?.TopicName}</li>
              <li>קורס: {topicData?.CourseName}</li>
            </ul>
            <div className={styles.examInstructions}>
              <h3>הוראות:</h3>
              <ul>
                <li>יש לענות על כל השאלות</li>
                <li>ניתן לחזור לשאלות קודמות</li>
                <li>המבחן יישלח אוטומטית בסיום הזמן</li>
                <li>לא ניתן לצאת מהמבחן לאחר התחלתו</li>
              </ul>
            </div>
          </div>
          <button onClick={startExam} className={styles.startExamButton}>
            התחל מבחן
          </button>
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.examComplete}>
          <h1>המבחן הושלם בהצלחה!</h1>
          <p>תשובותיך נשלחו למערכת</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
          <div className={styles.examTitle}>
            <h1>{topicData?.TopicName}</h1>
            <p>מבחן</p>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.timer}>
            <FiClock />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className={styles.progressInfo}>
            <span>{currentQuestionIndex + 1} מתוך {questions.length}</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className={styles.questionNavigation}>
        <div className={styles.navButtons}>
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={styles.navButton}
          >
            שאלה קודמת
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className={styles.navButton}
          >
            שאלה הבאה
          </button>
        </div>
        
        <div className={styles.questionGrid}>
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`${styles.questionNumber} ${
                index === currentQuestionIndex ? styles.current : ""
              } ${
                answers[questions[index]?.QuestionID] ? styles.answered : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Content */}
      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <h2>שאלה {currentQuestionIndex + 1}</h2>
          <button
            onClick={() => handleFlagQuestion(currentQuestion.QuestionID)}
            className={`${styles.flagButton} ${
              answers[currentQuestion.QuestionID]?.flagged ? styles.flagged : ""
            }`}
          >
            <FiFlag />
          </button>
        </div>

        <div className={styles.questionContent}>
          {currentQuestion.QuestionPicURL && (
            <div className={styles.imageContainer}>
              <img 
                src={currentQuestion.QuestionPicURL} 
                alt="Question content"
                className={styles.questionImage}
              />
            </div>
          )}
          
          <div className={styles.answerOptions}>
            <h3>בחר תשובה:</h3>
            {JSON.parse(currentQuestion.AnswerOptions).map((option, index) => (
              <button
                key={index}
                className={`${styles.answerOption} ${
                  answers[currentQuestion.QuestionID] === option ? styles.selected : ""
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.QuestionID, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.examStats}>
          <span>ענו: {answeredQuestions}/{questions.length}</span>
          <span>זמן נותר: {formatTime(timeLeft)}</span>
        </div>
        
        <button
          onClick={handleSubmitExam}
          className={styles.submitExamButton}
        >
          שלח מבחן
        </button>
      </div>
    </div>
  );
}
