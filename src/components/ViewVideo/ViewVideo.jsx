import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import time from '../../assets/images/ViewVideo/time.svg';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useParams } from 'react-router-dom';
import { useGetCourseQuery } from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';

const ViewVideo = () => {
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const { id } = useParams();
    const { data: coursesData, isLoading, error } = useGetCourseQuery(id);
    const [currentVideo, setCurrentVideo] = useState(coursesData?.data?.sections?.[0]?.videos?.[0]);
    const videoPlayerRef = useRef(null);

    useEffect(() => {
        if (coursesData) {
            const firstVideo = coursesData?.data?.sections?.[0]?.videos?.[0];
            setCurrentVideo(firstVideo);
        }
    }, [coursesData]);

    const handleVideoClick = (video) => {
        setCurrentVideo(video);

        videoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (isLoading) return <LoadingPage />;
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
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

    const course = coursesData;

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>

            {/* Video Player */}
            <div className="w-full mt-10" ref={videoPlayerRef}>
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                    {currentVideo?.video_url && (
                        <iframe
                            className="w-full h-full"
                            src={currentVideo.video_url}
                            title={currentVideo.title?.[lang]}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col mt-10 lg:flex-row justify-between items-start lg:items-center gap-6">
                <h1 className="font-extrabold text-3xl sm:text-4xl bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                    {course?.title?.[lang]}
                </h1>
                <div className="w-full lg:w-1/2 text-base sm:text-lg">
                    <p>{course?.description?.[lang]}</p>
                </div>
            </div>

            {/* Cards */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14"
            >
                {course?.sections?.map((section) => (
                    <motion.div
                        key={section.id}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`flex flex-col gap-4 p-6 rounded-2xl shadow-md transition-all duration-300 border ${isDark
                            ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                            : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-900'
                            }`}
                    >
                        <div>
                            <h1 className="text-lg font-semibold text-indigo-500">{section.id}</h1>
                            <h3 className="text-xl sm:text-2xl font-bold">{section.title?.[lang]}</h3>
                        </div>

                        {section?.videos?.slice(0, 3).map((video) => (
                            <div
                                key={video.id}
                                className="flex flex-col gap-1 py-3 border-t border-dashed border-gray-400"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <button
                                            onClick={() => handleVideoClick(video)}
                                            className="text-blue-500 break-all underline text-left w-full"
                                        >
                                            {video.title[lang]}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <img src={time} alt="time" className="w-5 h-5" />
                                        <span className="text-xs sm:text-sm font-medium">{video.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ViewVideo;
