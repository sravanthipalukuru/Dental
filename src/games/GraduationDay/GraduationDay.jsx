import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Trophy, Sparkles, Check, X, Printer, ArrowRight, RotateCw, Smile, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './GraduationDay.css';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "How many times a day should you brush your teeth?",
    options: [
      { text: "Only when they look dirty 🙈", isCorrect: false },
      { text: "Once in the morning ☀️", isCorrect: false },
      { text: "Twice a day (morning and night) ☀️🌙", isCorrect: true }
    ],
    hint: "Think about brushing when you wake up and before you go to bed!",
    explanation: "Excellent! Brushing twice a day (morning and night) protects your teeth from sugar bugs while you eat and sleep!"
  },
  {
    id: 2,
    question: "How long should you brush your teeth for every time?",
    options: [
      { text: "5 seconds (super fast!) ⚡", isCorrect: false },
      { text: "2 minutes (about the length of a song) ⏱️", isCorrect: true },
      { text: "1 hour (all day long!) 🐢", isCorrect: false }
    ],
    hint: "Dentists recommend humming your favorite song twice while brushing!",
    explanation: "Perfect! 2 minutes is the magic number to make sure you brush every single surface of your teeth!"
  },
  {
    id: 3,
    question: "What is the best way to clean between your teeth where a toothbrush can't reach?",
    options: [
      { text: "With dental floss 🧵", isCorrect: true },
      { text: "With a sharp toothpick 📍", isCorrect: false },
      { text: "Using a paperclip 📎", isCorrect: false }
    ],
    hint: "It looks like a thin string and slides gently between your teeth!",
    explanation: "Spot on! Floss is the only safe tool that can reach plaque hiding in between teeth."
  },
  {
    id: 4,
    question: "Why does the dentist use a tiny mirror during your checkup?",
    options: [
      { text: "To see the backs and hidden parts of your teeth 🪞", isCorrect: true },
      { text: "To check if their hair looks good 💇", isCorrect: false },
      { text: "To make coins disappear 🪄", isCorrect: false }
    ],
    hint: "It helps them see around corners inside your mouth!",
    explanation: "Great job! The dental mirror helps the dentist inspect hard-to-see spots for cavity bugs."
  },
  {
    id: 5,
    question: "How often should you visit the dentist for a checkup?",
    options: [
      { text: "Only when you have a toothache 😢", isCorrect: false },
      { text: "Twice a year (every 6 months) 🗓️", isCorrect: true },
      { text: "Every single day 📅", isCorrect: false }
    ],
    hint: "Visiting twice a year keeps your smile healthy and catches bugs early!",
    explanation: "Correct! Standard dental visits twice a year keep your mouth clean and prevent tooth issues before they start!"
  }
];

const FOOD_ITEMS = [
  { name: "Crispy Apple 🍎", isHealthy: true, desc: "A crunchy fruit that acts like a natural toothbrush!" },
  { name: "Sticky Lollipop 🍭", isHealthy: false, desc: "Leaves sticky sugars behind that cavity bugs love!" },
  { name: "Crunchy Broccoli 🥦", isHealthy: true, desc: "Packed with vitamins and calcium to strengthen enamel!" },
  { name: "Fizzy Soda 🥤", isHealthy: false, desc: "Full of acids and sugar that can erode tooth enamel!" },
  { name: "Tasty Cheese 🧀", isHealthy: true, desc: "Creates a protective shield on teeth and neutralizes acids!" },
  { name: "Sugary Donut 🍩", isHealthy: false, desc: "Leaves sticky dough and high sugars stuck in tooth grooves!" }
];

