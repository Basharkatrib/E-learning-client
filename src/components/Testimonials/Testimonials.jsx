import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import image1 from '../../assets/images/testimonials/Image-1.png';
import image2 from '../../assets/images/testimonials/Image-2.png';
import image3 from '../../assets/images/testimonials/Image-3.png';
import image4 from '../../assets/images/testimonials/Image-4.png';
import { useTranslation } from 'react-i18next';

function Testimonials() {
    const { t } = useTranslation();
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);


    const testimonials = [
        {
            id: 1,
            image: image1,
            name: "Sarah L.",
            role: "Web Developer",
            text: "The web design course provided a solid foundation for me. The instructors were knowledgeable and supportive, and the interactive learning environment was engaging. Highly recommend it!"
        },
        {
            id: 2,
            image: image2,
            name: "Jason M.",
            role: "UI/UX Designer",
            text: "The UI/UX design course exceeded my expectations. The instructor's expertise and practical assignments helped me improve my design skills. I feel more confident in my career now. Thank you!"
        },
        {
            id: 3,
            image: image3,
            name: "Emily R.",
            role: "Mobile Developer",
            text: "The mobile app development course was fantastic! The step-by-step tutorials and hands-on projects helped me grasp the concepts easily. I'm now building my own app. Great Course!"
        },
        {
            id: 4,
            image: image4,
            name: "Michael K.",
            role: "Graphic Designer",
            text: "I excelled in the graphic design course as a beginner, and it was the perfect starting point. The instructor's guidance and feedback improved my design abilities significantly. I'm grateful for this course!"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-16 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" /> */}

            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                <div className="w-full flex flex-col gap-4">
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-4xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {t('Our Testimonials')}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-base ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        } md:w-3/4`}
                    >
                        {t('Hear what our learners have to say about their experience with LearNova. Real stories, real results.')}
                    </motion.p>
                </div>
          
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 relative z-10"
            >
                {testimonials.map((testimonial) => (
                    <motion.div
                        key={testimonial.id}
                        variants={itemVariants}
                        className={`w-full flex flex-col gap-6 p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300 ${
                            theme === 'dark' 
                            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
                            : 'bg-white/80 backdrop-blur-sm border border-gray-100'
                        } shadow-xl hover:shadow-2xl`}
                    >
                        <div className={`text-4xl ${theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}`}>
                            "
                        </div>

                        <p className={`text-base leading-relaxed ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            {t(testimonial.text)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800">
                                    <img 
                                        src={testimonial.image} 
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-medium ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {t(testimonial.name)}
                                    </span>
                                    <span className={`text-sm ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {t(testimonial.role)}
                                    </span>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-2`}
                            >
                                {t('Read Full Story')}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ltr:rotate-0 rtl:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default Testimonials;