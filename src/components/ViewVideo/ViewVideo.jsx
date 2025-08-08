import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  useCheckPaymentStatusQuery,
} from '../../redux/features/apiSlice';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import { selectToken } from '../../redux/features/authSlice';
import Notes from '../Notes/Notes';
import { toast } from 'react-hot-toast';

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
  // Remove showQuizModal state since we don't need the 70% popup anymore
  
  const { data: coursesData, isLoading, error } = useGetCourseQuery(id);
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useCourseMyProgressQuery({ token, courseId: id });

  const { data: quizData, isLoading: quizLoading, refetch: refetchQuiz } = useGetQuizQuery(
    { courseId: id, token },
    { skip: !token || !id }
  );

  // Check payment status for paid courses
  const { data: paymentStatusData, isLoading: isPaymentStatusLoading } = useCheckPaymentStatusQuery(
    { token, courseId: id },
    { 
      skip: !token || !id || !coursesData?.price || coursesData?.price <= 0,
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    console.log('Courses Data:', coursesData?.is_sequential);
  }, [coursesData?.is_sequential]); // Only depend on is_sequential property

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
  const [previousProgress, setPreviousProgress] = useState(0);
  const [isChangingVideo, setIsChangingVideo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Add state for final quiz popup
  const [showFinalQuizPopup, setShowFinalQuizPopup] = useState(false);
  
  // Add state for quiz section visibility
  const [showQuizSection, setShowQuizSection] = useState(false);

  // Helper function to check if user can access the course
  const canAccessCourse = useCallback(() => {
    // If course is free, always allow access
    if (!coursesData?.price || coursesData.price <= 0) {
      return true;
    }
    
    // For paid courses, check payment status
    if (!paymentStatusData) {
      return false;
    }
    
    const canAccess = paymentStatusData.paymentStatus === 'paid' || paymentStatusData.enrollmentStatus === 'accepted';
    console.log('Course access check:', {
      coursePrice: coursesData?.price,
      paymentStatus: paymentStatusData?.paymentStatus,
      enrollmentStatus: paymentStatusData?.enrollmentStatus,
      canAccess
    });
    
    return canAccess;
  }, [coursesData?.price, paymentStatusData]);

  // Helper function to get all videos in sequential order
  const getAllVideosInOrder = useCallback(() => {
    if (!coursesData?.sections) return [];
    const videos = coursesData.sections.flatMap(section => section.videos || []);
    console.log('All videos in order:', videos.map(v => ({ id: v.id, title: v.title })));
    return videos;
  }, [coursesData?.sections]);

  // Helper function to check if a video is accessible
  const isVideoAccessible = useCallback((video) => {
    // If sequential mode is disabled (0), all videos are accessible
    if (coursesData?.is_sequential !== 1) return true;
    
    const allVideos = getAllVideosInOrder();
    const currentVideoIndex = allVideos.findIndex(v => v.id === video.id);
    
    // First video is always accessible
    if (currentVideoIndex === 0) return true;
    
    // Check if previous video has been watched
    const previousVideo = allVideos[currentVideoIndex - 1];
    if (!previousVideo) return true;
    
    // Check if the previous video is in the watched videos list
    const isPreviousWatched = watchedVideos.some(watchedId => 
      String(watchedId) === String(previousVideo.id)
    );
    
    console.log('Video accessibility check:', {
      videoId: video.id,
      currentVideoIndex,
      previousVideoId: previousVideo?.id,
      isPreviousWatched,
      watchedVideos,
      isSequential: coursesData?.is_sequential
    });
    
    return isPreviousWatched;
  }, [coursesData?.is_sequential, watchedVideos, getAllVideosInOrder]);

  // Helper function to get the next accessible video
  const getNextAccessibleVideo = useCallback(() => {
    if (coursesData?.is_sequential !== 1) return null;
    
    const allVideos = getAllVideosInOrder();
    const currentVideoIndex = allVideos.findIndex(v => v.id === currentVideo?.id);
    
    // Find the next video that should be accessible
    for (let i = currentVideoIndex + 1; i < allVideos.length; i++) {
      const video = allVideos[i];
      if (isVideoAccessible(video)) {
        return video;
      }
    }
    
    return null;
  }, [coursesData?.is_sequential, currentVideo?.id, getAllVideosInOrder, isVideoAccessible]);

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
    
    // Calculate progress from watched videos when data is loaded (only if no progress is set yet)
    if (coursesData?.sections && ids.length > 0 && progress === 0) {
      const allVideos = coursesData.sections.flatMap(section => section.videos || []);
      const allVideoIds = allVideos.map(v => String(v.id));
      const watchedInThisCourse = ids.filter(watchedId => 
        allVideoIds.includes(String(watchedId))
      );
      const totalVideos = allVideos.length;
      const watchedCount = watchedInThisCourse.length;
      const calculatedProgress = totalVideos > 0 ? Math.min(Math.round((watchedCount / totalVideos) * 100), 100) : 0;
      
      console.log('Calculated progress from watched videos:', {
        totalVideos,
        watchedCount,
        calculatedProgress,
        currentProgress: progress
      });
      
      if (calculatedProgress > 0) {
        setProgress(calculatedProgress);
        setPreviousProgress(calculatedProgress);
        console.log('Progress updated from watched videos:', calculatedProgress);
      }
    }
  }, [watchedVideosData?.watched, watchedVideosData?.data, watchedVideosData, coursesData?.sections]); // Added coursesData.sections dependency

  // Calculate initial progress when both course data and watched videos are loaded (only on refresh)
  useEffect(() => {
    if (coursesData?.sections && watchedVideos.length > 0 && progress === 0 && currentVideo) {
      const allVideos = coursesData.sections.flatMap(section => section.videos || []);
      const allVideoIds = allVideos.map(v => String(v.id));
      const watchedInThisCourse = watchedVideos.filter(watchedId => 
        allVideoIds.includes(String(watchedId))
      );
      const totalVideos = allVideos.length;
      const watchedCount = watchedInThisCourse.length;
      const calculatedProgress = totalVideos > 0 ? Math.min(Math.round((watchedCount / totalVideos) * 100), 100) : 0;
      
      console.log('Initial progress calculation (refresh):', {
        totalVideos,
        watchedCount,
        calculatedProgress,
        currentVideo: currentVideo?.id
      });
      
      if (calculatedProgress > 0) {
        setProgress(calculatedProgress);
        setPreviousProgress(calculatedProgress);
        console.log('Initial progress set from refresh:', calculatedProgress);
      }
    }
  }, [coursesData?.sections, watchedVideos, progress, currentVideo]);

  // Force recalculate progress when both course data and watched videos are loaded
  useEffect(() => {
    if (coursesData?.sections && watchedVideos.length > 0) {
      const allVideos = coursesData.sections.flatMap(section => section.videos || []);
      const allVideoIds = allVideos.map(v => String(v.id));
      const watchedInThisCourse = watchedVideos.filter(watchedId => 
        allVideoIds.includes(String(watchedId))
      );
      const totalVideos = allVideos.length;
      const watchedCount = watchedInThisCourse.length;
      const calculatedProgress = totalVideos > 0 ? Math.min(Math.round((watchedCount / totalVideos) * 100), 100) : 0;
      
      console.log('Force progress calculation:', {
        totalVideos,
        watchedCount,
        calculatedProgress,
        currentProgress: progress,
        watchedVideos: watchedVideos,
        allVideoIds: allVideoIds,
        watchedInThisCourse: watchedInThisCourse
      });
      
      // Always update progress if calculated is different from current
      if (calculatedProgress !== progress) {
        setProgress(calculatedProgress);
        setPreviousProgress(calculatedProgress);
        console.log('Progress force updated:', calculatedProgress);
      }
    }
  }, [coursesData?.sections, watchedVideos]);

  // Helper function to calculate and update progress in backend
  const calculateAndUpdateProgress = useCallback(async () => {
    if (coursesData?.sections && watchedVideos.length > 0) {
      const allVideos = coursesData.sections.flatMap(section => section.videos || []);
      const allVideoIds = allVideos.map(v => String(v.id));
      const watchedInThisCourse = watchedVideos.filter(watchedId => 
        allVideoIds.includes(String(watchedId))
      );
      const totalVideos = allVideos.length;
      const watchedCount = watchedInThisCourse.length;
      const calculatedProgress = totalVideos > 0 ? Math.min(Math.round((watchedCount / totalVideos) * 100), 100) : 0;
      
      console.log('Calculate and update progress:', {
        totalVideos,
        watchedCount,
        calculatedProgress,
        currentProgress: progress,
        watchedVideos: watchedVideos,
        watchedInThisCourse: watchedInThisCourse
      });
      
      // Update progress in backend
      try {
        await updateProgress({
          token,
          courseId: id,
          progress: calculatedProgress,
          videosCompleted: calculatedProgress >= 100
        });
        
        // Update local state
        setProgress(calculatedProgress);
        setPreviousProgress(calculatedProgress);
        
        await refetchProgress();
        console.log('Progress updated in backend:', calculatedProgress);
      } catch (err) {
        console.error('Error updating progress in backend:', err);
      }
    }
  }, [coursesData?.sections, watchedVideos, progress, updateProgress, token, id, refetchProgress]);

  // Update progress in backend when watched videos change
  useEffect(() => {
    if (coursesData?.sections && watchedVideos.length > 0 && token) {
      calculateAndUpdateProgress();
    }
  }, [watchedVideos, calculateAndUpdateProgress]);

  // Control quiz section visibility based on progress and quiz data
  useEffect(() => {
    if (quizData && quizData.length > 0 && coursesData) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = progress >= requiredProgress;
      
      console.log('Quiz section visibility check:', {
        quizDataLength: quizData.length,
        progress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection
      });
      
      setShowQuizSection(shouldShow);
      console.log('Quiz section visibility updated:', shouldShow);
    } else {
      setShowQuizSection(false);
    }
  }, [quizData?.length, coursesData?.is_sequential, progress]);

  // Immediate quiz section visibility update when progress changes
  useEffect(() => {
    if (quizData && quizData.length > 0 && coursesData && progress > 0) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = progress >= requiredProgress;
      
      console.log('Immediate quiz section visibility check:', {
        progress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection
      });
      
      if (shouldShow !== showQuizSection) {
        setShowQuizSection(shouldShow);
        console.log('Immediate quiz section visibility updated:', shouldShow);
      }
    }
  }, [progress, quizData?.length, coursesData?.is_sequential, showQuizSection]);

  // Initialize quiz section visibility on data load
  useEffect(() => {
    if (quizData && quizData.length > 0 && coursesData && progressData) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = progressData.progress >= requiredProgress;
      
      console.log('Initialize quiz section visibility:', {
        progressData: progressData.progress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection
      });
      
      setShowQuizSection(shouldShow);
      console.log('Quiz section visibility initialized:', shouldShow);
    }
  }, [quizData?.length, coursesData?.is_sequential, progressData?.progress]);

  // Update quiz section visibility when watched videos change
  useEffect(() => {
    if (quizData && quizData.length > 0 && coursesData && watchedVideos.length > 0) {
      const allVideos = coursesData.sections.flatMap(section => section.videos || []);
      const allVideoIds = allVideos.map(v => String(v.id));
      const watchedInThisCourse = watchedVideos.filter(watchedId => 
        allVideoIds.includes(String(watchedId))
      );
      const totalVideos = allVideos.length;
      const watchedCount = watchedInThisCourse.length;
      const calculatedProgress = totalVideos > 0 ? Math.min(Math.round((watchedCount / totalVideos) * 100), 100) : 0;
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = calculatedProgress >= requiredProgress;
      
      console.log('Quiz section visibility from watched videos:', {
        totalVideos,
        watchedCount,
        calculatedProgress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection
      });
      
      setShowQuizSection(shouldShow);
      console.log('Quiz section visibility updated from watched videos:', shouldShow);
    }
  }, [watchedVideos, quizData?.length, coursesData?.sections, coursesData?.is_sequential]);

  // Fetch quiz immediately when progress reaches required threshold
  useEffect(() => {
    if (coursesData && progress > 0 && token && id) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      
      if (progress >= requiredProgress && (!quizData || quizData.length === 0)) {
        console.log('Progress reached required threshold, fetching quiz immediately:', {
          progress,
          requiredProgress,
          hasQuizData: !!quizData,
          quizDataLength: quizData?.length || 0
        });
        
        refetchQuiz();
      }
    }
  }, [progress, coursesData?.is_sequential, quizData?.length, token, id, refetchQuiz]);

  // Show quiz section immediately when quiz data is loaded and progress is sufficient
  useEffect(() => {
    if (quizData && quizData.length > 0 && coursesData && progress > 0) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = progress >= requiredProgress;
      
      console.log('Quiz data loaded, checking visibility:', {
        quizDataLength: quizData.length,
        progress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection
      });
      
      if (shouldShow && !showQuizSection) {
        setShowQuizSection(true);
        console.log('Quiz section shown immediately after quiz data loaded');
      }
    }
  }, [quizData?.length, coursesData?.is_sequential, progress, showQuizSection]);

  // Force show quiz section when progress reaches threshold (even without quiz data)
  useEffect(() => {
    if (coursesData && progress > 0) {
      const requiredProgress = coursesData.is_sequential === 1 ? 100 : 80;
      const shouldShow = progress >= requiredProgress;
      
      console.log('Force quiz section visibility check:', {
        progress,
        requiredProgress,
        shouldShow,
        currentShowQuizSection: showQuizSection,
        hasQuizData: !!quizData,
        quizDataLength: quizData?.length || 0
      });
      
      if (shouldShow && !showQuizSection) {
        setShowQuizSection(true);
        console.log('Quiz section force shown due to progress threshold');
      }
    }
  }, [progress, coursesData?.is_sequential, showQuizSection, quizData?.length]);

  // Initialize first video function
  const initializeFirstVideo = useCallback(async () => {
    if (coursesData?.sections?.[0]?.videos?.[0] && !isChangingVideo && !currentVideo) {
      setIsChangingVideo(true);
      const firstVideo = coursesData.sections[0].videos[0];
      
      // Set current video and show it immediately
      setCurrentVideo(firstVideo);
      setShowCover(false);

      // Check if first video is already watched
      const isFirstVideoWatched = watchedVideos.some(watchedId => 
        String(watchedId) === String(firstVideo.id)
      );

      // Only mark as watched if not already watched
      if (!isFirstVideoWatched) {
        try {
          await markVideoAsWatched({ token, videoId: firstVideo.id });
          await refetchWatched();
          console.log('First video marked as watched');
        } catch (err) {
          console.error('Error marking first video as watched:', err);
        }
      } else {
        console.log('First video already watched');
      }
      setIsChangingVideo(false);
    }
  }, [coursesData?.sections, isChangingVideo, currentVideo, token, markVideoAsWatched, refetchWatched, updateProgress, id, refetchProgress, watchedVideos]);

  // Set and mark first video as watched when course data is loaded
  useEffect(() => {
    if (coursesData && token) {
      initializeFirstVideo();
    }
  }, [coursesData, token, initializeFirstVideo]);

  // Function to update progress when watching a video
  const updateProgressWhenWatchingVideo = useCallback(async (videoId) => {
    console.log('Updating progress for video:', videoId);
    await calculateAndUpdateProgress();
  }, [calculateAndUpdateProgress]);

  const handleVideoClick = useCallback(async (video) => {
    console.log('Video click:', {
      videoId: video.id,
      currentVideoId: currentVideo?.id,
      isChangingVideo,
      isSequential: coursesData?.is_sequential,
      isAccessible: isVideoAccessible(video),
      watchedVideos
    });
    
    if (video.id === currentVideo?.id || isChangingVideo) return; // Don't reload if it's the same video or if we're already changing videos
    
    // Check if video is accessible in sequential mode
    if (!isVideoAccessible(video)) {
      console.log('Video not accessible:', video.id);
      toast.error(
        lang === 'ar' 
          ? 'يجب عليك مشاهدة الفيديو السابق أولاً' 
          : 'You must watch the previous video first',
        {
          duration: 3000,
          style: {
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#1F2937',
            border: `1px solid ${isDark ? '#991B1B' : '#FEE2E2'}`,
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '🔒',
        }
      );
      return;
    }
    
    setIsChangingVideo(true);
    setCurrentVideo(video);
    setShowCover(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check if video is already watched
    const isAlreadyWatched = watchedVideos.some(watchedId => 
      String(watchedId) === String(video.id)
    );
    
    // Only mark as watched and update progress if video is not already watched
    if (!isAlreadyWatched) {
      try {
        await markVideoAsWatched({ token, videoId: video.id });
        await refetchWatched();
        
        // Update progress when watching new video
        await updateProgressWhenWatchingVideo(video.id);
      } catch (err) {
        console.error('Error marking video as watched:', err);
      }
    }
    setIsChangingVideo(false);
  }, [currentVideo?.id, isChangingVideo, coursesData?.is_sequential, isVideoAccessible, watchedVideos, markVideoAsWatched, refetchWatched, updateProgressWhenWatchingVideo, token, lang, isDark]);

  // Add video completion tracking
  useEffect(() => {
    if (currentVideo) {
      const isAlreadyWatched = watchedVideos.some(watchedId => 
        String(watchedId) === String(currentVideo.id)
      );
      
      if (!isAlreadyWatched) {
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
    }
  }, [currentVideo?.id, watchedVideos]); // Only depend on currentVideo.id instead of entire currentVideo object

  // Remove quiz modal functions since we don't need the 70% popup anymore

  // Initialize progress from backend data (only if no progress is set yet and no watched videos calculation)
  useEffect(() => {
    if (progressData && progressData.progress !== undefined && progress === 0 && watchedVideos.length === 0) {
      setProgress(progressData.progress);
      setPreviousProgress(progressData.progress);
      console.log('Initialized progress from backend:', progressData.progress);
    }
  }, [progressData?.progress, progress, watchedVideos.length]); // Only depend on progressData.progress, not the entire progressData object

  // Ensure first video is loaded when course data is first loaded
  useEffect(() => {
    if (coursesData?.sections?.[0]?.videos?.[0] && !currentVideo && !isLoading) {
      const firstVideo = coursesData.sections[0].videos[0];
      setCurrentVideo(firstVideo);
      setShowCover(false);
      console.log('First video set as current video:', firstVideo.id);
    }
  }, [coursesData?.sections, isLoading, currentVideo]); // Added currentVideo back to ensure it runs when needed

  // State to track the previous progress to detect when it reaches 100%
  
  // Function to check if final quiz popup has been shown for this course
  const hasFinalQuizPopupBeenShown = () => {
    try {
      const shownFinalQuizPopups = JSON.parse(localStorage.getItem('shownFinalQuizPopups') || '{}');
      const popupData = shownFinalQuizPopups[id];
      
      // Handle old format (boolean)
      if (typeof popupData === 'boolean') {
        return popupData;
      }
      
      // Handle new format (object with timestamp)
      if (popupData && popupData.shown) {
        const currentTime = Date.now();
        
        // Check if expired
        if (popupData.expiresAt && currentTime > popupData.expiresAt) {
          // Remove expired entry
          delete shownFinalQuizPopups[id];
          localStorage.setItem('shownFinalQuizPopups', JSON.stringify(shownFinalQuizPopups));
          console.log('Removed expired popup for course:', id);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return false;
    }
  };

  // Function to mark final quiz popup as shown for this course with timestamp
  const markFinalQuizPopupAsShown = () => {
    try {
      const shownFinalQuizPopups = JSON.parse(localStorage.getItem('shownFinalQuizPopups') || '{}');
      shownFinalQuizPopups[id] = {
        shown: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };
      localStorage.setItem('shownFinalQuizPopups', JSON.stringify(shownFinalQuizPopups));
      console.log('Marked final quiz popup as shown for course:', id, 'with expiration');
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Function to check if popup has expired and clean up
  const checkAndCleanupExpiredPopups = () => {
    try {
      const shownFinalQuizPopups = JSON.parse(localStorage.getItem('shownFinalQuizPopups') || '{}');
      const currentTime = Date.now();
      let hasChanges = false;

      // Check each course's popup status
      Object.keys(shownFinalQuizPopups).forEach(courseId => {
        const popupData = shownFinalQuizPopups[courseId];
        
        // If it's the old format (just boolean), convert to new format
        if (typeof popupData === 'boolean') {
          shownFinalQuizPopups[courseId] = {
            shown: popupData,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
          };
          hasChanges = true;
        }
        
        // Check if expired
        if (popupData.expiresAt && currentTime > popupData.expiresAt) {
          delete shownFinalQuizPopups[courseId];
          hasChanges = true;
          console.log('Removed expired popup for course:', courseId);
        }
      });

      // Save changes if any
      if (hasChanges) {
        localStorage.setItem('shownFinalQuizPopups', JSON.stringify(shownFinalQuizPopups));
      }
    } catch (error) {
      console.error('Error cleaning up expired popups:', error);
    }
  };

  // Function to reset popup state for this course (for debugging/testing)
  const resetPopupStateForCourse = () => {
    try {
      const shownFinalQuizPopups = JSON.parse(localStorage.getItem('shownFinalQuizPopups') || '{}');
      delete shownFinalQuizPopups[id];
      localStorage.setItem('shownFinalQuizPopups', JSON.stringify(shownFinalQuizPopups));
      console.log('Reset popup state for course:', id);
    } catch (error) {
      console.error('Error resetting popup state:', error);
    }
  };

  // Show popup when progress reaches the required percentage based on sequential mode
  useEffect(() => {
    console.log('Progress check:', progress, 'Previous progress:', previousProgress, 'Quiz data:', quizData?.length, 'Has been shown:', hasFinalQuizPopupBeenShown(), 'Sequential mode:', coursesData?.is_sequential);
    
    // Determine the required progress based on sequential mode
    const requiredProgress = coursesData?.is_sequential === 1 ? 100 : 80;
    
    // Check if progress just reached the required percentage (was less than required before)
    const justReachedRequired = previousProgress < requiredProgress && progress >= requiredProgress;
    
    if (justReachedRequired && !hasFinalQuizPopupBeenShown() && quizData?.length > 0) {
      console.log(`Progress just reached ${requiredProgress}%! Showing final quiz popup!`);
      setShowFinalQuizPopup(true);
      markFinalQuizPopupAsShown();
    }
    
    // Update previous progress
    setPreviousProgress(progress);
  }, [progress, quizData?.length, id, coursesData?.is_sequential]); // Removed previousProgress from dependencies to prevent infinite loop

  // Clean up expired popups on component mount and set up periodic cleanup
  useEffect(() => {
    // Clean up on mount
    checkAndCleanupExpiredPopups();
    
    // Set up periodic cleanup every hour
    const cleanupInterval = setInterval(() => {
      checkAndCleanupExpiredPopups();
    }, 60 * 60 * 1000); // 1 hour
    
    // Cleanup on unmount
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Initialize previous progress when progress data is loaded
  useEffect(() => {
    if (progressData?.progress !== undefined) {
      setPreviousProgress(progressData.progress);
      console.log('Initialized previous progress to:', progressData.progress);
      
      // Determine the required progress based on sequential mode
      const requiredProgress = coursesData?.is_sequential === 1 ? 100 : 80;
      
      // Also check if we should show popup on initial load (in case user already has required progress)
      if (progressData.progress >= requiredProgress && !hasFinalQuizPopupBeenShown() && quizData?.length > 0) {
        console.log(`User already has ${requiredProgress}% progress! Showing final quiz popup!`);
        setShowFinalQuizPopup(true);
        markFinalQuizPopupAsShown();
      }
    }
  }, [progressData?.progress, quizData?.length, id, coursesData?.is_sequential]); // Use specific properties instead of entire objects

  // Add debug logging
  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('Quiz Data:', quizData);
    console.log('Progress:', progress);
    console.log('Previous Progress:', previousProgress);
    console.log('Course ID:', id);
    console.log('Token:', token);
    console.log('Has Final Quiz Popup Been Shown:', hasFinalQuizPopupBeenShown());
    console.log('Show Final Quiz Popup State:', showFinalQuizPopup);
    console.log('==================');
  }, [quizData?.length, progress, previousProgress, id, token, showFinalQuizPopup]); // Use quizData.length instead of entire quizData object

  if (isLoading || progressLoading || quizLoading || (coursesData?.price > 0 && isPaymentStatusLoading)) return <LoadingPage />;
  
  // Check if course data exists and is valid
  if (error || progressError || !coursesData || !coursesData.id) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4 mt-18">
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
      <div className="flex justify-center items-center min-h-[60vh] px-4 mt-18">
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

  // Check if user can access the course (for paid courses)
  if (coursesData?.price > 0 && !canAccessCourse()) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4 mt-18">
        <div className={`${isDark ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-500">
            {lang === 'ar' ? 'الدورة غير متاحة' : 'Course Not Available'}
          </h2>
          <p className="text-sm text-gray-400">
            {lang === 'ar' 
              ? 'عذراً، لا يمكنك الوصول لهذه الدورة حتى يتم تأكيد الدفع.' 
              : 'Sorry, you cannot access this course until payment is confirmed.'}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {lang === 'ar' ? 'العودة للدورة' : 'Back to Course'}
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {lang === 'ar' ? 'جميع الدورات' : 'All Courses'}
            </button>
          </div>
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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full mt-22 flex flex-col min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F9FAFB] text-gray-900'} `}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 w-full ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-4 py-3`}>
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden flex-shrink-0 flex items-center gap-3 px-2 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border border-primary/30' 
                  : 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border border-primary/20'
              }`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </div>
              
              {/* Text */}
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold leading-tight">
                  {lang === 'ar' ? 'الدروس' : 'Lessons'}
                </span>
                <span className="text-xs opacity-80 leading-tight">
                  {lang === 'ar' ? 'عرض المحتوى' : 'View Content'}
                </span>
              </div>
              
              {/* Arrow Icon */}
              <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
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
                      <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <h2 className="font-semibold text-lg">{lang === 'ar' ? 'محتوى الدورة' : 'Course Content'}</h2>
            </div>
            {coursesData?.is_sequential === 1 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {lang === 'ar' ? 'متسلسل' : 'Sequential'}
                </span>
              </div>
            )}
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
                        const isWatched = watchedVideos.some(watchedId => 
                          String(watchedId) === String(video.id)
                        );
                        const isActive = currentVideo?.id === video.id;
                        return (
                          <button
                            key={video.id}
                            onClick={() => handleVideoClick(video)}
                            disabled={!isVideoAccessible(video)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                              isActive
                                ? `${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} font-medium`
                                : isWatched
                                  ? `${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`
                                  : !isVideoAccessible(video)
                                    ? `${isDark ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`
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
                              {!isVideoAccessible(video) && (
                                <div className="flex items-center gap-1 mt-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs text-gray-400">
                                    {lang === 'ar' ? 'مقفل' : 'Locked'}
                                  </span>
                                </div>
                              )}
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
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                  <h3 className="text-2xl font-bold text-primary">
                    {lang === 'ar' ? 'اختبار الدورة' : 'Course Quiz'}
                  </h3>
                  {(() => {
                    // Determine the required progress based on sequential mode
                    const requiredProgress = coursesData?.is_sequential === 1 ? 100 : 80;
                    const canTakeQuiz = progress >= requiredProgress;
                    
                    return canTakeQuiz ? (
                      <button
                        onClick={() => navigate(`/courses/${id}/quiz/${quizData[0]?.id}`)}
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
                          {lang === 'ar' 
                            ? `اكمل ${requiredProgress - progress}% للفتح` 
                            : `Complete ${requiredProgress - progress}% to unlock`}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="space-y-4">
                  {quizData.map((quiz) => (
                    <div
                      key={quiz.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <h4 className={`font-semibold text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{quiz.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{lang === 'ar' ? 'الوقت:' : 'Time Limit:'} {quiz.time_limit} {lang === 'ar' ? 'دقيقة' : 'min'}</span>
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
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">
                {lang === 'ar' ? 'محتوى الدورة' : 'Course Content'}
              </h2>
              {coursesData?.is_sequential === 1 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {lang === 'ar' ? 'متسلسل' : 'Sequential'}
                  </span>
                </div>
              )}
            </div>
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
                          disabled={!isVideoAccessible(video)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                            currentVideo?.id === video.id
                              ? isDark
                                ? 'bg-primary text-white'
                                : 'bg-primary/10 text-primary'
                              : !isVideoAccessible(video)
                                ? isDark
                                  ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isDark
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-100'
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              watchedVideos.some(watchedId => String(watchedId) === String(video.id))
                                ? 'bg-green-500'
                                : isDark
                                ? 'bg-gray-700'
                                : 'bg-gray-200'
                            }`}
                          >
                            {watchedVideos.some(watchedId => String(watchedId) === String(video.id)) ? (
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
                          <div className="flex-shrink-0 flex items-center gap-1">
                            <span className="text-xs opacity-60">
                              {video.duration || '0'}
                            </span>
                            {!isVideoAccessible(video) && (
                              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
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

      {/* Quiz Section - Fixed at Bottom */}
      {/* {showQuizSection && coursesData && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-xl`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} shadow-lg`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {lang === 'ar' ? 'الاختبار النهائي' : 'Final Quiz'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                    {lang === 'ar' 
                      ? coursesData?.is_sequential === 1 
                        ? `أكمل جميع الفيديوهات للوصول للاختبار (${progress}/100%)`
                        : `أكمل 80% من الدورة للوصول للاختبار (${progress}/80%)`
                      : coursesData?.is_sequential === 1
                        ? `Complete all videos to access the quiz (${progress}/100%)`
                        : `Complete 80% of the course to access the quiz (${progress}/80%)`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {progress}%
                  </div>
                  <div className={`w-20 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress >= (coursesData?.is_sequential === 1 ? 100 : 80) 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {coursesData?.is_sequential === 1 ? '100%' : '80%'}
                  </div>
                </div>
                
                {progress >= (coursesData?.is_sequential === 1 ? 100 : 80) ? (
                  quizData && quizData.length > 0 ? (
                    <button
                      onClick={() => {
                        setShowFinalQuizPopup(true);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      {lang === 'ar' ? 'ابدأ الاختبار' : 'Take Quiz'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                        isDark 
                          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600' 
                          : 'bg-gray-200/50 text-gray-500 cursor-not-allowed border border-gray-300'
                      }`}
                    >
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {lang === 'ar' ? 'جاري تحميل الاختبار...' : 'Loading Quiz...'}
                    </button>
                  )
                ) : (
                  <button
                    disabled
                    className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      isDark 
                        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600' 
                        : 'bg-gray-200/50 text-gray-500 cursor-not-allowed border border-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
                    </svg>
                    {lang === 'ar' ? 'أكمل الدورة أولاً' : 'Complete Course First'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}

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



      {/* Final Quiz Popup */}
      {showFinalQuizPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFinalQuizPopup(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-full max-w-md p-6 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-500">
                {lang === 'ar' ? 'مبروك! يمكنك الآن بدء الامتحان النهائي.' : 'Congratulations! You can now take the final quiz.'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {lang === 'ar' 
                  ? coursesData?.is_sequential === 1 
                    ? 'لقد أكملت جميع فيديوهات الدورة بنجاح! يمكنك الآن إجراء الاختبار النهائي للحصول على شهادة الدورة.'
                    : 'لقد أكملت 80% من الدورة! يمكنك الآن إجراء الاختبار النهائي للحصول على شهادة الدورة.'
                  : coursesData?.is_sequential === 1
                    ? 'You have successfully completed all course videos! You can now take the final quiz to earn your course certificate.'
                    : 'You have completed 80% of the course! You can now take the final quiz to earn your course certificate.'}
              </p>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mt-2`}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{lang === 'ar' ? 'معلومات الاختبار:' : 'Quiz Information:'}</span>
                </div>
                <ul className="space-y-1 text-left">
                  <li>• {lang === 'ar' ? 'عدد الأسئلة:' : 'Questions:'} {quizData[0]?.questions?.length || 0}</li>
                  <li>• {lang === 'ar' ? 'الوقت المطلوب:' : 'Time Required:'} {lang === 'ar' ? 'غير محدد' : 'Unlimited'}</li>
                  <li>• {lang === 'ar' ? 'الدرجة المطلوبة:' : 'Passing Score:'} {lang === 'ar' ? '70%' : '70%'}</li>
                </ul>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => {
                    setShowFinalQuizPopup(false);
                    navigate(`/courses/${id}/quiz/${quizData[0].id}`);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105"
                >
                  {lang === 'ar' ? 'ابدأ الاختبار النهائي' : 'Take Final Quiz'}
                </button>
                <button
                  onClick={() => setShowFinalQuizPopup(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    isDark 
                      ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
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