export default function GraduationDay() {
  const [gameState, setGameState] = useState('intro'); // intro, quiz, food-sorter, ceremony, credits
  
  // Quiz states
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Food sorter states
  const [foodIdx, setFoodIdx] = useState(0);
  const [foodFeedback, setFoodFeedback] = useState(false);
  const [foodFeedbackCorrect, setFoodFeedbackCorrect] = useState(null);
  const [foodScore, setFoodScore] = useState(0);

  // Ceremony states
  const [studentName, setStudentName] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const totalScore = useStore(state => state.totalScore);
  const userId = useStore(state => state.userId);

  // Handle quiz selection
  const handleSelectQuizOption = (option, idx) => {
    if (quizFeedback) return;
    setQuizAnswer(idx);
    setQuizFeedback(true);
    if (option.isCorrect) {
      setQuizScore(prev => prev + 1);
      // Nice micro confetti
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    }
  };

  const handleNextQuiz = () => {
    setQuizAnswer(null);
    setQuizFeedback(false);
    if (quizIdx + 1 < QUIZ_QUESTIONS.length) {
      setQuizIdx(prev => prev + 1);
    } else {
      setGameState('food-sorter');
    }
  };

  // Handle food sorting
  const handleSortFood = (chooseHealthy) => {
    if (foodFeedback) return;
    
    const food = FOOD_ITEMS[foodIdx];
    const isCorrect = food.isHealthy === chooseHealthy;
    
    setFoodFeedbackCorrect(isCorrect);
    setFoodFeedback(true);
    
    if (isCorrect) {
      setFoodScore(prev => prev + 1);
      confetti({ particleCount: 20, spread: 30, colors: ['#4ECDC4', '#95E1D3'] });
    }
  };

  const handleNextFood = () => {
    setFoodFeedback(false);
    setFoodFeedbackCorrect(null);
    if (foodIdx + 1 < FOOD_ITEMS.length) {
      setFoodIdx(prev => prev + 1);
    } else {
      setGameState('ceremony');
    }
  };

  // Trigger certificate celebration
  const handleGraduate = async () => {
    if (isSavingProgress) return;
    setIsSavingProgress(true);

    // Trigger full fireworks
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    // Call store action to complete level 20 (Graduation Day)
    await completeGameLevel(20);

    setTimeout(() => {
      setGameState('credits');
      setIsSavingProgress(false);
    }, 6000);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetGame = () => {
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizFeedback(false);
    setQuizScore(0);
    setFoodIdx(0);
    setFoodFeedback(false);
    setFoodFeedbackCorrect(null);
    setFoodScore(0);
    setGameState('intro');
  };

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[quizIdx];

  const totalFoods = FOOD_ITEMS.length;
  const currentFood = FOOD_ITEMS[foodIdx];

  const percentProgress = ((quizIdx) / totalQuestions) * 100;
  const foodPercentProgress = ((foodIdx) / totalFoods) * 100;

  return (
    <div className="graduation-day-game">
      <header className="game-header print:hidden">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back to Clinic</Link>
        <div className="game-title-text font-bold text-white text-xl">Super Smile Academy 🎓</div>
      </header>

      <div className="container game-container">
        
        {/* ── PHASE 1: INTRO SCREEN ── */}
        {gameState === 'intro' && (
          <motion.div 
            className="game-card card max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="academy-badge mb-4">🎓</div>
            <h1 className="game-title text-4xl mb-4">Super Smile Graduation!</h1>
            <p className="game-subtitle text-lg mb-6">
              Welcome to the Graduation Day Academy! You've learned how to care for your teeth, 
              met the dentist's tools, and defended against sugar bugs.
            </p>
            
            <div className="requirement-box text-left mb-8 card bg-slate-900/40 border-slate-700">
              <h3 className="text-teal-400 font-bold mb-3 flex items-center gap-2">
                <Sparkles size={18} /> Graduation Requirements:
              </h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">✅ <span><strong>Challenge 1:</strong> Dental Hygiene Trivia (5 questions)</span></li>
                <li className="flex items-center gap-2">✅ <span><strong>Challenge 2:</strong> Healthy Food Sorter (6 food cards)</span></li>
                <li className="flex items-center gap-2">✅ <span><strong>Ceremony:</strong> Personalize and Print your Graduation Diploma!</span></li>
              </ul>
            </div>

            <button 
              className="btn btn-primary btn-lg w-full py-4 text-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform" 
              onClick={() => setGameState('quiz')}
            >
              Start Graduation Challenge <ArrowRight />
            </button>
          </motion.div>
        )}

        {/* ── PHASE 2: QUIZ CHALLENGE ── */}
        {gameState === 'quiz' && (
          <div className="quiz-view max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-2 text-white/80">
              <span className="text-sm font-semibold uppercase tracking-wider">Challenge 1: Trivia</span>
              <span className="text-sm font-semibold">{quizIdx + 1} / {totalQuestions}</span>
            </div>
            
            <div className="meter-bg mb-6">
              <div className="meter-fill bg-teal" style={{ width: `${percentProgress}%` }}></div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quizIdx}
                className="game-card card"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="question-text text-2xl mb-6 text-slate-800">{currentQuestion.question}</h2>

                <div className="options-list space-y-3 mb-6">
                  {currentQuestion.options.map((opt, idx) => {
                    let btnClass = "option-btn";
                    if (quizFeedback) {
                      if (opt.isCorrect) btnClass += " correct";
                      else if (quizAnswer === idx) btnClass += " incorrect";
                      else btnClass += " disabled";
                    } else if (quizAnswer === idx) {
                      btnClass += " selected";
                    }

                    return (
                      <button
                        key={idx}
                        className={btnClass}
                        disabled={quizFeedback}
                        onClick={() => handleSelectQuizOption(opt, idx)}
                      >
                        <span className="option-label">{idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}</span>
                        <span className="option-text">{opt.text}</span>
                        {quizFeedback && opt.isCorrect && <Check size={20} className="check-icon text-green-500" />}
                        {quizFeedback && quizAnswer === idx && !opt.isCorrect && <X size={20} className="x-icon text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {quizFeedback && (
                  <motion.div 
                    className={`feedback-box card p-4 mb-6 ${currentQuestion.options[quizAnswer].isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <p className={`text-base font-medium ${currentQuestion.options[quizAnswer].isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {currentQuestion.options[quizAnswer].isCorrect ? '🎉 Correct!' : '💡 Keep Learning!'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {currentQuestion.options[quizAnswer].isCorrect 
                        ? currentQuestion.explanation 
                        : `Not quite! Hint: ${currentQuestion.hint}`}
                    </p>
                  </motion.div>
                )}

                {quizFeedback && (
                  <button 
                    className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                    onClick={handleNextQuiz}
                  >
                    {quizIdx + 1 === totalQuestions ? 'Next Challenge' : 'Next Question'} <ArrowRight size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── PHASE 3: FOOD SORTER CHALLENGE ── */}
        {gameState === 'food-sorter' && (
          <div className="food-sorter-view max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-2 text-white/80">
              <span className="text-sm font-semibold uppercase tracking-wider">Challenge 2: Healthy Sorter</span>
              <span className="text-sm font-semibold">{foodIdx + 1} / {totalFoods}</span>
            </div>
            
            <div className="meter-bg mb-6">
              <div className="meter-fill bg-yellow" style={{ width: `${foodPercentProgress}%` }}></div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={foodIdx}
                className="game-card card text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="food-badge mb-2">🍽️</div>
                <h2 className="text-gray-500 text-sm uppercase tracking-wide mb-1">Is this food healthy for teeth?</h2>
                <h1 className="food-name text-4xl font-bold mb-6 text-slate-800">{currentFood.name}</h1>

                <div className="sorter-actions grid grid-cols-2 gap-4 mb-6">
                  <button
                    className={`btn btn-large sort-btn healthy flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-green-200 hover:bg-green-50 transition-all ${foodFeedback ? 'disabled' : ''}`}
                    disabled={foodFeedback}
                    onClick={() => handleSortFood(true)}
                  >
                    <span className="text-3xl mb-2">🍏</span>
                    <span className="font-bold text-green-700">Tooth Friend</span>
                  </button>

                  <button
                    className={`btn btn-large sort-btn unhealthy flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-red-200 hover:bg-red-50 transition-all ${foodFeedback ? 'disabled' : ''}`}
                    disabled={foodFeedback}
                    onClick={() => handleSortFood(false)}
                  >
                    <span className="text-3xl mb-2">😈</span>
                    <span className="font-bold text-red-700">Sugar Bug</span>
                  </button>
                </div>

                {foodFeedback && (
                  <motion.div 
                    className={`feedback-box card p-4 mb-6 ${foodFeedbackCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <h3 className={`text-base font-bold flex items-center justify-center gap-2 ${foodFeedbackCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {foodFeedbackCorrect ? <Check size={18} /> : <X size={18} />}
                      {foodFeedbackCorrect ? "Great sorting!" : "Oops, try again next time!"}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{currentFood.desc}</p>
                  </motion.div>
                )}

                {foodFeedback && (
                  <button 
                    className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                    onClick={handleNextFood}
                  >
                    {foodIdx + 1 === totalFoods ? 'Go to Graduation Ceremony' : 'Next Food'} <ArrowRight size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── PHASE 4: CEREMONY ── */}
        {gameState === 'ceremony' && (
          <div className="ceremony-view-container max-w-3xl mx-auto">
            
            {/* Form Inputs (Hidden during Print) */}
            <div className="print:hidden text-center mb-8 card bg-slate-900/60 border-slate-700 p-6 text-white">
              <Trophy size={48} className="text-yellow-400 mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Welcome to the Podium!</h1>
              <p className="text-gray-300 max-w-md mx-auto mb-6">
                You passed the academy challenges! You got <strong>{quizScore} / {totalQuestions}</strong> in Trivia 
                and <strong>{foodScore} / {totalFoods}</strong> in Food Sorting.
              </p>

              <div className="name-form max-w-sm mx-auto flex flex-col items-center gap-3">
                <label className="text-sm text-teal-400 font-bold uppercase tracking-wider">Type your full name for the Certificate:</label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Super Patient Name"
                  className="w-full text-center py-3 px-4 rounded-xl border-2 border-teal-300 text-dark bg-white font-semibold text-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="flex gap-4 justify-center mt-6">
                <button 
                  onClick={handlePrint}
                  disabled={!studentName.trim()}
                  className="btn btn-outline border-teal-400 text-teal-400 hover:bg-teal-400/20 py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={18} /> Print Diploma
                </button>

                <button 
                  onClick={handleGraduate}
                  disabled={!studentName.trim() || isSavingProgress}
                  className="btn btn-primary bg-yellow-400 text-slate-900 hover:bg-yellow-500 py-3 px-6 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-yellow-400/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProgress ? 'Saving...' : 'Complete Graduation!'} <Sparkles size={18} />
                </button>
              </div>
            </div>

            {/* Diploma Display (Visible during printing and on screen) */}
            <motion.div 
              className="diploma-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 60 }}
            >
              <div className="diploma">
                <div className="diploma-inner">
                  <div className="diploma-header">
                    <Award size={64} className="text-yellow-500 mb-2 mx-auto" />
                    <h1 className="font-serif text-3xl md:text-4xl text-slate-800 font-bold tracking-wide uppercase">Super Smile Academy</h1>
                  </div>

                  <p className="diploma-certifies font-serif italic text-lg text-gray-500 my-4">This certifies that</p>
                  
                  <div className="student-name-container">
                    <h2 className="student-name text-4xl md:text-5xl font-script text-teal-600 font-bold underline decoration-dotted decoration-teal-300 underline-offset-8">
                      {studentName.trim() || "Brave Smile Graduate"}
                    </h2>
                  </div>

                  <p className="diploma-description font-serif text-gray-600 my-6 max-w-lg mx-auto text-base">
                    has successfully completed all dental hygiene courses, mastered the brush-and-floss routine, 
                    and demonstrated expert bravery during pediatric dental simulation clinic checkups.
                  </p>

                  <div className="diploma-footer flex justify-between items-end border-t border-gray-300 pt-8 mt-12 px-6">
                    <div className="footer-sig text-center">
                      <div className="signature font-script text-2xl text-slate-700">Dr. Sarah Smiles</div>
                      <div className="border-t border-gray-400 w-32 mx-auto mt-1"></div>
                      <div className="title text-xs text-gray-500 uppercase tracking-widest mt-1">Chief Dentist</div>
                    </div>
                    
                    <div className="gold-seal text-center flex flex-col items-center">
                      <div className="seal-outer">
                        <div className="seal-inner">⭐</div>
                      </div>
                      <span className="text-[10px] text-yellow-600 font-bold mt-1 tracking-widest uppercase">Official Seal</span>
                    </div>

                    <div className="footer-date text-center">
                      <div className="date text-lg text-slate-700 font-bold">{new Date().toLocaleDateString()}</div>
                      <div className="border-t border-gray-400 w-32 mx-auto mt-1"></div>
                      <div className="title text-xs text-gray-500 uppercase tracking-widest mt-1">Date Issued</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── PHASE 5: CREDITS SCREEN ── */}
        {gameState === 'credits' && (
          <div className="credits-view print:hidden">
            <motion.div 
              className="credits-roll"
              initial={{ y: '80%' }}
              animate={{ y: '-120%' }}
              transition={{ duration: 18, ease: 'linear' }}
            >
              <h2 className="text-6xl font-bold text-yellow-400 mb-12 drop-shadow-lg font-title">Congratulations!</h2>
              
              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Graduation Reward</h3>
                <p className="text-5xl font-black text-white flex items-center justify-center gap-2">
                  <span>🪙 +50 Coins</span>
                </p>
              </div>

              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Experience Points</h3>
                <p className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                  <span>⭐ +20 XP</span>
                </p>
              </div>

              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Special Badge Unlocked</h3>
                <p className="text-3xl font-bold text-teal-300 flex items-center justify-center gap-2">
                  <span>🏅 Super Smile Graduate</span>
                </p>
                <p className="text-gray-400 text-sm mt-1">Check it out on your Profile page!</p>
              </div>

              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Star Patient</h3>
                <p className="text-5xl font-bold text-white">YOU!</p>
              </div>

              <div className="mt-32">
                <p className="text-2xl text-teal-300 font-bold mb-6">Keep smiling and brushing every day! 🦷✨</p>
                <div className="flex gap-4 justify-center">
                  <button className="btn btn-outline border-white text-white hover:bg-white/10" onClick={resetGame}>
                    <RotateCw size={16} /> Replay Quiz
                  </button>
                  <Link to="/" className="btn btn-primary bg-teal-400 text-slate-900 font-bold py-3 px-8 rounded-xl shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform">
                    Return to Dashboard
                  </Link>
                </div>
              </div>

            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
