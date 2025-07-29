import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useLoginMutation, useGoogleLoginMutation, useResendVerificationMutation } from '../../redux/features/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setCredentials, selectEmail } from '../../redux/features/authSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';


function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const theme = useSelector(selectTheme);
    const navigate = useNavigate();
    const [loginUser, { isLoading, isError, error }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
    const dispatch = useDispatch();
    const lang = useSelector(selectTranslate);
    const { t } = useTranslation();
    const location = useLocation();
    const hasShownToast = useRef(false);
    const email = useSelector(selectEmail);

    useEffect(() => {
        // Check URL parameters for token and user data
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        if (token && userStr && !hasShownToast.current) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                
                // Store in Redux
                dispatch(setCredentials({
                    user,
                    token
                }));

                // Show success message
                toast.success(t('You are logged in successfully with Google'), {
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

                hasShownToast.current = true;

                // Clear URL parameters and redirect to home
                window.history.replaceState({}, '', '/');
                navigate('/');
            } catch (err) {
                console.error('Failed to parse user data:', err);
                if (!hasShownToast.current) {
                    toast.error(t('Failed to process login data'), {
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
                    hasShownToast.current = true;
                }
            }
        }
    }, [location, dispatch, navigate, t, theme]);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            remember: false
        },
        validationSchema: Yup.object({
            email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
            password: Yup.string().required(t('Password is required')),
        }),
        onSubmit: async (values) => {
            try {
                const res = await loginUser({
                    email: values.email,
                    password: values.password,
                }).unwrap();

                dispatch(setCredentials({
                    user: res.user,
                    token: res.token
                }));
                
                toast.success(t('You are logged in successfully'), {
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
                
                navigate('/');
            } catch (err) {
                console.error('Login failed:', err);
                
                // Check if it's an email verification error (403 status)
                if (err?.status === 403 && err?.data?.email_verification_required) {
                    toast.error(err.data.message, {
                        duration: 8000,
                        style: {
                            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                            color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                            border: `1px solid ${theme === 'dark' ? '#854D0E' : '#FEF3C7'}`,
                            padding: '16px',
                            borderRadius: '12px',
                        },
                        icon: '✉️',
                    });
                    
                    // Store the email for resend functionality
                    if (err.data.email) {
                        dispatch(setEmail(err.data.email));
                    }
                } else if (err?.data?.message?.toLowerCase().includes('verify')) {
                    // Fallback for other verification messages
                    toast.error(err.data.message, {
                        duration: 6000,
                        style: {
                            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                            color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                            border: `1px solid ${theme === 'dark' ? '#854D0E' : '#FEF3C7'}`,
                            padding: '16px',
                            borderRadius: '12px',
                        },
                        icon: '✉️',
                    });
                } else {
                    // General error message
                    toast.error(err?.data?.message || t('Login failed. Please try again.'), {
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

    const handleResend = async () => {
        try {
            await resendVerification({ email }).unwrap();
            toast.success('Verification email has been resent.', {
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
        } catch (err) {
            console.error('Resend verification error:', err);
            
            // Handle specific validation errors
            let errorMessage = 'Failed to resend verification email.';
            
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

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen pt-16 pb-8 flex items-center justify-center mt-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center">
                    {/* Login Form */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`p-6 lg:p-8 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700' : 'bg-white/95 backdrop-blur-sm border border-gray-200'}`}
                        >
                            <div className="text-center mb-8">
                                <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {t('Login')}
                                </h2>
                                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t('Welcome back! Please login to your account')}
                                </p>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="space-y-3">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t('Email')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={t("Enter your email")}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                            theme === 'dark' 
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

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t('Password')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder={t("Enter your password")}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 ${
                                                theme === 'dark' 
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' 
                                                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className={`absolute ${lang === "ar"? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                                                theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
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

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            onChange={formik.handleChange}
                                            checked={formik.values.remember}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="remember" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {t('Remember me')}
                                        </label>
                                    </div>
                                    <Link to="/forget" className="text-sm text-primary hover:underline font-semibold">
                                        {t("Forgot Password?")}
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t('Logging in...')}
                                        </div>
                                    ) : (
                                        t('Login')
                                    )}
                                </button>

                                {isError && (
                                    <p className="text-red-500 text-sm text-center mt-2 flex items-center justify-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error?.data?.message || t('Something went wrong. Please try again.')}
                                    </p>
                                )}

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

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                                        theme === 'dark'
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

                                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t("Don't have an account?")}{' '}
                                    <Link to="/signup" className="text-primary hover:underline font-semibold">
                                        {t('Sign Up')}
                                    </Link>
                                </p>

                                {/* Email Verification Resend Button - Only show if email is available */}
                                {email && (
                                    <div className="mt-4 p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                {t('Email Verification Required')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                                            {t('Please verify your email address to access your account.')}
                                        </p>
                                        <div className="space-y-2">
                                            <Link
                                                to={`/email-verification?email=${encodeURIComponent(email)}`}
                                                className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {t('Go to Email Verification')}
                                            </Link>
                                          
                                        </div>
                                    </div>
                                )}

                                
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login; 