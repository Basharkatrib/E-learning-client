import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useForgotPasswordMutation } from '../../redux/features/apiSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';


function ForgetPassword() {
  const theme = useSelector(selectTheme);
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await forgotPassword({ email }).unwrap();
      setSuccessMsg(t('If your email exists in our system, you will receive a password reset link. Please check your inbox.'));
    } catch (err) {
      setErrorMsg(err?.data?.message || t('Something went wrong. Please try again.'));
    }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen pt-16 pb-8 flex items-center justify-center ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-4 lg:p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'}`}
            >
              <h2 className={`text-2xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('Forgot Password')}</h2>
              <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('Enter your email to reset your password')}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Email Address')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Enter your email")}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-transparent`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? t('Sending...') : t('Send Reset Link')}
                </button>

                {successMsg && <p className="text-green-500 text-center text-sm mt-2">{successMsg}</p>}
                {errorMsg && <p className="text-red-500 text-center text-sm mt-2">{errorMsg}</p>}

                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('Remember your password?')}{' '}
                  <Link to="/login" className="text-primary hover:underline">{t('Login')}</Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;