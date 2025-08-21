import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiPlay } from "react-icons/fi";
import styles from "./practiceQuestions.module.css";

export default function PracticeQuestions() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPracticeData();
  }, [topicId]);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/practice/topic/${topicId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch practice data");
      }
      
      const data = await response.json();
      setTopicData(data.topic);
      setExercises(data.exercises);
    } catch (err) {
      console.error("Error fetching practice data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentExercise = exercises[currentExerciseIndex];
    const isCorrect = selectedAnswer === currentExercise.CorrectAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleFinishPractice = () => {
    const finalScore = ((score / exercises.length) * 100).toFixed(1);
    // You can save the practice results here if needed
    navigate(`/student/practice-dashboard/${topicId}?score=${finalScore}`);
  };

  const handleBackToDashboard = () => {
    navigate(`/student/practice-dashboard/${topicId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען תרגילים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>שגיאה בטעינת התרגילים</h2>
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
          <h2>אין תרגילים זמינים</h2>
          <p>לא נמצאו תרגילים עבור נושא זה</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBackToDashboard} className={styles.backButton}>
          <FiArrowLeft />
          חזור לדשבורד
        </button>
        <div className={styles.headerInfo}>
          <h1>{topicData?.name}</h1>
          <p>תרגול שאלות</p>
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

      {/* Exercise Content */}
      <div className={styles.exerciseContainer}>
        <div className={styles.exerciseHeader}>
          <h2>שאלה {currentExerciseIndex + 1}</h2>
          <div className={styles.scoreDisplay}>
            ציון: {score}/{currentExerciseIndex + 1}
          </div>
        </div>

        <div className={styles.exerciseContent}>
          {currentExercise.ContentType === 'image' && (
            <div className={styles.imageContainer}>
              <img 
                src={currentExercise.ContentValue} 
                alt="Question content"
                className={styles.questionImage}
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
            {JSON.parse(currentExercise.AnswerOptions).map((option, index) => (
              <button
                key={index}
                className={`${styles.answerOption} ${
                  selectedAnswer === option ? styles.selected : ""
                } ${
                  showResult && option === currentExercise.CorrectAnswer
                    ? styles.correct
                    : showResult && selectedAnswer === option && option !== currentExercise.CorrectAnswer
                    ? styles.incorrect
                    : ""
                }`}
                onClick={() => !showResult && handleAnswerSelect(option)}
                disabled={showResult}
              >
                {option}
                {showResult && option === currentExercise.CorrectAnswer && (
                  <FiCheck className={styles.correctIcon} />
                )}
                {showResult && selectedAnswer === option && option !== currentExercise.CorrectAnswer && (
                  <FiX className={styles.incorrectIcon} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!showResult ? (
            <button
              className={`${styles.submitButton} ${
                selectedAnswer ? styles.active : styles.disabled
              }`}
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              שלח תשובה
            </button>
          ) : (
            <div className={styles.resultButtons}>
              {isLastExercise ? (
                <button
                  className={styles.finishButton}
                  onClick={handleFinishPractice}
                >
                  סיים תרגול
                </button>
              ) : (
                <button
                  className={styles.nextButton}
                  onClick={handleNextExercise}
                >
                  שאלה הבאה
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={styles.resultDisplay}>
            <div className={`${styles.resultMessage} ${
              selectedAnswer === currentExercise.CorrectAnswer 
                ? styles.correctMessage 
                : styles.incorrectMessage
            }`}>
              {selectedAnswer === currentExercise.CorrectAnswer ? (
                <>
                  <FiCheck />
                  תשובה נכונה!
                </>
              ) : (
                <>
                  <FiX />
                  תשובה שגויה. התשובה הנכונה היא: {currentExercise.CorrectAnswer}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
