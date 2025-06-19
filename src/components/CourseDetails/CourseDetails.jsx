import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import FAQ from '../FAQ/FAQ';
import image1 from '../../assets/images/courses/Image-1.png';
import image2 from '../../assets/images/courses/Image-2.png';
import image3 from '../../assets/images/courses/Image-3.png';
import { useGetCourseQuery } from '../../redux/features/apiSlice';
import { useParams } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import { Link } from 'react-router-dom';



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
    const { data, error, isLoading } = useGetCourseQuery(id);
    const lang = useSelector(selectTranslate);

    useEffect(() => {
        if (data) {
            console.log('Course data:', data);
        }
        if (error) {
            console.error('Error loading course:', error);
        }
    }, [data, error]);

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
            {/* Hero Section */}
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
                        <Link
                            to={`/course/${data.id}`}
                            className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary/90 transition text-lg"
                        >
                            Register for free
                            <span className="block text-xs font-normal mt-1">Starts {dummyCourse.stats.startDate}</span>
                        </Link>
                        <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 sm:mt-0`}>
                            {dummyCourse.stats.registered.toLocaleString()} already registered
                        </span>
                    </div>
                    <div className={`text-sm text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Try for free: Sign up to start your free trial with full access for 7 days.
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
                            {t('Join')} {dummyCourse.stats.registered.toLocaleString()} {t('students already enrolled')}
                        </p>
                    </div>
                </div>
            </div>
            <FAQ Faqs={data.faqs} />

        </div>
    );
}