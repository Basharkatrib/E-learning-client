import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectToken } from '../../redux/features/authSlice';
import { useGetQuizQuery, useSubmitQuizMutation } from '../../redux/features/apiSlice';
import LoadingPage from '../LoadingPage/LoadingPage';
import { toast } from 'react-toastify';
import { selectTranslate } from '../../redux/features/translateSlice';

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useSelector(selectTheme);
  const token = useSelector(selectToken);
  const lang = useSelector(selectTranslate);
  const isDark = theme === 'dark';

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const { data: quizzes, isLoading, error } = useGetQuizQuery({
    courseId,
    token,
  });

  const [submitQuiz] = useSubmitQuizMutation();

  useEffect(() => {
    if (quizzes && quizzes.length > 0) {
      const quiz = quizzes.find(q => q.id === parseInt(quizId));
      if (quiz) {
        setCurrentQuiz(quiz);
        setTimeLeft(quiz.time_limit * 60);
      }
    }
  }, [quizzes, quizId]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (isTimeUp = false) => {
    if (!isTimeUp && Object.keys(selectedAnswers).length < currentQuiz?.questions?.length) {
      toast.error(t('Please answer all questions'));
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitQuiz({
        courseId,
        quizId,
        answers: selectedAnswers,
        token,
      }).unwrap();

      setQuizResult(result);
      setShowResult(true);

      if (isTimeUp) {
        toast.error(t('Time is up! Quiz submitted automatically'));
      } else {
        if (result.passed) {
          toast.success(t('Congratulations! You passed the quiz'));
        } else {
          toast.warning(t('Quiz completed. Keep practicing to improve your score!'));
        }
      }
    } catch (err) {
      toast.error(t('Error submitting quiz'));
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (error || !currentQuiz) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <h2 className="text-xl font-semibold text-red-500">{t('Error loading quiz')}</h2>
          <p className="text-sm text-gray-400">{t('Please try again later')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mt-20 py-8 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{currentQuiz.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{currentQuiz.description}</p>
          </div>
          {timeLeft !== null && !showResult && (
            <div className={`px-6 py-3 rounded-lg text-lg font-mono font-bold ${
              timeLeft < 300 
                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {showResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                quizResult.passed
                  ? 'bg-green-100 text-green-500'
                  : 'bg-yellow-100 text-yellow-500'
              }`}>
                {quizResult.passed ? (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {quizResult.passed ? t('Quiz Passed!') : t('Quiz Completed')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {quizResult.passed
                  ? t('Congratulations on passing the quiz!')
                  : t('Keep practicing to improve your score.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">{t('Your Score')}</h3>
                <p className="text-3xl font-bold text-primary">{Math.round(quizResult.score)}%</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">{t('Correct Answers')}</h3>
                <p className="text-3xl font-bold text-primary">
                  {quizResult.correct_answers} / {quizResult.total_questions}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                {t('Return to Course')}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="space-y-8">
              {currentQuiz.questions?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h3 className="text-xl font-semibold mb-4">
                    {index + 1}. {question.question_text}
                  </h3>
                  <div className="space-y-3">
                    {question.options?.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all
                          ${selectedAnswers[question.id] === option.id
                            ? (isDark ? 'bg-primary text-white' : 'bg-primary/10 border-primary')
                            : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100')}
                          border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={selectedAnswers[question.id] === option.id}
                          onChange={() => handleAnswerSelect(question.id, option.id)}
                          className="hidden"
                        />
                        <span className="ml-2">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('Questions answered')}: {Object.keys(selectedAnswers).length} / {currentQuiz.questions?.length}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-bold text-white
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}
                    transition-all shadow-lg`}
                >
                  {isSubmitting ? t('Submitting...') : t('Submit Quiz')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage; 