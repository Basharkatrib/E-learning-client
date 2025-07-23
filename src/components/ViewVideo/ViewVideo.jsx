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
  useGetQuizQuery,
} from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import { selectToken } from '../../redux/features/authSlice';
import Notes from '../Notes/Notes';

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
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // Remove hasShownQuizModal state since we'll use localStorage
  
  const { data: coursesData, isLoading, error } = useGetCourseQuery(id);
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useCourseMyProgressQuery({ token, courseId: id });

  const { data: quizData, isLoading: quizLoading } = useGetQuizQuery(
    { courseId: id, token },
    { skip: !token || !id }
  );

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
  const [showCover, setShowCover] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isChangingVideo, setIsChangingVideo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

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
  }, [watchedVideosData]);

  // Set and mark first video as watched when course data is loaded
  useEffect(() => {
    const initializeFirstVideo = async () => {
      if (coursesData?.sections?.[0]?.videos?.[0] && !currentVideo && !isChangingVideo) {
        setIsChangingVideo(true);
        const firstVideo = coursesData.sections[0].videos[0];
        setCurrentVideo(firstVideo);
        setShowCover(false);

        // Mark first video as watched if not already watched
        if (!watchedVideos.map(String).includes(String(firstVideo.id))) {
          try {
            await markVideoAsWatched({ token, videoId: firstVideo.id });
            await refetchWatched();
            
            // Calculate new progress
            const allVideos = coursesData.sections.flatMap(section => section.videos || []);
            const totalVideos = allVideos.length;
            const newWatchedVideos = [...watchedVideos, firstVideo.id];
            const watchedCount = newWatchedVideos.length;
            const newProgress = Math.round((watchedCount / totalVideos) * 100);
            
            // Update progress in backend
            await updateProgress({
              token,
              courseId: id,
              progress: newProgress,
              videosCompleted: newProgress === 100
            });
            await refetchProgress();
          } catch (err) {
            console.error('Error marking first video as watched:', err);
          }
        }
        setIsChangingVideo(false);
      }
    };

    if (coursesData && token) {
      initializeFirstVideo();
    }
  }, [coursesData, token, watchedVideos, currentVideo, isChangingVideo]);

  const handleVideoClick = async (video) => {
    if (video.id === currentVideo?.id || isChangingVideo) return; // Don't reload if it's the same video or if we're already changing videos
    
    setIsChangingVideo(true);
    setCurrentVideo(video);
    setShowCover(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (!watchedVideos.map(String).includes(String(video.id))) {
      try {
        await markVideoAsWatched({ token, videoId: video.id });
        await refetchWatched();
        
        // Calculate new progress after marking video as watched
        const allVideos = coursesData.sections.flatMap(section => section.videos || []);
        const totalVideos = allVideos.length;
        const newWatchedVideos = [...watchedVideos, video.id];
        const watchedCount = newWatchedVideos.length;
        const newProgress = Math.round((watchedCount / totalVideos) * 100);
        
        // Update progress in backend
        try {
          await updateProgress({
            token,
            courseId: id,
            progress: newProgress,
            videosCompleted: newProgress === 100
          });
          await refetchProgress();
        } catch (err) {
          console.error('Error updating progress:', err);
        }
      } catch (err) {
        console.error('Error marking video as watched:', err);
      }
    }
    setIsChangingVideo(false);
  };

  // Add video completion tracking
  useEffect(() => {
    if (currentVideo && !watchedVideos.map(String).includes(String(currentVideo.id))) {
      const videoElement = document.querySelector('iframe');
      if (videoElement) {
        // Add message listener for video progress
        const handleMessage = async (event) => {
          // Check if message is from Vimeo
          if (event.origin === "https://player.vimeo.com") {
            try {
              const data = JSON.parse(event.data);
              // Check if video ended
              if (data.event === 'ended') {
                await handleVideoClick(currentVideo);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      }
    }
  }, [currentVideo, watchedVideos]);

  // Function to check if quiz modal has been shown for this course
  const hasQuizModalBeenShown = () => {
    const shownQuizModals = JSON.parse(localStorage.getItem('shownQuizModals') || '{}');
    return shownQuizModals[id] === true;
  };

  // Function to mark quiz modal as shown for this course
  const markQuizModalAsShown = () => {
    const shownQuizModals = JSON.parse(localStorage.getItem('shownQuizModals') || '{}');
    shownQuizModals[id] = true;
    localStorage.setItem('shownQuizModals', JSON.stringify(shownQuizModals));
  };

  // Update progress whenever watched videos change
  useEffect(() => {
    const updateCourseProgress = async () => {
      if (coursesData?.sections && watchedVideos.length >= 0) {
        const allVideos = coursesData.sections.flatMap(section => section.videos || []);
        const allVideoIds = allVideos.map(v => String(v.id));
        const watchedInThisCourse = watchedVideos.filter(id => allVideoIds.includes(String(id)));
        const totalVideos = allVideos.length;
        const watchedCount = watchedInThisCourse.length;
        const calculatedProgress = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
        
        // Show quiz modal when progress reaches 70% and hasn't been shown before
        if (calculatedProgress >= 70 && !hasQuizModalBeenShown() && quizData?.length > 0) {
          setShowQuizModal(true);
          markQuizModalAsShown();
        }
        
        if (calculatedProgress !== progress) {
          setProgress(calculatedProgress);
          try {
            await updateProgress({
              token,
              courseId: id,
              progress: calculatedProgress,
              videosCompleted: calculatedProgress === 100
            });
            await refetchProgress();
          } catch (err) {
            console.error('Error updating progress:', err);
          }
        }
      }
    };

    updateCourseProgress();
  }, [coursesData, watchedVideos, quizData, progress, token, id, updateProgress, refetchProgress]);

  // Add debug logging
  useEffect(() => {
    console.log('Quiz Data:', quizData);
    console.log('Progress:', progress);
    console.log('Course ID:', id);
    console.log('Token:', token);
  }, [quizData, progress, id, token]);

  if (isLoading || progressLoading || quizLoading) return <LoadingPage />;
  
  // Check if course data exists and is valid
  if (error || progressError || !coursesData || !coursesData.id) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-500">
            {lang === 'ar' ? 'الدورة غير موجودة' : 'Course Not Found'}
          </h2>
          <p className="text-sm text-gray-400">
            {lang === 'ar' 
              ? 'عذراً، الدورة التي تبحث عنها غير موجودة أو تم حذفها.' 
              : 'Sorry, the course you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {lang === 'ar' ? 'العودة إلى الدورات' : 'Back to Courses'}
          </button>
        </div>
      </div>
    );
  }

  // Check if course has sections and videos
  if (!coursesData.sections || coursesData.sections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-yellow-600 text-yellow-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-yellow-500">
            {lang === 'ar' ? 'لا توجد أقسام متاحة' : 'No Sections Available'}
          </h2>
          <p className="text-sm text-gray-400">
            {lang === 'ar' 
              ? 'عذراً، هذه الدورة لا تحتوي على أي أقسام أو فيديوهات متاحة.' 
              : 'Sorry, this course does not contain any sections or videos.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {lang === 'ar' ? 'العودة إلى الدورات' : 'Back to Courses'}
          </button>
        </div>
      </div>
    );
  }

  // Check if any section has videos
  const hasVideos = coursesData.sections.some(section => section.videos && section.videos.length > 0);
  if (!hasVideos) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-yellow-600 text-yellow-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-yellow-500">
            {lang === 'ar' ? 'لا توجد فيديوهات متاحة' : 'No Videos Available'}
          </h2>
          <p className="text-sm text-gray-400">
            {lang === 'ar' 
              ? 'عذراً، هذه الدورة لا تحتوي على أي فيديوهات متاحة حالياً.' 
              : 'Sorry, this course does not contain any videos at the moment.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {lang === 'ar' ? 'العودة إلى الدورات' : 'Back to Courses'}
          </button>
        </div>
      </div>
    );
  }

  const course = coursesData;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full mt-22 flex flex-col min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F9FAFB] text-gray-900'}`}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 w-full ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-4 py-3`}>
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden flex-shrink-0 flex items-center gap-2 p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-lg font-semibold truncate min-w-0">
              {course?.title?.[lang] || course?.title?.en || (lang === 'ar' ? 'دورة بدون عنوان' : 'Untitled Course')}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notes Button */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showNotes 
                  ? 'bg-primary text-white' 
                  : isDark 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">
                {lang === 'ar' ? 'الملاحظات' : 'Notes'}
              </span>
            </button>

            {/* Progress */}
            {progressData && (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lang === 'ar' ? 'تقدمك:' : 'Your Progress:'}
                </span>
                <span className="font-semibold text-primary">{progress}%</span>
                <div className="w-20 sm:w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Desktop */}
        <div className={`hidden lg:block w-80 xl:w-96 flex-shrink-0 h-[calc(100vh-64px)] sticky top-16 ${isDark ? 'bg-gray-900' : 'bg-white'} border-r ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <h2 className="font-semibold text-lg">{lang === 'ar' ? 'محتوى الدورة' : 'Course Content'}</h2>
            </div>
            
            <div className="space-y-4">
              {course?.sections?.map((section, sidx) => (
                <div key={section.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      {sidx + 1}
                    </span>
                    <h3 className="font-medium text-base">{section.title?.[lang]}</h3>
                  </div>
                  <div className="space-y-2">
                    {section?.videos && section.videos.length > 0 ? (
                      section.videos.map((video) => {
                        const isWatched = watchedVideos.map(String).includes(String(video.id));
                        const isActive = currentVideo?.id === video.id;
                        return (
                          <button
                            key={video.id}
                            onClick={() => handleVideoClick(video)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                              isActive
                                ? `${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} font-medium`
                                : isWatched
                                  ? `${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`
                                  : `${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isActive ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              ) : isWatched ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="line-clamp-1">{video.title?.[lang] || video.title?.en || video.title || (lang === 'ar' ? 'فيديو بدون عنوان' : 'Untitled Video')}</p>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {video.duration || '0'} {lang === 'ar' ? 'دقيقة' : 'min'}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className={`text-sm text-center py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {lang === 'ar' ? 'لا توجد فيديوهات في هذا القسم' : 'No videos in this section'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className={`p-2 sm:p-4 lg:p-8 space-y-4 sm:space-y-8 text-white ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Video Player Container */}
            <div className="w-full max-w-[1200px] mx-auto">
              {/* Responsive Video Wrapper */}
              <div className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                <div className={`relative w-full ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  {showCover && course?.thumbnail_url ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${course.thumbnail_url})`,
                        paddingBottom: '56.25%' // 16:9 aspect ratio
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <button
                          onClick={() => setShowCover(false)}
                          className="transform hover:scale-110 transition-transform duration-300"
                        >
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white opacity-90 hover:opacity-100" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        ref={videoPlayerRef}
                        className="absolute inset-0 w-full h-full"
                        src={currentVideo?.video_url || course?.sections?.[0]?.videos?.[0]?.video_url}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Details */}
              <div className="mt-4 sm:mt-6 space-y-4">
                <div className={`p-4 sm:p-6 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-white'} shadow-lg backdrop-blur-sm`}>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                    {currentVideo?.title?.[lang] || currentVideo?.title?.en || currentVideo?.title || 
                     course?.sections?.[0]?.videos?.[0]?.title?.[lang] || 
                     course?.sections?.[0]?.videos?.[0]?.title?.en || 
                     course?.sections?.[0]?.videos?.[0]?.title || 
                     (lang === 'ar' ? 'فيديو بدون عنوان' : 'Untitled Video')}
                  </h2>
                  <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentVideo?.description?.[lang] || currentVideo?.description?.en || currentVideo?.description || 
                     course?.sections?.[0]?.videos?.[0]?.description?.[lang] || 
                     course?.sections?.[0]?.videos?.[0]?.description?.en || 
                     course?.sections?.[0]?.videos?.[0]?.description || 
                     (lang === 'ar' ? 'لا يوجد وصف متاح لهذا الفيديو' : 'No description available for this video')}
                  </p>
                </div>
              </div>
            </div>



            {/* Quiz Section with enhanced styling */}
            {quizData && quizData.length > 0 && (
              <div className={`rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-lg overflow-hidden p-6`}>
                <div className="flex items-center justify-between mb-6">
                 <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {lang === 'ar' ? 'اختبار الدورة' : 'Course Quiz'}
                   </h3>
                  {progress >= 70 ? (
                    <button
                      onClick={() => navigate(`/quiz/${id}/${quizData[0].id}`)}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105"
                    >
                      {lang === 'ar' ? 'ابدأ الاختبار' : 'Take Quiz'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-6 0h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      <span className="text-yellow-500">
                        {lang === 'ar' ? `اكمل ${70 - progress}% للفتح` : `Complete ${70 - progress}% to unlock`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {quizData.map((quiz) => (
                    <div
                      key={quiz.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <h4 className={`font-semibold text-lg mb-2 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>{quiz.title}</h4>

                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>{lang === 'ar' ? 'درجة النجاح:' : 'Passing Score:'} {quiz.passing_score}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>{lang === 'ar' ? 'الوقت:' : 'Time Limit:'} {quiz.time_limit} {lang === 'ar' ? 'دقيقة' : 'min'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className={`absolute ${lang === 'ar' ? 'right-0' : 'left-0'} top-0 h-full w-[85%] max-w-sm ${
            isDark ? 'bg-gray-900' : 'bg-white'
          } shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : lang === 'ar' ? 'translate-x-full' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {lang === 'ar' ? 'محتوى الدورة' : 'Course Content'}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-all`}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-4"
            >
              {course?.sections?.map((section, index) => (
                <motion.div
                  key={section.id}
                  variants={fadeIn}
                  className={`rounded-xl p-4 ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-lg mb-3">
                    {section.title?.[lang]}
                  </h3>
                  <div className="space-y-2">
                    {section.videos && section.videos.length > 0 ? (
                      section.videos.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => {
                            handleVideoClick(video);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                            currentVideo?.id === video.id
                              ? isDark
                                ? 'bg-primary text-white'
                                : 'bg-primary/10 text-primary'
                              : isDark
                              ? 'hover:bg-gray-700/50'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              watchedVideos.map(String).includes(String(video.id))
                                ? 'bg-green-500'
                                : isDark
                                ? 'bg-gray-700'
                                : 'bg-gray-200'
                            }`}
                          >
                            {watchedVideos.map(String).includes(String(video.id)) ? (
                              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 text-start text-sm truncate">
                            {video.title?.[lang] || video.title?.en || video.title || (lang === 'ar' ? 'فيديو بدون عنوان' : 'Untitled Video')}
                          </span>
                          <span className="flex-shrink-0 text-xs opacity-60">
                            {video.duration || '0'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className={`text-sm text-center py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {lang === 'ar' ? 'لا توجد فيديوهات في هذا القسم' : 'No videos in this section'}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotes(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-full max-w-4xl h-[80vh] rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {lang === 'ar' ? 'ملاحظات الدورة' : 'Course Notes'}
              </h3>
              <button
                onClick={() => setShowNotes(false)}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="h-full overflow-y-auto">
              <Notes courseId={id} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiz Available Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQuizModal(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-full max-w-md p-6 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold">
                {lang === 'ar' ? 'الاختبار متاح الآن!' : 'Quiz Now Available!'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {lang === 'ar' 
                  ? 'لقد أكملت 70% من الدورة. يمكنك الآن إجراء الاختبار لتقييم معرفتك.'
                  : 'You have completed 70% of the course. You can now take the quiz to test your knowledge.'}
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => {
                    setShowQuizModal(false);
                    navigate(`/quiz/${id}/${quizData[0].id}`);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  {lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}
                </button>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    isDark 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'ar' ? 'لاحقاً' : 'Later'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ViewVideo;