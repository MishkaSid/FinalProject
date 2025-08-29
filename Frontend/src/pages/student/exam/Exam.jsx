import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiClock, FiAlertTriangle, FiSave } from "react-icons/fi";
import styles from "./exam.module.css";
import { useAuth } from "../../../context/AuthContext";

export default function Exam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [examStats, setExamStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    timeRemaining: 0,
    startTime: null
  });

  // Server URL for images
  const SERVER_URL = "http://localhost:5000";

  // Exam duration in minutes
  const EXAM_DURATION_MINUTES = 60;
  const MAX_QUESTIONS = 12;

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchExamData();
  }, [user, navigate]);

  useEffect(() => {
    if (examStats.startTime && !examCompleted) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - examStats.startTime) / 1000);
        const remaining = (EXAM_DURATION_MINUTES * 60) - elapsed;
        
        if (remaining <= 0) {
          // Time's up! Auto-submit exam
          handleTimeUp();
        } else {
          setExamStats(prev => ({
            ...prev,
            timeRemaining: remaining
          }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStats.startTime, examCompleted]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // Fetch all practice exercises from all topics
      const response = await fetch(`${SERVER_URL}/api/practice/practiceExercises`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch exam data");
      }
      
      const allExercises = await response.json();
      
      // Shuffle the exercises and limit to MAX_QUESTIONS
      const shuffledExercises = shuffleArray([...allExercises]).slice(0, MAX_QUESTIONS);
      
      setExercises(shuffledExercises);
      setExamStats({
        totalQuestions: shuffledExercises.length,
        answeredQuestions: 0,
        timeRemaining: EXAM_DURATION_MINUTES * 60,
        startTime: new Date().getTime()
      });
      
    } catch (err) {
      console.error("Error fetching exam data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm for randomizing questions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (answer) => {
    const questionId = exercises[currentExerciseIndex].ExerciseID;
    const newAnswers = { ...selectedAnswers, [questionId]: answer };
    setSelectedAnswers(newAnswers);
    
    // Update answered questions count
    const answeredCount = Object.keys(newAnswers).length;
    setExamStats(prev => ({
      ...prev,
      answeredQuestions: answeredCount
    }));
  };

  const handleNextQuestion = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleSubmitExam = () => {
    if (window.confirm("האם אתה בטוח שברצונך להגיש את המבחן? לא תוכל לשנות תשובות לאחר ההגשה.")) {
      calculateResults();
      setExamCompleted(true);
      setShowResults(true);
    }
  };

  const handleTimeUp = () => {
    alert("הזמן נגמר! המבחן יוגש אוטומטית.");
    calculateResults();
    setExamCompleted(true);
    setShowResults(true);
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    const results = {};

    exercises.forEach((exercise) => {
      const questionId = exercise.ExerciseID;
      const selectedAnswer = selectedAnswers[questionId];
      
      if (selectedAnswer) {
        // Parse answer options
        let answerOptions = [];
        try {
          if (exercise.AnswerOptions) {
            answerOptions = typeof exercise.AnswerOptions === 'string' 
              ? JSON.parse(exercise.AnswerOptions) 
              : exercise.AnswerOptions;
          }
        } catch (error) {
          console.warn('Failed to parse AnswerOptions:', error);
          answerOptions = [];
        }

        // Get correct answer text
        let correctAnswerText = exercise.CorrectAnswer;
        if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(String(exercise.CorrectAnswer).trim())) {
          const letterIndex = String(exercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) - 65;
          if (letterIndex >= 0 && letterIndex < answerOptions.length) {
            correctAnswerText = answerOptions[letterIndex];
          }
        }

        const isCorrect = String(selectedAnswer).trim() === String(correctAnswerText).trim();
        if (isCorrect) {
          correctAnswers++;
        }

        results[questionId] = {
          selected: selectedAnswer,
          correct: correctAnswerText,
          isCorrect: isCorrect
        };
      }
    });

    const finalScore = ((correctAnswers / exercises.length) * 100).toFixed(1);
    
    // Save exam results
    saveExamResults(finalScore, results);
    
    setExamStats(prev => ({
      ...prev,
      finalScore: finalScore,
      correctAnswers: correctAnswers,
      results: results
    }));
  };

  const saveExamResults = async (finalScore, results) => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      const userId = user?.id || user?.UserID || "1";
      const examData = {
        userId: userId,
        score: finalScore,
        answers: results,
        timeSpent: (EXAM_DURATION_MINUTES * 60) - examStats.timeRemaining,
        completedAt: new Date().toISOString()
      };

      const response = await fetch(`${SERVER_URL}/api/student/exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        console.log('Exam results saved successfully');
      } else {
        console.error('Failed to save exam results');
      }
    } catch (error) {
      console.error('Error saving exam results:', error);
    }
  };

  const handleBackToDashboard = () => {
    // Navigate to student dashboard
    navigate('/student', { replace: true });
    
    // Trigger a custom event to notify the dashboard to refresh
    window.dispatchEvent(new CustomEvent('examCompleted', {
      detail: { userId: user?.id || user?.UserID }
    }));
  };

  const handleRetakeExam = () => {
    if (window.confirm("האם אתה בטוח שברצונך לקחת את המבחן שוב?")) {
      window.location.reload();
    }
  };



  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  if (!exercises || exercises.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noExercisesContainer}>
          <h2>אין שאלות במבחן</h2>
          <p>לא נמצאו שאלות למבחן זה</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;
  const isLastQuestion = currentExerciseIndex === exercises.length - 1;
  const isFirstQuestion = currentExerciseIndex === 0;

  // Parse answer options safely
  let answerOptions = [];
  try {
    if (currentExercise.AnswerOptions) {
      answerOptions = typeof currentExercise.AnswerOptions === 'string' 
        ? JSON.parse(currentExercise.AnswerOptions) 
        : currentExercise.AnswerOptions;
    }
  } catch (error) {
    console.warn('Failed to parse AnswerOptions:', error);
    answerOptions = [];
  }

  // Get the correct answer text
  let correctAnswerText = currentExercise.CorrectAnswer;
  if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(String(currentExercise.CorrectAnswer).trim())) {
    const letterIndex = String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) - 65;
    if (letterIndex >= 0 && letterIndex < answerOptions.length) {
      correctAnswerText = answerOptions[letterIndex];
    }
  }

  const currentQuestionId = currentExercise.ExerciseID;
  const currentSelectedAnswer = selectedAnswers[currentQuestionId];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBackToDashboard} className={styles.backButton}>
          <FiArrowLeft />
          חזור לדשבורד
        </button>
        <div className={styles.headerInfo}>
          <h1>מבחן כללי - כל הנושאים</h1>
          <p>בדוק את הידע שלך בכל הנושאים</p>
        </div>
        <div className={styles.examInfo}>
          <div className={styles.timeDisplay}>
            <FiClock className={styles.timeIcon} />
            <span className={examStats.timeRemaining <= 300 ? styles.timeWarning : ''}>
              {formatTime(examStats.timeRemaining)}
            </span>
          </div>
          <div className={styles.progressInfo}>
            <span>{currentExerciseIndex + 1} מתוך {exercises.length}</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation - Moved to top */}
      <div className={styles.questionNavigation}>
        <h3>ניווט בין שאלות:</h3>
        <div className={styles.questionGrid}>
          {exercises.map((exercise, index) => {
            const questionId = exercise.ExerciseID;
            const isAnswered = selectedAnswers[questionId];
            const isCurrent = index === currentExerciseIndex;
            
            return (
              <button
                key={questionId}
                className={`${styles.questionNavButton} ${
                  isCurrent ? styles.current : ''
                } ${isAnswered ? styles.answered : styles.unanswered}`}
                onClick={() => setCurrentExerciseIndex(index)}
                disabled={examCompleted}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exam Content */}
      <div className={styles.examContainer}>
        <div className={styles.examHeader}>
          <h2>שאלה {currentExerciseIndex + 1}</h2>
          <div className={styles.questionStatus}>
            {currentSelectedAnswer ? (
              <span className={styles.answered}>ענית</span>
            ) : (
              <span className={styles.unanswered}>לא ענית</span>
            )}
          </div>
        </div>

        <div className={styles.examContent}>
          {currentExercise.ContentType === 'image' && (
            <div className={styles.imageContainer}>
              <img 
                src={getImageUrl(currentExercise.ContentValue)} 
                alt="Question content"
                className={styles.questionImage}
                onError={(e) => {
                  console.error('Failed to load image:', currentExercise.ContentValue);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {currentExercise.ContentType === 'text' && (
            <div className={styles.textContainer}>
              <p>{currentExercise.ContentValue}</p>
            </div>
          )}

          <div className={styles.answerOptions}>
            <h3>בחר תשובה:</h3>
            <div className={styles.answerOptionsGrid}>
              {answerOptions.map((option, index) => {
                const isSelected = currentSelectedAnswer === option;
                
                return (
                  <button
                    key={index}
                    className={`${styles.answerOption} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => !examCompleted && handleAnswerSelect(option)}
                    disabled={examCompleted}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}.</span>
                    <span className={styles.optionText}>{option}</span>
                                         {examCompleted && showResults && (
                       <>
                         {/* Show correct icon only for the correct answer */}
                         {examStats.results?.[currentQuestionId]?.correct === option && (
                           <FiCheck className={styles.correctIcon} />
                         )}
                         {/* Show incorrect icon only for selected wrong answer */}
                         {examStats.results?.[currentQuestionId]?.selected === option && 
                          !examStats.results?.[currentQuestionId]?.isCorrect && (
                           <FiX className={styles.incorrectIcon} />
                         )}
                       </>
                     )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!examCompleted && (
          <div className={styles.submitSection}>
            <div className={styles.submitInfo}>
              <FiAlertTriangle className={styles.warningIcon} />
              <span>ענית על {examStats.answeredQuestions} מתוך {examStats.totalQuestions} שאלות</span>
            </div>
            <button
              className={styles.submitExamButton}
              onClick={handleSubmitExam}
            >
              <FiSave />
              הגש מבחן
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={styles.navigationButtons}>
          <button
            className={`${styles.navButton} ${isFirstQuestion ? styles.disabled : ''}`}
            onClick={handlePreviousQuestion}
            disabled={isFirstQuestion}
          >
            שאלה קודמת
          </button>
          
          <button
            className={`${styles.navButton} ${isLastQuestion ? styles.disabled : ''}`}
            onClick={handleNextQuestion}
            disabled={isLastQuestion}
          >
            שאלה הבאה
          </button>
        </div>

        {/* Results Display */}
        {examCompleted && showResults && (
          <div className={styles.resultsContainer}>
            <div className={styles.resultsHeader}>
              <h2>תוצאות המבחן</h2>
              <div className={styles.finalScore}>
                ציון סופי: {examStats.finalScore}%
              </div>
            </div>
            
            <div className={styles.resultsSummary}>
              <div className={styles.resultStat}>
                <span>שאלות נכונות:</span>
                <span className={styles.correctCount}>{examStats.correctAnswers}</span>
              </div>
              <div className={styles.resultStat}>
                <span>סה"כ שאלות:</span>
                <span>{examStats.totalQuestions}</span>
              </div>
              <div className={styles.resultStat}>
                <span>זמן שהושקע:</span>
                <span>{formatTime((EXAM_DURATION_MINUTES * 60) - examStats.timeRemaining)}</span>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button onClick={handleBackToDashboard} className={styles.backToDashboardButton}>
                חזור לדף הבית
              </button>
              <button onClick={handleRetakeExam} className={styles.retakeButton}>
              מבחן חוזר
              </button>
            </div>
          </div>
        )}
      </div>




    </div>
  );
}
