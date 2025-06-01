import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';

function FAQ() {
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const [openQuestion, setOpenQuestion] = useState(1);
    const lang = useSelector(selectTranslate);


    const faqs = [
        {
            id: 1,
            question: "Can I enroll in multiple courses at once?",
            answer: "Absolutely! You can enroll in multiple courses simultaneously and access them at your convenience.",
            link: {
                text: "Enrollment Process for Different Courses",
                url: "#"
            }
        },
        {
            id: 2,
            question: "What kind of support can I expect from instructors?",
            answer: "Our instructors provide comprehensive support including live Q&A sessions, personalized feedback on assignments, and timely responses to your questions through our learning platform."
        },
        {
            id: 3,
            question: "Are the courses self-paced or do they have specific start and end dates?",
            answer: "We offer both types of courses. Self-paced courses allow you to learn at your own speed, while scheduled courses have specific start and end dates to help you stay on track."
        },
        {
            id: 4,
            question: "Are there any prerequisites for the courses?",
            answer: "Prerequisites vary by course. Basic courses typically don't require prior knowledge, while advanced courses might need specific skills or completion of prerequisite courses."
        },
        {
            id: 5,
            question: "Can I download the course materials for offline access?",
            answer: "Yes, most course materials including video lectures, PDFs, and assignments can be downloaded for offline viewing through our mobile app."
        }
    ];

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full py-16 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:gap-20">
                    <div className="lg:w-1/3 mb-8 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
                        <div className="flex flex-col gap-4">
                            <motion.h2 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-3xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                                {t('Frequently Asked Questions')}
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                {t('Still you have any questions? Contact our Team via support@LearNova.com')}
                            </motion.p>
                            <motion.button
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`text-sm font-medium w-fit ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                } hover:text-primary transition-colors duration-200`}
                            >
                                {t('See All FAQs')}
                            </motion.button>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:w-2/3 flex flex-col gap-4"
                    >
                        {faqs.map((faq) => (
                            <div 
                                key={faq.id}
                                className={`w-full rounded-xl overflow-hidden ${
                                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                                } hover:shadow-lg transition-all duration-300`}
                            >
                                <button
                                    onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                                    className={`w-full flex items-center justify-between p-6 ${
                                        theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                                    } transition-colors duration-200`}
                                >
                                    <span className={`${lang === "ar"? "text-right" : "text-left"} font-medium ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {t(faq.question)}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: openQuestion === faq.id ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`text-2xl ${
                                            openQuestion === faq.id
                                            ? 'text-primary'
                                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        {openQuestion === faq.id ? '×' : '+'}
                                    </motion.span>
                                </button>
                                
                                <AnimatePresence>
                                    {openQuestion === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <div className={`p-6 text-sm ${
                                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                            }`}>
                                                <p className="mb-4">{t(faq.answer)}</p>
                                                {faq.link && (
                                                    <motion.a
                                                        href={faq.link.url}
                                                        className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors duration-200 group"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <span>{t(faq.link.text)}</span>
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            className="h-4 w-4 ltr:rotate-0 rtl:rotate-180  transform transition-transform duration-200 group-hover:translate-x-1" 
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </motion.a>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
