import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import time from '../../assets/images/ViewVideo/time.svg';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetCourseQuery,
  useCourseMyProgressQuery,
  useCourseMyProgressUpdateMutation,
  useGetWatchedVideosQuery,
  useMarkVideoAsWatchedMutation,
} from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import { selectToken } from '../../redux/features/authSlice';
import defaultCover from '../../assets/images/banner/image-1.avif';

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
  const token = useSelector(selectToken);
  const videoPlayerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const { data: coursesData, isLoading, error } = useGetCourseQuery(id);
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useCourseMyProgressQuery({ token, courseId: id });

  const [updateProgress] = useCourseMyProgressUpdateMutation();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [markVideoAsWatched] = useMarkVideoAsWatchedMutation();
  const {
    data: watchedVideosData,
    isLoading: watchedLoading,
    refetch: refetchWatched,
  } = useGetWatchedVideosQuery(token, { skip: !token });
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let ids = [];
    if (watchedVideosData) {
      if (Array.isArray(watchedVideosData.watched)) {
        ids = watchedVideosData.watched;
      } else if (Array.isArray(watchedVideosData.data)) {
        ids = watchedVideosData.data;
      } else if (Array.isArray(watchedVideosData)) {
        ids = watchedVideosData;
      }
    }
    setWatchedVideos(ids);
    console.log('watchedVideosData from API:', watchedVideosData);
    console.log('Extracted watchedVideos IDs:', ids);
  }, [watchedVideosData]);

  const totalVideos = coursesData?.sections?.reduce((acc, section) => acc + (section.videos?.length || 0), 0);
  const currentProgress = progressData?.progress || 0;
  const progressPerVideo = totalVideos ? Math.floor(100 / totalVideos) : 0;

  const handleVideoClick = async (video) => {
    setCurrentVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!watchedVideos.map(String).includes(String(video.id))) {
      try {
        await markVideoAsWatched({ token, videoId: video.id });
        await refetchWatched();
      } catch (err) {
        console.error('Error marking video as watched:', err);
      }
    }
  };

  const handlePlay = () => {
    // No need to handle play logic as showCover is removed
  };

  const handleFullscreen = () => {
    const el = videoContainerRef.current;
    if (el) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }
  };

  if (isLoading || progressLoading) return <LoadingPage />;
  if (error || progressError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-500">{t('Error loading courses')}</h2>
          <p className="text-sm text-gray-400">{t('Please try again later')}</p>
        </div>
      </div>
    );
  }

  const course = coursesData;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full mt-6 md:mt-18 flex flex-col px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>


      {/* Mobile Drawer for Lessons */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: lang === 'ar' ? 400 : -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: lang === 'ar' ? 400 : -400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 w-4/5 max-w-xs h-full bg-white dark:bg-gray-900 shadow-2xl p-4 flex flex-col gap-4 lg:hidden`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="self-end mb-2 text-gray-700 dark:text-gray-200 hover:text-primary"
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <h3 className="text-lg font-bold text-primary mb-2">{lang === 'ar' ? 'دروس الدورة' : 'Course Lessons'}</h3>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {course?.sections?.map((section, sidx) => (
              <div key={section.id}>
                <div className="mb-2 font-semibold text-indigo-500 text-base">{lang === 'ar' ? `الوحدة ${sidx + 1}` : `Section ${sidx + 1}`}: {section.title?.[lang]}</div>
                <div className="flex flex-col gap-2">
                  {section?.videos?.map((video, vidx) => {
                    const globalIdx = coursesData.sections.slice(0, sidx).reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) + vidx;
                    const isWatched = watchedVideos.map(String).includes(String(video.id));
                    return (
                      <button
                        key={video.id}
                        onClick={() => { handleVideoClick(video); setSidebarOpen(false); }}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg transition-all border-2 text-left
                          ${currentVideo?.id === video.id
                            ? 'bg-gradient-to-r from-primary to-blue-500 text-white border-primary shadow-lg font-bold'
                            : isWatched
                              ? 'bg-green-100 border-green-400 text-green-700'
                              : (isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white' : 'bg-white hover:bg-blue-50 border-gray-200 text-gray-900')
                          } group`}
                      >
                        <span className="flex items-center">
                          {isWatched && (
                            <span className="inline-block mr-1 text-green-500">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bbf7d0" /><path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </span>
                        <span className="truncate flex-1">{video.title[lang]}</span>
                        <span className="flex items-center gap-1 text-xs">{video.duration}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {progressData && (
        <div className="w-full mb-6 mt-12 sm:mt-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-primary">{t('Progress')}</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {progressData.progress}%
              {progressData.progress === 100 && (
                <span className="ml-2 text-green-500" title="Completed">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bbf7d0" /><path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
            </span>
          </div>
          <div className="relative w-full h-5 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-primary transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${progressData.progress}%` }}
            >
              <span className={`text-xs font-bold ${progressData.progress > 15 ? 'text-white' : 'text-primary'}`}>{progressData.progress}%</span>
            </div>
            {progressData.progress === 100 && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/60 via-lime-300/60 to-green-400/60 animate-pulse"></div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="order-2 lg:order-1 w-full lg:w-1/3 xl:w-1/4 mt-8 lg:mt-0 hidden lg:block"
        >
          <div className={`rounded-2xl shadow-xl border-2 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-primary/20' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border-primary/10'} p-4 lg:sticky lg:top-24`}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-primary flex items-center gap-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 17V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" /></svg>
              {lang === 'ar' ? 'دروس الدورة' : 'Course Lessons'}
            </h3>
            <div className="flex flex-col gap-4">
              {course?.sections?.map((section, sidx) => (
                <motion.div key={section.id} variants={fadeIn}>
                  <div className="mb-2 font-semibold text-indigo-500 text-base">{lang === 'ar' ? `الوحدة ${sidx + 1}` : `Section ${sidx + 1}`}: {section.title?.[lang]}</div>
                  <div className="flex flex-col gap-2">
                    {section?.videos?.map((video, vidx) => {
                      const globalIdx = coursesData.sections.slice(0, sidx).reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) + vidx;
                      const isWatched = watchedVideos.map(String).includes(String(video.id));
                      return (
                        <button
                          key={video.id}
                          onClick={() => handleVideoClick(video)}
                          className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg transition-all border-2 text-left
                            ${currentVideo?.id === video.id
                              ? 'bg-gradient-to-r from-primary to-blue-500 text-white border-primary shadow-lg font-bold'
                              : isWatched
                                ? 'bg-green-100 border-green-400 text-green-700'
                                : (isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white' : 'bg-white hover:bg-blue-50 border-gray-200 text-gray-900')
                            } group`}
                        >
                          <span className="flex items-center">
                            {currentVideo?.id === video.id ? (
                              <span className="inline-block mr-1">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6366F1" /><path d="M10 8l6 4-6 4V8z" fill="#fff" /></svg>
                              </span>
                            ) : isWatched ? (
                              <span className="inline-block mr-1 text-green-500">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bbf7d0" /><path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </span>
                            ) : null}
                          </span>
                          <span className="truncate flex-1">{video.title[lang]}</span>
                          <span className="flex items-center gap-1 text-xs">
                            {video.duration}m
                          </span>
                        </button>
                      );
                    })}
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
              style={{ position: 'relative' }}
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
            </div>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary/90 transition-all"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              {lang === 'ar' ? 'الدروس' : 'Lessons'}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={`rounded-2xl shadow-lg p-6 mb-2 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100'} backdrop-blur-md`}
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
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#6366F1" /><path d="M10 8l6 4-6 4V8z" fill="#fff" /></svg>
              </motion.span>
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                {currentVideo.title?.[lang]}
              </h2>
            </div>
          )}

          {currentVideo && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 px-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
                {lang === 'ar' ? 'المدة:' : 'Duration:'} {currentVideo.duration}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
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