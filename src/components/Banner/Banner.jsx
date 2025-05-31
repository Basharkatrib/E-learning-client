import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import banner2 from '../../assets/images/banner/image-2.avif';
import banner3 from '../../assets/images/banner/image-3.avif';
import banner1 from '../../assets/images/banner/image-1.avif';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useSelector } from 'react-redux';




const Banner = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { t, i18n } = useTranslation();
    const lang = useSelector(selectTranslate);

    
    const images = [
        {
            url: banner1,
            title: "Transform Future",
            subtitle: "Join our community of learners and achieve your goals"
        },
        {
            url: banner2,
            title: "Learn From The Best",
            subtitle: "Expert instructors to guide your learning journey"
        },
        {
            url: banner3,
            title: "Flexible Learning",
            subtitle: "Study at your own pace, anywhere, anytime"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[calc(100vh-72px)] overflow-hidden mt-18">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <img 
                        src={images[currentImageIndex].url}
                        alt="education"
                        className="w-full h-screen md:h-full object-cover object-top md:object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex items-center">
                {/* Remove the container class and use padding directly */}
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className={`w-full ${lang === 'ar' ? "flex flex-col items-end text-right" : ""}`}>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                    {t(images[currentImageIndex].title)}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-200 mb-10">
                                    {t(images[currentImageIndex].subtitle)}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className={`flex flex-wrap gap-6 ${lang === "ar"? "items-end justify-end" : ""}`}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary px-8 py-4  text-white  rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2"
                            >
                                {t('Start Learning')}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
                            >
                                {t('View Courses')}
                            </motion.button>
                        </div>

                        {/* Image Navigation Dots */}
                        <div className="mt-16 flex gap-3">
                            {images.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        currentImageIndex === index ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'
                                    }`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[1]" />
            
            <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
    );
};

export default Banner;