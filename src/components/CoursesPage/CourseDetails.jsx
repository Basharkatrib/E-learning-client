import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import FAQ from '../FAQ/FAQ';
import image1 from '../../assets/images/courses/image-1.png';
import image2 from '../../assets/images/courses/image-2.png';
import image3 from '../../assets/images/courses/image-3.png';

const dummyCourse = {
    title: 'JavaScript Specialization for Beginners',
    subtitle: 'Build your skills in JavaScript and jQuery. Start your journey to become a JavaScript programmer',
    teacher: 'William Mead',
    image: image1,
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
    skills: [
        'Programming', 'JSON', 'JavaScript', 'OOP', 'animation', 'JavaScript and jQuery', 'Programming principles', 'Ajax'
    ],
    details: [
        { icon: '💼', title: 'Shareable Certificate', desc: 'Add to your LinkedIn profile' },
        { icon: '🌐', title: 'Studying in English', desc: '25 languages available, including Arabic (automatic)' },
    ],
    benefits: [
        'Learn the skills required from university and experts in the field',
        'Master a topic or tool through hands-on projects.',
        'Gain a deep understanding of key concepts.',
        'Earn a professional degree from the University of California, Davis.'
    ],
    groups: [
        { title: 'Paving the way to new opportunities with Coursera Plus', img: image1 },
        { title: 'Advance your career by earning an online degree.', img: image2 },
        { title: 'Join over 3,400 global companies that choose LearNova for Business.', img: image3 },
    ],
    faq: [
        { q: 'Do I need to take the courses in a specific order?', a: 'No, you can take them in any order.' },
        { q: 'How long does it take to complete the major?', a: 'It depends on your pace, but usually 2-4 months.' },
        { q: 'Will I receive college credit for completing the major?', a: 'No, but you will get a shareable certificate.' },
        { q: 'Can I register for only one course?', a: 'Yes, you can enroll in individual courses.' },
    ]
};

export default function CourseDetails() {
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const [selectedFaq, setSelectedFaq] = useState(0);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <div className={`min-h-screen mt-18 w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
                        {dummyCourse.title}
                    </motion.h1>
                    <p className={`text-lg mb-2 font-medium text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{dummyCourse.subtitle}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-primary">Teacher:</span>
                        <span className={`text-sm font-medium text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{dummyCourse.teacher}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
                        <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary/90 transition text-lg">
                            Register for free
                            <span className="block text-xs font-normal mt-1">Starts {dummyCourse.stats.startDate}</span>
                        </button>
                        <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 sm:mt-0`}>
                            {dummyCourse.stats.registered.toLocaleString()} already registered
                        </span>
                    </div>
                    <div className={`text-sm text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Try for free: Sign up to start your free trial with full access for 7 days.
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-80 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800">
                    <img src={dummyCourse.image} alt="course" className="w-full h-full object-cover" />
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`w-full flex flex-col md:flex-row gap-6 justify-between items-stretch ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl px-6 md:px-16 py-8 mt-[-3rem] mb-16 mx-auto max-w-7xl relative z-10`}
            >
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg text-primary">{dummyCourse.stats.series} training course series</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Gain in-depth knowledge of the subject</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg flex items-center gap-1">{dummyCourse.stats.rating}<span className="text-yellow-400">★</span></span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>({dummyCourse.stats.reviews} reviews)</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{dummyCourse.stats.level} level</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No previous experience required</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{dummyCourse.stats.duration}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>at 10 hours a week</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{dummyCourse.stats.schedule}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Learn at your own pace</span>
                </div>
            </motion.div>

            {/* Content Container for consistent padding */}
            <div className="px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Skills Section */}
                <motion.div {...fadeInUp}>
                    <h2 className="text-2xl font-bold mb-6">Skills you will acquire</h2>
                    <div className="flex flex-wrap gap-3">
                        {dummyCourse.skills.map(skill => (
                            <span key={skill} className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm shadow-sm">
                                {skill}
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
                                <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Advance your expertise in your field of specialization</h2>
                    <ul className="list-disc pl-6 space-y-3 text-base">
                        {dummyCourse.benefits.map((b, i) => (
                            <li key={i} className={`text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{b}</li>
                        ))}
                    </ul>
                </div>

                {/* Course Groups Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Specialization - 4 course groups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {dummyCourse.groups.map((group, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer h-56">
                                <img src={group.img} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                    <span className="text-white text-lg font-bold drop-shadow-lg">{group.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                {/* <motion.div {...fadeInUp} className="max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl divide-y divide-gray-200 dark:divide-gray-800">
                        {dummyCourse.faq.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={false}
                                animate={{ backgroundColor: selectedFaq === idx ? (isDark ? '#1f2937' : '#f8fafc') : 'transparent' }}
                                onClick={() => setSelectedFaq(selectedFaq === idx ? -1 : idx)}
                                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{item.q}</span>
                                    <span className={`ml-2 text-primary transition-transform ${selectedFaq === idx ? 'rotate-90' : ''}`}>›</span>
                                </div>
                                {selectedFaq === idx && (
                                    <div className="mt-2 text-gray-700 dark:text-gray-300 text-sm pl-2">
                                        {item.a}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div> */}
                
            </div>
            <FAQ />

        </div>
    );
}