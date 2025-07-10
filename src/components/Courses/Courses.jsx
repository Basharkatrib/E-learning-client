import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useGetCoursesQuery } from '../../redux/features/apiSlice';

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


function Courses() {
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);
    const { t } = useTranslation();

    const { data: coursesData, isLoading, error } = useGetCoursesQuery();


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading courses</div>;
    }

    return (
        <div
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-40"
            >
                <div className="w-full flex flex-col gap-4">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        Featured Courses
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                        Explore our most popular courses and start your learning journey today
                    </motion.p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-6 py-3 rounded-md whitespace-nowrap hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                >
                    <Link to='/courses'>
                        {t('View All Courses')}
                    </Link>
                </motion.button>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14"
            >
                {coursesData?.data?.slice(0, 6).map((course) => (
                    <motion.div
                        key={course.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`w-full flex flex-col rounded-xl overflow-hidden shadow-lg ${
                            theme === 'dark' 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-50'
                        } transition-all duration-200`}
                    >
                        <div className="relative w-full h-48">
                            <img 
                                src={course.thumbnail_url} 
                                alt={course.title[lang]}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {course.duration[lang]}
                                </span>
                                <span className={`${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {t(course.difficulty_level)}
                                </span>
                            </div>
                            
                            <h3 className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {course.title[lang]}
                            </h3>
                            
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            } line-clamp-2`}>
                                {course.description[lang]}
                            </p>
                            
                            <div className="mt-2 flex items-center justify-between">
                                <span className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    By {course.teacher?.name || 'Unknown Teacher'}
                                </span>
                                <Link
                                    to={`/course-details/${course.id}`}
                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                                >
                                    {t('Get it Now')}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default Courses;
