import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectToken } from '../../redux/features/authSlice';
import {
  useGetQuizQuery,
  useSubmitQuizMutation,
  useCheckQuizAttemptQuery,
} from '../../redux/features/apiSlice';
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
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: quizzes, isLoading: quizLoading } = useGetQuizQuery({
    courseId,
    token
  });

  // Add debug logging
  useEffect(() => {
    console.log('Quiz Data:', quizzes);
    console.log('Course ID:', courseId);
    console.log('Quiz ID:', quizId);
  }, [quizzes, courseId, quizId]);

  const { 
    data: attemptStatus, 
    isLoading: attemptStatusLoading,
    refetch: refetchAttemptStatus 
  } = useCheckQuizAttemptQuery({
    courseId,
    quizId,
    token
  }, {
    skip: !token || !courseId || !quizId
  });

  // Add useEffect to refetch attempt status on mount
  useEffect(() => {
    if (token && courseId && quizId) {
      console.log('Checking quiz attempt status...');
      refetchAttemptStatus();
    }
  }, [token, courseId, quizId, refetchAttemptStatus]);

  const [submitQuiz] = useSubmitQuizMutation();

  // Update useEffect for handling attempt status
  useEffect(() => {
    if (attemptStatus) {
      console.log('Attempt Status:', attemptStatus);
      const hasCompletedAttempt = attemptStatus.latestAttempt?.status === 'completed';
      setHasAttempted(attemptStatus.hasAttempted);
      setIsCompleted(hasCompletedAttempt);
      
      if (attemptStatus.latestAttempt) {
        setQuizResult(attemptStatus.latestAttempt);
        setShowResult(true);
      }
    }
  }, [attemptStatus]);

  useEffect(() => {
    if (quizzes && quizzes.length > 0) {
      const quiz = quizzes.find(q => q.id === parseInt(quizId));
      if (quiz) {
        setCurrentQuiz(quiz);
        if (!isCompleted && !attemptStatus?.latestAttempt) {
          setTimeLeft(quiz.time_limit * 60);
        }
      }
    }
  }, [quizzes, quizId, isCompleted, attemptStatus]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !showResult && !isCompleted) {
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
  }, [timeLeft, showResult, isCompleted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionId) => {
    if (hasAttempted) return; // Prevent answering if already attempted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (isTimeUp = false) => {
    if (isCompleted) {
      toast.warning(t('You have already completed this quiz'));
      return;
    }
    
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
      setIsCompleted(true);

      // Refetch attempt status after successful submission
      await refetchAttemptStatus();

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
      console.error('Quiz submission error:', err);
      if (err?.status === 403 && err?.data?.error?.includes('لقد قمت بإجراء هذا الاختبار')) {
        toast.warning(t('You have already taken this quiz'));
        setIsCompleted(true);
        // Refetch attempt status to get latest results
        await refetchAttemptStatus();
      } else {
        toast.error(t('Error submitting quiz'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update loading check
  if (quizLoading || attemptStatusLoading) return <LoadingPage />;

  if (!currentQuiz) {
    return (
      <div className="min-h-screen mt-20 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">{t('Quiz Not Found')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('The requested quiz could not be found.')}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            {t('Return to Course')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mt-20 py-8 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{currentQuiz?.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{currentQuiz?.description}</p>
            {isCompleted && (
              <div className="mt-2 text-sm font-medium text-yellow-500">
                {t('You have already completed this quiz')}
              </div>
            )}
          </div>
          {timeLeft !== null && !showResult && !isCompleted && (
            <div className={`px-6 py-3 rounded-lg text-lg font-mono font-bold ${
              timeLeft < 300 
                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {(showResult || hasAttempted) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                quizResult?.passed
                  ? 'bg-green-100 text-green-500'
                  : 'bg-yellow-100 text-yellow-500'
              }`}>
                {quizResult?.passed ? (
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
                {quizResult?.passed ? t('Quiz Passed!') : t('Quiz Result')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {quizResult?.passed
                  ? t('Congratulations on passing the quiz!')
                  : t('Here is your quiz result.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">{t('Your Score')}</h3>
                <p className="text-3xl font-bold text-primary">{Math.round(quizResult?.score)}%</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">{t('Correct Answers')}</h3>
                <p className="text-3xl font-bold text-primary">
                  {quizResult?.correct_answers} / {quizResult?.total_questions}
                </p>
              </div>
            </div>

            {/* Show questions with correct/incorrect answers */}
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-bold mb-4">{t('Question Review')}</h3>
              {currentQuiz?.questions?.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <h4 className="font-semibold mb-3">
                    {index + 1}. {question.question_text}
                  </h4>
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const isSelected = quizResult?.answers?.[question.id] === option.id;
                      const isCorrect = option.is_correct === 1;
                      
                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded ${
                            isSelected
                              ? isCorrect
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                              : isCorrect
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                                : isDark
                                  ? 'bg-gray-600'
                                  : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            {isSelected && (
                              <span className="mr-2">
                                {isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                            {option.option_text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
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
              {currentQuiz?.questions?.map((question, index) => (
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
                          ${hasAttempted ? 'cursor-not-allowed opacity-70' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={selectedAnswers[question.id] === option.id}
                          onChange={() => handleAnswerSelect(question.id, option.id)}
                          className="hidden"
                          disabled={hasAttempted}
                        />
                        <span className="ml-2">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              {isCompleted ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-200">
                        {t('You have already completed this quiz. You can review your answers but cannot submit again.')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('Questions answered')}: {Object.keys(selectedAnswers).length} / {currentQuiz?.questions?.length}
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
                        ${isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90'
                        } transition-all`}
                    >
                      {isSubmitting ? t('Submitting...') : t('Submit Quiz')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage; 