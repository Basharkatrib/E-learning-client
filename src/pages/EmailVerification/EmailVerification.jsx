import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import { useResendVerificationMutation } from '../../redux/features/apiSlice';
import { selectEmail } from '../../redux/features/authSlice';
import { toast } from 'react-hot-toast';

const EmailVerification = () => {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const email = useSelector(selectEmail);
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const [countdown, setCountdown] = useState(0);
  const isDark = theme === 'dark';

  // Get email from URL params or Redux state
  const userEmail = new URLSearchParams(location.search).get('email') || email;

  useEffect(() => {
    if (!userEmail) {
      navigate('/register');
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => { 
    try {
      await resendVerification({ email: userEmail }).unwrap();
      setCountdown(60); // Start 60 second countdown
      toast.success(
        lang === 'ar' 
          ? 'تم إرسال رابط التحقق مرة أخرى إلى بريدك الإلكتروني' 
          : 'Verification link has been resent to your email',
        {
          duration: 5000,
          style: {
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#1F2937',
            border: `1px solid ${isDark ? '#065F46' : '#D1FAE5'}`,
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '✅',
        }
      );
    } catch (err) {
      console.error('Resend verification error:', err);
      
      // Handle specific validation errors
      let errorMessage = lang === 'ar' ? 'فشل في إعادة إرسال رابط التحقق' : 'Failed to resend verification link';
      
      if (err?.data?.errors) {
        // Handle Laravel validation errors
        const errors = err.data.errors;
        if (errors.email) {
          errorMessage = errors.email[0];
        } else if (err.data.message) {
          errorMessage = err.data.message;
        }
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${isDark ? '#991B1B' : '#FEE2E2'}`,
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '❌',
      });
    }
  };

  const handleCheckEmail = () => {
    // Open email client or redirect to email provider
    const emailProviders = {
      'gmail.com': 'https://mail.google.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
    };

    const domain = userEmail.split('@')[1];
    const emailUrl = emailProviders[domain] || `https://${domain}`;
    
    window.open(emailUrl, '_blank');
  };

  if (!userEmail) {
    return null;
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen  mt-16 pt-16 pb-8 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-8 rounded-2xl shadow-2xl ${isDark ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700' : 'bg-white/95 backdrop-blur-sm border border-gray-200'}`}
            >
              {/* Success Icon */}
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {lang === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lang === 'ar' ? 'تم إرسال رابط التحقق إلى:' : 'We sent a verification link to:'}
                </p>
                <p className="text-primary font-semibold text-lg mt-2 break-all">
                  {userEmail}
                </p>
              </div>

              {/* Instructions */}
              <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lang === 'ar' ? 'الخطوات التالية:' : 'Next Steps:'}
                </h3>
                <ol className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </span>
                    <span>
                      {lang === 'ar' 
                        ? 'افتح بريدك الإلكتروني' 
                        : 'Open your email inbox'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </span>
                    <span>
                      {lang === 'ar' 
                        ? 'ابحث عن رسالة من منصتنا' 
                        : 'Look for an email from our platform'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </span>
                    <span>
                      {lang === 'ar' 
                        ? 'انقر على رابط التحقق في الرسالة' 
                        : 'Click the verification link in the email'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      4
                    </span>
                    <span>
                      {lang === 'ar' 
                        ? 'عد إلى الموقع وقم بتسجيل الدخول' 
                        : 'Return to the site and log in'}
                    </span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Check Email Button */}
                <button
                  onClick={handleCheckEmail}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {lang === 'ar' ? 'فتح البريد الإلكتروني' : 'Open Email'}
                </button>

                {/* Resend Button */}
                <button
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                  } disabled:opacity-50`}
                >
                  {isResending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lang === 'ar' ? `إعادة الإرسال خلال ${countdown}s` : `Resend in ${countdown}s`}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {lang === 'ar' ? 'إعادة إرسال رابط التحقق' : 'Resend Verification Link'}
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {lang === 'ar' ? 'تم التحقق من بريدك الإلكتروني؟' : 'Already verified your email?'}
                  </p>
                  <Link 
                    to="/login" 
                    className="text-primary hover:underline font-semibold text-sm inline-block mt-1"
                  >
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                </div>
              </div>

              {/* Additional Help */}
              <div className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className={`font-semibold text-sm ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                      {lang === 'ar' ? 'لم تستلم البريد الإلكتروني؟' : 'Didn\'t receive the email?'}
                    </h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      {lang === 'ar' 
                        ? 'تحقق من مجلد الرسائل غير المرغوب فيها أو اضغط على زر إعادة الإرسال أعلاه'
                        : 'Check your spam folder or click the resend button above'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 