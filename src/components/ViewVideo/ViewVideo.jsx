import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import time from '../../assets/images/ViewVideo/time.svg';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseQuery } from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring' } },
};

const ViewVideo = () => {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: coursesData, isLoading, error } = useGetCourseQuery(id);
  const videoPlayerRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  const getFirstVideo = (data) => {
    const firstSection = data?.sections?.[0];
    return firstSection?.videos?.[0] || null;
  };
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    if (coursesData?.sections) {
      setCurrentVideo(getFirstVideo(coursesData));
    }
  }, [coursesData]);

  const handleVideoClick = (video) => {
    setCurrentVideo(video);
    videoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFullscreen = () => {
    const el = videoContainerRef.current;
    if (el) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    }
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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full mt-6 md:mt-18 flex flex-col px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-white font-bold shadow hover:from-blue-700 hover:to-primary transition-all"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {lang === 'ar' ? 'العودة للدورة' : 'Back to Course'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="order-2 lg:order-1 w-full lg:w-1/3 xl:w-1/4 mt-8 lg:mt-0"
        >
          <div className={`rounded-2xl shadow-xl border-2 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-primary/20' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border-primary/10'} p-4 lg:sticky lg:top-24`}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-primary flex items-center gap-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 17V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/></svg>
              {lang === 'ar' ? 'دروس الدورة' : 'Course Lessons'}
            </h3>
            <div className="flex flex-col gap-4">
              {course?.sections?.map((section, sidx) => (
                <motion.div key={section.id} variants={fadeIn}>
                  <div className="mb-2 font-semibold text-indigo-500 text-base">{lang === 'ar' ? `الوحدة ${sidx + 1}` : `Section ${sidx + 1}`}: {section.title?.[lang]}</div>
                  <div className="flex flex-col gap-2">
                    {section?.videos?.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoClick(video)}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg transition-all border-2 text-left ${currentVideo?.id === video.id
                          ? 'bg-gradient-to-r from-primary to-blue-500 text-white border-primary shadow-lg font-bold'
                          : isDark
                            ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                            : 'bg-white hover:bg-blue-50 border-gray-200 text-gray-900'} group`}
                      >
                        <span className="flex items-center">
                          {currentVideo?.id === video.id ? (
                            <motion.span
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="inline-block mr-1"
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M10 8l6 4-6 4V8z" fill="#6366F1"/></svg>
                            </motion.span>
                          ) : (
                            <span className="inline-block mr-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M10 8l6 4-6 4V8z" fill="#6366F1"/></svg>
                            </span>
                          )}
                        </span>
                        <span className="truncate flex-1">{video.title[lang]}</span>
                        <span className="flex items-center gap-1 text-xs">
                          <img src={time} alt="time" className="w-4 h-4" />
                          {video.duration}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="order-1 lg:order-2 flex-1 flex flex-col gap-6">
          <div
            className={`w-full flex justify-center relative ${isDark ? '' : ''}`}
            ref={videoPlayerRef}
          >
            <div
              ref={videoContainerRef}
              className={`w-full aspect-video
                ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100'}
                border-4 ${isDark ? 'border-primary/40' : 'border-primary/20'}
                rounded-2xl overflow-hidden shadow-2xl
                sm:max-w-3xl
                sm:rounded-2xl sm:shadow-2xl sm:border-4
                max-sm:w-screen max-sm:mx-[-16px] max-sm:rounded-none max-sm:shadow-none max-sm:border-0
              `}
            >
              {currentVideo?.video_url && (
                <iframe
                  className="w-full h-full"
                  src={currentVideo.video_url}
                  title={currentVideo.title?.[lang]}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              <button
                onClick={handleFullscreen}
                className="absolute bottom-2 right-2 z-10 bg-black/60 text-white rounded-full p-2 sm:hidden"
                title={lang === 'ar' ? 'تكبير' : 'Fullscreen'}
                type="button"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 4h6M4 4v6M4 4l6 6M20 20h-6M20 20v-6M20 20l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={`rounded-2xl shadow-lg p-6 mt-6 mb-2 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100'} backdrop-blur-md`}
          >
            <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent mb-2">
              {course?.title?.[lang]}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-300">
              {course?.description?.[lang]}
            </p>
          </motion.div>

          {currentVideo && (
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="inline-block"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#6366F1"/><path d="M10 8l6 4-6 4V8z" fill="#fff"/></svg>
              </motion.span>
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                {currentVideo.title?.[lang]}
              </h2>
            </div>
          )}

          {currentVideo && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 px-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
                {lang === 'ar' ? 'المدة:' : 'Duration:'} {currentVideo.duration}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {lang === 'ar' ? 'الدرس:' : 'Lesson:'} {currentVideo.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewVideo;