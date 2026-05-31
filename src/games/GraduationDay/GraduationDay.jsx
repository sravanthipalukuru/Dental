import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Trophy, Sparkles, Check, X, Printer, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import './GraduationDay.css';

const QUIZ_QUESTIONS = [
  {
    question: "How many times a day should you brush your teeth?",
    options: ["Once", "Twice", "Three times", "Never"],
    correct: 1,
    explanation: "You should brush your teeth at least twice a day: once in the morning and once before bed!"
  },
  {
    question: "How long should you brush your teeth each time?",
    options: ["30 seconds", "1 minute", "2 minutes", "5 minutes"],
    correct: 2,
    explanation: "Brush for 2 whole minutes to make sure every tooth gets clean!"
  },
  {
    question: "What should you use to clean between your teeth?",
    options: ["A toothbrush", "Floss", "Water", "Toothpick"],
    correct: 1,
    explanation: "Floss helps clean the tricky spots between your teeth that a toothbrush can't reach."
  }
];

const FOOD_ITEMS = [
  { id: 1, name: "Apple", type: "healthy", emoji: "🍎" },
  { id: 2, name: "Candy", type: "cavity", emoji: "🍬" },
  { id: 3, name: "Carrot", type: "healthy", emoji: "🥕" },
  { id: 4, name: "Soda", type: "cavity", emoji: "🥤" },
  { id: 5, name: "Cheese", type: "healthy", emoji: "🧀" },
  { id: 6, name: "Lollipop", type: "cavity", emoji: "🍭" }
];

const GraduationDay = () => {
  const navigate = useNavigate();
  const { user, completeGameLevel } = useStore();
  
  const [gameState, setGameState] = useState('intro'); // intro, quiz, food, certificate
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [foodItems, setFoodItems] = useState(FOOD_ITEMS);
  const [sortedFoods, setSortedFoods] = useState({ healthy: [], cavity: [] });
  const [draggedFood, setDraggedFood] = useState(null);
  
  const [studentName, setStudentName] = useState(user?.username || '');
  const certificateRef = useRef(null);

  const handleStart = () => {
    setGameState('quiz');
  };

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === QUIZ_QUESTIONS[currentQuizIndex].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setGameState('food');
    }
  };

  const handleDragStart = (food) => {
    setDraggedFood(food);
  };

  const handleDrop = (e, targetType) => {
    e.preventDefault();
    if (!draggedFood) return;

    if (draggedFood.type === targetType) {
      setSortedFoods(prev => ({
        ...prev,
        [targetType]: [...prev[targetType], draggedFood]
      }));
      setFoodItems(prev => prev.filter(f => f.id !== draggedFood.id));
    } else {
      // Wrong bin - maybe play a buzz sound or shake animation here
      const el = document.getElementById(`food-${draggedFood.id}`);
      if(el) {
        el.classList.add('shake-animation');
        setTimeout(() => el.classList.remove('shake-animation'), 500);
      }
    }
    setDraggedFood(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (gameState === 'food' && foodItems.length === 0) {
      setTimeout(() => {
        setGameState('certificate');
      }, 1500);
    }
  }, [foodItems, gameState]);

  const handleClaimCertificate = async () => {
    if (!studentName.trim()) return;
    
    // Complete game
    await completeGameLevel(20, 10); // Game 20, max level to trigger graduation badge
    
    // Fire confetti or effects here (omitted for brevity, assume CSS/simple animations handle this)
    setGameState('celebration');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="game-container graduation-day-container">
      <div className="game-header no-print">
        <button className="back-btn" onClick={() => navigate('/games')}>
          <ArrowLeft size={24} />
        </button>
        <div className="game-title">
          <Award className="game-icon" />
          <h1>Graduation Day</h1>
        </div>
        <div className="score-display">
          <Star className="star-icon" />
          <span>Super Smile Academy</span>
        </div>
      </div>

      <div className="game-content">
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div 
              key="intro"
              className="graduation-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="trophy-container">
                <Trophy size={80} className="trophy-icon" />
                <Sparkles size={40} className="sparkles top-left" />
                <Sparkles size={40} className="sparkles bottom-right" />
              </div>
              <h2>Final Exam!</h2>
              <p>Welcome to your final test at the Super Smile Academy. Prove your dental knowledge to earn your official certificate and badge!</p>
              <div className="challenge-steps">
                <div className="step"><span>1</span> Answer Trivia</div>
                <div className="step"><span>2</span> Sort Foods</div>
                <div className="step"><span>3</span> Graduate!</div>
              </div>
              <button className="start-btn graduation-btn" onClick={handleStart}>
                Start Exam <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {gameState === 'quiz' && (
            <motion.div 
              key="quiz"
              className="graduation-quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="quiz-progress">
                Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
              </div>
              <h2 className="quiz-question">{QUIZ_QUESTIONS[currentQuizIndex].question}</h2>
              
              <div className="quiz-options">
                {QUIZ_QUESTIONS[currentQuizIndex].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === QUIZ_QUESTIONS[currentQuizIndex].correct;
                  let className = 'quiz-option';
                  
                  if (selectedAnswer !== null) {
                    if (isCorrect) className += ' correct';
                    else if (isSelected) className += ' incorrect';
                    else className += ' disabled';
                  }

                  return (
                    <button 
                      key={index} 
                      className={className}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                      {selectedAnswer !== null && isCorrect && <Check size={20} className="result-icon" />}
                      {isSelected && !isCorrect && <X size={20} className="result-icon" />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div 
                  className="quiz-explanation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>{QUIZ_QUESTIONS[currentQuizIndex].explanation}</p>
                  <button className="next-btn" onClick={handleNextQuestion}>
                    {currentQuizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'To Food Sorting'} <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'food' && (
            <motion.div 
              key="food"
              className="graduation-food-sort"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <h2>Sort the Foods!</h2>
              <p>Drag the healthy foods to the tooth, and cavity-causing foods to the trash!</p>
              
              <div className="food-sorting-area">
                <div 
                  className="drop-zone healthy-zone"
                  onDrop={(e) => handleDrop(e, 'healthy')}
                  onDragOver={handleDragOver}
                >
                  <div className="zone-icon">🦷</div>
                  <h3>Happy Tooth</h3>
                  <div className="sorted-items">
                    {sortedFoods.healthy.map(f => <span key={f.id} className="sorted-emoji">{f.emoji}</span>)}
                  </div>
                </div>

                <div className="food-pool">
                  {foodItems.map(food => (
                    <div 
                      key={food.id}
                      id={`food-${food.id}`}
                      className="draggable-food"
                      draggable
                      onDragStart={() => handleDragStart(food)}
                    >
                      {food.emoji}
                    </div>
                  ))}
                </div>

                <div 
                  className="drop-zone cavity-zone"
                  onDrop={(e) => handleDrop(e, 'cavity')}
                  onDragOver={handleDragOver}
                >
                  <div className="zone-icon">🗑️</div>
                  <h3>Trash</h3>
                  <div className="sorted-items">
                    {sortedFoods.cavity.map(f => <span key={f.id} className="sorted-emoji">{f.emoji}</span>)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'certificate' && (
            <motion.div 
              key="certificate-form"
              className="certificate-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>You Passed! 🎉</h2>
              <p>Enter your name to claim your Official Super Smile Certificate.</p>
              
              <div className="name-input-group">
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Your Name"
                  className="name-input"
                  maxLength={25}
                />
              </div>
              
              <button 
                className="graduation-btn claim-btn" 
                onClick={handleClaimCertificate}
                disabled={!studentName.trim()}
              >
                Claim Certificate & Badge <Award size={20} />
              </button>
            </motion.div>
          )}

          {gameState === 'celebration' && (
            <motion.div 
              key="celebration"
              className="graduation-celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="certificate-wrapper" ref={certificateRef}>
                <div className="certificate">
                  <div className="certificate-border">
                    <div className="certificate-header">
                      <Trophy size={60} className="cert-icon" />
                      <h1>Certificate of Achievement</h1>
                      <Trophy size={60} className="cert-icon" />
                    </div>
                    
                    <p className="cert-subtitle">This proudly certifies that</p>
                    
                    <h2 className="cert-name">{studentName || 'Super Brusher'}</h2>
                    
                    <p className="cert-body">
                      Has successfully completed the <strong>Super Smile Academy</strong> training program. 
                      They have demonstrated excellent knowledge in dental hygiene, brushing techniques, and healthy eating habits!
                    </p>
                    
                    <div className="cert-footer">
                      <div className="signature-line">
                        <div className="signature-font">Dr. Sparkle</div>
                        <span>Chief Dentist</span>
                      </div>
                      
                      <div className="seal">
                        <div className="seal-inner">
                          <Award size={40} />
                          <span>OFFICIAL</span>
                        </div>
                      </div>
                      
                      <div className="signature-line date-line">
                        <div className="date-font">{new Date().toLocaleDateString()}</div>
                        <span>Date</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="celebration-actions no-print">
                <button className="graduation-btn print-btn" onClick={handlePrint}>
                  <Printer size={20} /> Print Certificate
                </button>
                <button className="graduation-btn secondary" onClick={() => navigate('/games')}>
                  Back to Games
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GraduationDay;
