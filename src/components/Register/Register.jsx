import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import {
  useRegisterMutation,
  useGoogleLoginMutation
} from '../../redux/features/apiSlice';
import { setEmail, selectEmail, setCredentials } from '../../redux/features/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const theme = useSelector(selectTheme);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const dispatch = useDispatch();
  const email = useSelector(selectEmail);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(email);
  }, [email]);

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('File size should not exceed 10MB'));
        return;
      }

      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(t('Invalid file type. Please upload PDF, JPG, JPEG, or PNG'));
        return;
      }

      setCertificate(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificatePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setCertificatePreview(null);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await googleLogin().unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      toast.error(t('Failed to connect with Google. Please try again.'), {
        duration: 5000,
        style: {
          background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '❌',
      });
    }
  };

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
        if (isTeacher && certificate) {
          // Handle registration with certificate
          const formData = new FormData();
          formData.append('name', values.fullName);
          formData.append('email', values.email);
          formData.append('password', values.password);
          formData.append('password_confirmation', values.confirmPassword);
          formData.append('certificate', certificate);

          // Debug logs
          console.log('Certificate file:', certificate);
          console.log('FormData contents:');
          for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
          }

          const res = await registerUser(formData).unwrap();
          console.log('Registration response:', res);
        } else {
          // Handle regular registration without certificate
          const userData = {
            name: values.fullName,
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword,
          };

          const res = await registerUser(userData).unwrap();
          console.log('Registration response:', res);
        }

        dispatch(setEmail(values.email));
        toast.success(t('Registration successful. Please check your email for account verification. A verification link has been sent.'), {
          duration: 5000,
          style: {
            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
            border: `1px solid ${theme === 'dark' ? '#065F46' : '#D1FAE5'}`,
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '✅',
        });

        // Redirect to email verification page after successful registration
        setTimeout(() => {
          navigate(`/email-verification?email=${encodeURIComponent(values.email)}`);
        }, 2000);

        setShowResend(true);
      } catch (err) {
        console.error('Registration error:', err);
        if (err.status === 500) {
          console.error('Server error details:', err);
          toast.error(t('Server error. Please try again later.'), {
            duration: 5000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
              border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '❌',
          });
        } else if (err.data?.errors) {
          // Handle Laravel validation errors
          const errors = err.data.errors;
          let errorMessage = t('Registration failed. Please check your information.');
          
          if (errors.email) {
            errorMessage = errors.email[0];
          } else if (errors.name) {
            errorMessage = errors.name[0];
          } else if (errors.password) {
            errorMessage = errors.password[0];
          } else if (errors.certificate) {
            errorMessage = errors.certificate[0];
          } else if (err.data.message) {
            errorMessage = err.data.message;
          }
          
          toast.error(errorMessage, {
            duration: 5000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
              border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '❌',
          });
        } else if (err.data?.message) {
          toast.error(err.data.message, {
            duration: 5000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
              border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '❌',
          });
        } else {
          toast.error(t('Registration failed. Please try again.'), {
            duration: 5000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
              border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '❌',
          });
        }
      }
    }
  });



  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen pt-16 pb-8 flex items-center justify-center mt-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 lg:p-8 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700' : 'bg-white/95 backdrop-blur-sm border border-gray-200'}`}
            >
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('Sign Up')}
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('Create an account to unlock exclusive features')}
                </p>
              </div>

              {/* Account Type Selection */}
              <div className="mb-8">
                <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('Account Type')}
                </label>
                <div className={`flex gap-3 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setIsTeacher(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!isTeacher
                        ? 'bg-primary text-white shadow-lg transform scale-105'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {t('Student')}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTeacher(true)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${isTeacher
                        ? 'bg-primary text-white shadow-lg transform scale-105'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {t('Teacher')}
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t("Full Name")}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t("Enter your full name")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formik.errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t("Email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("Enter your email")}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Certificate Upload for Teachers */}
                {isTeacher && (
                  <div className="space-y-3">
                    <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('Upload Certificate')}
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${theme === 'dark'
                        ? 'border-gray-600 hover:border-primary bg-gray-700/50'
                        : 'border-gray-300 hover:border-primary bg-gray-50'
                      }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCertificateChange}
                        className="hidden"
                        id="certificate-upload"
                      />
                      <label htmlFor="certificate-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {certificate ? certificate.name : t('Click to upload certificate (PDF, JPG, PNG)')}
                        </p>
                      </label>
                    </div>
                    {certificatePreview && (
                      <div className="mt-3">
                        <img
                          src={certificatePreview}
                          alt="Certificate preview"
                          className="max-w-xs rounded-lg shadow-lg mx-auto"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t("Password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder={t("Enter your password")}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t("Confirm Password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder={t("Confirm your password")}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirmPassword}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formik.errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="terms"
                    onChange={formik.handleChange}
                    checked={formik.values.terms}
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('I agree with')}{' '}
                    <Link to="/terms" className="text-primary hover:underline font-medium">{t('Terms of Use')}</Link> {t('and')}{' '}
                    <Link to="/privacy" className="text-primary hover:underline font-medium">{t("Privacy Policy")}</Link>
                  </label>
                </div>
                {formik.touched.terms && formik.errors.terms && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formik.errors.terms}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('Signing Up...')}
                    </div>
                  ) : (
                    t('Sign Up')
                  )}
                </button>



                {/* OR divider */}
                <div className="relative">
                  <div className={`absolute inset-0 flex items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                      {t('OR')}
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                      : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    } disabled:opacity-50`}
                >
                  {isGoogleLoading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
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
                  )}
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    {isGoogleLoading ? t('Connecting to Google...') : t('Continue with Google')}
                  </span>
                </button>

                {/* Login Link */}
                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('Do you have an account?')}{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">
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