import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useLoginMutation, useGoogleLoginMutation } from '../../redux/features/apiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/features/authSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';


function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const theme = useSelector(selectTheme);
    const navigate = useNavigate();
    const [loginUser, { isLoading, isError, error }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const dispatch = useDispatch();
    const lang = useSelector(selectTranslate);
    const { t } = useTranslation();
    const location = useLocation();
    const hasShownToast = useRef(false);

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
                
                if (err?.data?.message?.toLowerCase().includes('verify')) {
                    // Special case for email verification message
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
                            className={`p-4 lg:p-8 rounded-2xl ${theme === 'dark'
                                ? 'bg-gray-800'
                                : 'bg-white shadow-xl'
                                }`}
                        >
                            <h2 className={`text-2xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('Login')}
                            </h2>
                            <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('Welcome back! Please login to your account')}
                            </p>

                            <form onSubmit={formik.handleSubmit} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t('Email')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={t("Enter Your Email")}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                            } focus:ring-2 focus:ring-primary focus:border-transparent`}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-red-500 text-sm">{formik.errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t('Password')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder={t("Enter Your Password")}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-gray-50 border-gray-300 text-gray-900'
                                                } focus:ring-2 focus:ring-primary focus:border-transparent`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className={`absolute ${lang === "ar"? "left-3" : "right-3"}  top-1/2 transform -translate-y-1/2`}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-red-500 text-sm">{formik.errors.password}</p>
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
                                    <Link to="/forget" className="text-sm text-primary hover:underline">
                                        {t("Forgot Password?")}
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? t('Logging in...') : t('Login')}
                                </button>

                                {isError && (
                                    <p className="text-red-500 text-sm text-center mt-2">
                                        {error?.data?.message || t('Something went wrong. Please try again.')}
                                    </p>
                                )}

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

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${theme === 'dark'
                                        ? 'border-gray-600 hover:bg-gray-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        } transition-colors duration-200 disabled:opacity-50`}
                                >
                                    {isGoogleLoading ? (
                                        <div className="w-6 h-6 border-2 border-t-2 border-primary rounded-full animate-spin"></div>
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
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                                        {isGoogleLoading ? t('Connecting to Google...') : t('Login with Google')}
                                    </span>
                                </button>

                                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t("Don't have an account?")}{' '}
                                    <Link to="/signup" className="text-primary hover:underline">
                                        {t('Sign Up')}
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

export default Login; 