import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import FAQ from '../FAQ/FAQ';
import { useGetCourseQuery, useEnrollUserMutation, useUnenrollUserMutation, useCourseEnrollmentsQuery } from '../../redux/features/apiSlice';
import { selectToken, selectCurrentUser } from '../../redux/features/authSlice';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import toast from 'react-hot-toast';
import { useIsEnrolledMutation } from '../../redux/features/apiSlice';

const dummyCourse = {
    stats: {
        series: 4,
        rating: 4.7,
        reviews: 814,
        level: 'Beginner',
        duration: '2 months',
        schedule: 'Flexible schedule',
        registered: 39969,
        startDate: 'June 6',
    },
    details: [
        { icon: '💼', title: 'Shareable Certificate', desc: 'Add to your LinkedIn profile' },
        { icon: '🌐', title: 'Studying in English', desc: '25 languages available' },
    ],
};

export default function CourseDetails() {
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const { id } = useParams();
    const lang = useSelector(selectTranslate);
    const navigate = useNavigate();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
    const [showUnenrollSuccess, setShowUnenrollSuccess] = useState(false);
    const [enrollUser, { isLoading: isEnrolling }] = useEnrollUserMutation();
    const { data, error, isLoading, refetch } = useGetCourseQuery(id, { refetchOnMountOrArgChange: true });
    const [isEnrolled, { isLoading: isCheckingEnrollment }] = useIsEnrolledMutation();
    const [enrollmentStatus, setEnrollmentStatus] = useState(false);
    const [unenrollUser, { isLoading: isUnenrolling }] = useUnenrollUserMutation();
    const { data: enrollmentsData, refetch: refetchEnrollments, error: enrollmentsError } = useCourseEnrollmentsQuery({ id, token }, {
        skip: !token
    });


    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (user && token) {
                try {
                    const response = await isEnrolled({
                        userId: user.id,
                        courseId: id,
                        token
                    }).unwrap();

                    setEnrollmentStatus(response.isEnrolled === true);
                } catch (error) {
                    setEnrollmentStatus(false);
                }
            }
        };

        checkEnrollmentStatus();
    }, [user, token, id]);



    const handleUnenroll = () => {
        setShowUnenrollConfirm(true);
    };

    const handleRegister = () => {
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        try {
            await enrollUser({ id, token }).unwrap();
            setShowConfirm(false);
            setShowCongrats(true);
            toast.success(lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Enrolled successfully!');
            refetchEnrollments();
            setEnrollmentStatus(true);
            setTimeout(() => {
                setShowCongrats(false);
                navigate(`/course/${id}`);
            }, 1800);
        } catch (e) {
            setShowConfirm(false);
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Error during enrollment');
        }
    };


    const handleUnenrollConfirm = async () => {
        try {
            await unenrollUser({ id, token }).unwrap();
            setShowUnenrollConfirm(false);
            setShowUnenrollSuccess(true); 
            toast.success(lang === 'ar' ? 'تم إلغاء التسجيل بنجاح' : 'Unenrolled successfully');
            setEnrollmentStatus(false);
            refetchEnrollments();
        } catch (error) {
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء الإلغاء' : 'Error during unenrollment');
            setShowUnenrollConfirm(false);
        }
    };




    if (isLoading) return <LoadingPage />;
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <svg
                        className="mx-auto h-12 w-12 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
                        />
                    </svg>
                    <h2 className="text-xl font-semibold text-red-500">
                        {t('Error loading courses')}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {t('Please try again later')}
                    </p>
                </div>
            </div>
        );
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen mt-18 w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <h2 className="text-xl font-bold mb-4 text-center">{lang === 'ar' ? 'تأكيد التسجيل' : 'Confirm Enrollment'}</h2>
                        <p className="mb-6 text-center">{lang === 'ar' ? 'هل أنت متأكد أنك تريد التسجيل في هذه الدورة؟' : 'Are you sure you want to enroll in this course?'}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleConfirm}
                                className="px-6 py-2 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary/90 transition"
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? (lang === 'ar' ? 'جاري التسجيل...' : 'Enrolling...') : (lang === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-bold shadow hover:bg-gray-400 transition"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCongrats && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <svg className="mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <h2 className="text-2xl font-bold mb-2 text-center">{lang === 'ar' ? 'مبروك!' : 'Congratulations!'}</h2>
                        <p className="text-center mb-2">{lang === 'ar' ? 'تم تسجيلك في الدورة بنجاح.' : 'You have been enrolled in the course successfully.'}</p>
                    </div>
                </div>
            )}
            {showUnenrollConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <h2 className="text-xl font-bold mb-4 text-center">{lang === 'ar' ? 'تأكيد إلغاء التسجيل' : 'Confirm Unenrollment'}</h2>
                        <p className="mb-6 text-center">{lang === 'ar' ? 'هل أنت متأكد أنك تريد إلغاء تسجيلك في هذه الدورة؟' : 'Are you sure you want to unenroll from this course?'}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleUnenrollConfirm} 
                                className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                                disabled={isUnenrolling}
                            >
                                {isUnenrolling
                                    ? (lang === 'ar' ? 'جاري الإلغاء...' : 'Unenrolling...')
                                    : (lang === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>

                            <button
                                onClick={() => setShowUnenrollConfirm(false)}
                                className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-bold shadow hover:bg-gray-400 transition"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showUnenrollSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <svg className="mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#ef4444" />
                            <path d="M15 10l-4 4-2-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="text-2xl font-bold mb-2 text-center">
                            {lang === 'ar' ? 'تم الإلغاء' : 'Unenrolled'}
                        </h2>
                        <p className="text-center mb-4">
                            {lang === 'ar' ? 'تم إلغاء تسجيلك في الدورة بنجاح.' : 'You have been unenrolled from the course successfully.'}
                        </p>
                        <button
                            onClick={() => setShowUnenrollSuccess(false)}
                            className="mt-2 px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
                        >
                            {lang === 'ar' ? 'تم' : 'Done'}
                        </button>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 pb-20 px-4 sm:px-6 lg:px-8 pt-9 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950"
            >
                <div className="flex-1 max-w-2xl">
                    <motion.h1
                        {...fadeInUp}
                        className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent drop-shadow-lg"
                    >
                        {data.title?.[lang]}
                    </motion.h1>
                    <p className={`text-lg mb-2 font-medium text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.description?.[lang]}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-primary">Teacher:</span>
                        <span className={`text-sm font-medium text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.teacher.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
                        {!enrollmentStatus ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleRegister}
                                disabled={isCheckingEnrollment}
                                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                                    bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${isCheckingEnrollment ? 'bg-gray-400' : ''}`}
                            >
                                {isCheckingEnrollment
                                    ? (lang === 'ar' ? 'يرجى الانتظار...' : 'Please wait...')
                                    : (lang === 'ar' ? 'سجل مجاناً' : 'Register for free')}
                                {!isCheckingEnrollment && (
                                    <span className="block text-xs font-normal mt-1">
                                        {lang === 'ar' ? 'تبدأ في' : 'Starts'} {dummyCourse.stats.startDate}
                                    </span>
                                )}
                            </motion.button>
                        ) : (
                            <div className="flex gap-3 items-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleUnenroll}
                                    disabled={isCheckingEnrollment}
                                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                                        bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isCheckingEnrollment ? 'bg-gray-400' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {isCheckingEnrollment
                                        ? (lang === 'ar' ? 'يرجى الانتظار...' : 'Please wait...')
                                        : (lang === 'ar' ? 'إلغاء التسجيل من الدورة' : 'Unenroll from course')}
                                </motion.button>
                                {/* زر مشاهدة الفيديوهات */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/course/${id}`)}
                                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2 
                                        bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white
                                        ${isDark ? '' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                                        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                    {lang === 'ar' ? 'مشاهدة الفيديوهات' : 'Watch Videos'}
                                </motion.button>
                            </div>
                        )}

                        <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 sm:mt-0`}>
                            {(enrollmentsData?.data?.length || 0).toLocaleString()} {lang === 'ar' ? 'مسجل بالفعل' : 'already registered'}
                        </span>
                    </div>
                    <div className={`text-sm text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {lang === 'ar' ? 'جرّب مجاناً: سجّل لبدء تجربتك المجانية مع وصول كامل لمدة 7 أيام.' : 'Try for free: Sign up to start your free trial with full access for 7 days.'}
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-80 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800">
                    <img src={data.thumbnail_url} alt="course" className="w-full h-full object-cover" />
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`w-full flex flex-col md:flex-row gap-6 justify-between items-stretch ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl px-6 md:px-16 py-8 mt-[-3rem] mb-16 mx-auto max-w-7xl relative z-10`}
            >
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg text-primary">{data.sections.length} <span>{t('training course series')}</span></span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('Gain in-depth knowledge of the subject')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg flex items-center gap-1">{dummyCourse.stats.rating}<span className="text-yellow-400">★</span></span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>({dummyCourse.stats.reviews} reviews)</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{t(data.difficulty_level)} {t('level')}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('No previous experience required')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{data.duration?.[lang]}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.duration?.[lang]} {t('a week')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{t(dummyCourse.stats.schedule)}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('Learn at your own pace')}</span>
                </div>
            </motion.div>

            {/* Content Container for consistent padding */}
            <div className="px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Skills Section */}
                <motion.div {...fadeInUp}>
                    <h2 className="text-2xl font-bold mb-6">{t('Skills you will acquire')}</h2>
                    <div className="flex flex-wrap gap-3">
                        {data.skills.map(skill => (
                            <span key={skill} className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm shadow-sm">
                                {skill.name.en}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dummyCourse.details.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow border border-gray-100 dark:border-gray-800">
                            <span className="text-3xl">{item.icon}</span>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{t(item.title)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t(item.desc)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">{t('The most important benefits gained from the course')}</h2>
                    <ul className="list-disc p-6 pt-2 space-y-3 text-base">
                        {data.benefits.map((b, i) => (
                            <li key={i} className={`text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{b.title?.[lang]}</li>
                        ))}
                    </ul>
                </div>

                {/* Course Groups Section */}
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            {t('Course Curriculum')}
                        </h2>
                        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                            {t('Master the fundamentals through')} {data.sections.length} {t('comprehensive modules designed by industry experts')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.sections.map((section, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: id * 0.1 }}
                                className={`group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${theme === 'dark'
                                    ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border border-gray-700'
                                    : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border border-gray-200'
                                    }`}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Section Number Badge */}
                                <div className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-10`}>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${theme === 'dark'
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'bg-primary/10 text-primary border border-primary/20'
                                        } text-sm font-bold shadow-lg backdrop-blur-sm`}>
                                        {id + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative p-8 h-64 flex flex-col items-center justify-center text-center">
                                    {/* Icon */}
                                    <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-6 ${theme === 'dark'
                                        ? 'bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary'
                                        : 'bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary'
                                        } text-4xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {id === 0 ? '🚀' : id === 1 ? '💡' : id === 2 ? '⚡' : id === 3 ? '🎯' : id === 4 ? '🏆' : '📚'}
                                    </div>

                                    {/* Title */}
                                    <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        } group-hover:text-primary transition-colors duration-300`}>
                                        {section.title?.[lang] || section.title?.en}
                                    </h3>

                                    {/* Progress Indicator */}
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                                        <div className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500 group-hover:w-full" style={{ width: '0%' }} />
                                    </div>

                                    {/* Status */}
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {section.videos?.length || 0} {t('lessons')}
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {t('Start Learning Now')}
                        </motion.button>
                        <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('Join')} {(enrollmentsData?.length || 0).toLocaleString()} {t('students already enrolled')}
                        </p>
                    </div>
                </div>
            </div>
            <FAQ Faqs={data.faqs} />

        </div>
    );
}