import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import {
  useRegisterMutation,
  useResendVerificationMutation
} from '../../redux/features/apiSlice';
import { setEmail, selectEmail } from '../../redux/features/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const theme = useSelector(selectTheme);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const dispatch = useDispatch();
  const email = useSelector(selectEmail);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  useEffect(() => {
    console.log(email);
  }, [email]);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required(t('Full name is required')),
      email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
      password: Yup.string().min(6, t('Password must be at least 6 characters')).required(t('Password is required')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], t('Passwords must match'))
        .required(t('Please confirm your password')),
      terms: Yup.boolean().oneOf([true], t('You must accept the terms and privacy policy'))
    }),
    onSubmit: async (values) => {
      try {
        const userData = {
          name: values.fullName,
          email: values.email,
          password: values.password,
          password_confirmation: values.confirmPassword,
        };

        const res = await registerUser(userData).unwrap();
        dispatch(setEmail(values.email));
        toast.success(t('Registration successful. Please check your email for account verification. A verification link has been sent.'));
        setShowResend(true);
        console.log('Response:', res);
      } catch (err) {
        console.error(t('Registration failed:'), err);
        toast.error(err?.data?.message || t('Registration failed. Please try again.'));
      }
    }
  });

  const handleResend = async () => {
    try {
      await resendVerification(email).unwrap();
      toast.success('Verification email has been resent.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen pt-16 pb-8 flex items-center justify-center mt-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-4 lg:p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'}`}
            >
              <h2 className={`text-2xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('Sign Up')}
              </h2>
              <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('Create an account to unlock exclusive features')}
              </p>

              {/* Add Account Type Selection */}
              <div className="mb-6">
                <div className={`flex gap-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setIsTeacher(false)}
                    className={`flex-1 py-2 rounded-lg transition-all ${!isTeacher ? 'bg-primary text-white' : ''
                      }`}
                  >
                    {t('Student')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTeacher(true)}
                    className={`flex-1 py-2 rounded-lg transition-all ${isTeacher ? 'bg-primary text-white' : ''
                      }`}
                  >
                    {t('Teacher')}
                  </button>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t("Full Name")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary`}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-red-500 text-sm">{formik.errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("Email")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                  )}
                </div>
                {isTeacher && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('Upload Certificate')}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCertificate(e.target.files[0])}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                  </div>
                )}


                {/* Password */}
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={t("Password")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary`}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm">{formik.errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder={t("Confirm Password")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary`}
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="terms"
                    onChange={formik.handleChange}
                    checked={formik.values.terms}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('I agree with')}{' '}
                    <Link to="/terms" className="text-primary hover:underline">{t('Terms of Use')}</Link> {t('and')}{' '}
                    <Link to="/privacy" className="text-primary hover:underline">{t("Privacy Policy")}</Link>
                  </label>
                </div>
                {formik.touched.terms && formik.errors.terms && (
                  <p className="text-red-500 text-sm">{formik.errors.terms}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? t('Signing Up...') : t('Sign Up')}
                </button>

                {/* Resend Verification Button */}
                {showResend && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full mt-2 bg-secondary text-white py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {isResending ? t('Resending...') : t('Resend Verification Link')}
                  </button>
                )}

                {/* OR divider */}
                <div className="relative my-6">
                  <div className={`absolute inset-0 flex items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                      {t('OR')}
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700'
                    : 'border-gray-300 hover:bg-gray-50'
                    } transition-colors duration-200`}
                >
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_38_3273)">
                      <path d="M29.7083 15.3456C29.7083 14.3259 29.6256 13.3007 29.4493 12.2976H15.3008V18.0738H23.4029C23.0667 19.9368 21.9864 21.5848 20.4046 22.632V26.3799H25.2383C28.0768 23.7674 29.7083 19.9092 29.7083 15.3456Z" fill="#4285F4" />
                      <path d="M15.2989 30.001C19.3445 30.001 22.7562 28.6727 25.242 26.3799L20.4082 22.6319C19.0634 23.5469 17.3272 24.065 15.3044 24.065C11.3911 24.065 8.07311 21.4249 6.88259 17.8754H1.89453V21.739C4.44092 26.8043 9.6274 30.001 15.2989 30.001Z" fill="#34A853" />
                      <path d="M6.87895 17.8753C6.25063 16.0124 6.25063 13.9951 6.87895 12.1322V8.26849H1.89641C-0.231095 12.507 -0.231095 17.5005 1.89641 21.739L6.87895 17.8753Z" fill="#FBBC04" />
                      <path d="M15.2989 5.93708C17.4374 5.90401 19.5043 6.70871 21.0531 8.18583L25.3356 3.90327C22.6239 1.35688 19.0248 -0.0430825 15.2989 0.00101083C9.6274 0.00101083 4.44092 3.19778 1.89453 8.26851L6.87708 12.1322C8.06209 8.57716 11.3856 5.93708 15.2989 5.93708Z" fill="#EA4335" />
                    </g>
                    <defs>
                      <clipPath id="clip0_38_3273">
                        <rect width="30" height="30" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                    {t('Login with Google')}
                  </span>
                </button>

                {/* Login Link */}
                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600 '}`}>
                  {t('Do you have an account?')}{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    {t('Login')}
                  </Link>
                </p>

              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
