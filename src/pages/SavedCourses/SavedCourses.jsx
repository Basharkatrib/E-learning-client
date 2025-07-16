import React from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useGetSavedCoursesQuery } from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import CourseCard from '../../components/CoursesPage/CourseCard';
import LoadingPage from '../LoadingPage/LoadingPage';
import { selectToken } from '../../redux/features/authSlice';
import { Navigate } from 'react-router-dom';

export default function SavedCourses() {
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);
    const token = useSelector(selectToken);
    const { t } = useTranslation();

    // Redirect if not authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const { data: savedCoursesData, isLoading, error } = useGetSavedCoursesQuery(token);

    if (isLoading) {
        return <LoadingPage />;
    }

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
                    <h2 className="text-xl font-semibold text-red-500">{t('Error loading saved courses')}</h2>
                    <p className="text-sm text-gray-400">{t('Please try again later')}</p>
                </div>
            </div>
        );
    }

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative min-h-screen w-full overflow-x-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950 transition-all duration-500" />
            <div className="mt-14 pt-16 pb-6 px-4 sm:px-6 lg:px-8">
                <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('Saved Courses')}
                </h1>

                {savedCoursesData?.data?.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                        <h3 className={`mt-2 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('No saved courses')}
                        </h3>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('Start saving courses to view them here')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {savedCoursesData?.data?.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title?.[lang] || course.title?.en}
                                description={course.description?.[lang] || course.description?.en}
                                author={course.teacher?.name}
                                duration={course.duration?.[lang] || course.duration?.en}
                                level={course.difficulty_level}
                                category={course.category?.name?.[lang] || course.category?.name?.en}
                                thumbnail_url={course.thumbnail_url}
                                isDark={theme === 'dark'}
                                showSaveButton={true}
                                isSavedPage={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 