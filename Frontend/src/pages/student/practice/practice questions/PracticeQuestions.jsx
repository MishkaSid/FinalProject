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

  // Server URL for images
  const SERVER_URL = "http://localhost:5000";

  useEffect(() => {
    fetchPracticeData();
  }, [topicId]);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/student/practice/topic/${topicId}`);
      
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
    
    // Debug logging to see what we're comparing
    console.log('=== ANSWER SUBMISSION DEBUG ===');
    console.log('Selected Answer:', selectedAnswer);
    console.log('Correct Answer:', currentExercise.CorrectAnswer);
    console.log('Answer Options:', answerOptions);
    console.log('Types - Selected:', typeof selectedAnswer, 'Correct:', typeof currentExercise.CorrectAnswer);
    
    // Check if CorrectAnswer is a letter (A, B, C, D) and convert to actual answer text
    let correctAnswerText = currentExercise.CorrectAnswer;
    if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(String(currentExercise.CorrectAnswer).trim())) {
      const letterIndex = String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (letterIndex >= 0 && letterIndex < answerOptions.length) {
        correctAnswerText = answerOptions[letterIndex];
        console.log('Converted letter to answer text:', currentExercise.CorrectAnswer, '->', correctAnswerText);
      }
    }
    
    // Ensure both values are strings for comparison
    const selectedAnswerStr = String(selectedAnswer).trim();
    const correctAnswerStr = String(correctAnswerText).trim();
    
    const isCorrect = selectedAnswerStr === correctAnswerStr;
    
    console.log('String comparison:');
    console.log('  Selected (trimmed):', `"${selectedAnswerStr}"`);
    console.log('  Correct (trimmed):', `"${correctAnswerStr}"`);
    console.log('  Is Correct:', isCorrect);
    console.log('================================');
    
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

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a relative path, add server URL
    return `${SERVER_URL}${imagePath}`;
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
            חזור
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
            חזור 
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

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

  // Get the correct answer text (handle both letter and text formats)
  let correctAnswerText = currentExercise.CorrectAnswer;
  if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(String(currentExercise.CorrectAnswer).trim())) {
    const letterIndex = String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
    if (letterIndex >= 0 && letterIndex < answerOptions.length) {
      correctAnswerText = answerOptions[letterIndex];
      console.log('Correct answer conversion:', currentExercise.CorrectAnswer, '->', correctAnswerText);
    }
  }

  // Debug: Log the current exercise data
  console.log('Current Exercise Data:', {
    ContentType: currentExercise.ContentType,
    ContentValue: currentExercise.ContentValue,
    AnswerOptions: currentExercise.AnswerOptions,
    CorrectAnswer: currentExercise.CorrectAnswer,
    CorrectAnswerText: correctAnswerText,
    ParsedAnswerOptions: answerOptions
  });

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
                // Get the correct answer text (handle both letter and text formats)
                let correctAnswerText = currentExercise.CorrectAnswer;
                if (['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(String(currentExercise.CorrectAnswer).trim())) {
                  const letterIndex = String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                  if (letterIndex >= 0 && letterIndex < answerOptions.length) {
                    correctAnswerText = answerOptions[letterIndex];
                  }
                }
                
                // Use consistent comparison method for all checks
                const isCorrectAnswer = String(option).trim() === String(correctAnswerText).trim();
                const isSelectedAnswer = selectedAnswer === option;
                const isIncorrectSelected = showResult && isSelectedAnswer && !isCorrectAnswer;
                
                // Debug logging for visual feedback
                if (showResult) {
                  console.log(`Option ${index + 1} (${option}):`, {
                    isCorrectAnswer,
                    isSelectedAnswer,
                    isIncorrectSelected,
                    optionValue: `"${option}"`,
                    correctValue: `"${currentExercise.CorrectAnswer}"`,
                    correctAnswerText: `"${correctAnswerText}"`
                  });
                }
                
                return (
                  <button
                    key={index}
                    className={`${styles.answerOption} ${
                      isSelectedAnswer ? styles.selected : ""
                    } ${
                      showResult && isCorrectAnswer
                        ? styles.correct
                        : isIncorrectSelected
                        ? styles.incorrect
                        : ""
                    }`}
                    onClick={() => !showResult && handleAnswerSelect(option)}
                    disabled={showResult}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}.</span>
                    <span className={styles.optionText}>{option}</span>
                    {showResult && isCorrectAnswer && (
                      <FiCheck className={styles.correctIcon} />
                    )}
                    {isIncorrectSelected && (
                      <FiX className={styles.incorrectIcon} />
                    )}
                  </button>
                );
              })}
            </div>
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
              String(selectedAnswer).trim() === String(correctAnswerText).trim()
                ? styles.correctMessage 
                : styles.incorrectMessage
            }`}>
              {String(selectedAnswer).trim() === String(correctAnswerText).trim() ? (
                <>
                  <FiCheck />
                  תשובה נכונה!
                </>
              ) : (
                <>
                  <FiX />
                  תשובה שגויה. התשובה הנכונה היא: {correctAnswerText}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}