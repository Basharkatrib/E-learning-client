import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { addNotification } from './redux/features/notificationsSlice';
import logo from './assets/images/navbar/logo.png'
import { motion } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/login/login';
import ForgetPassword from './pages/ForgetPassword/ForgetPassword';
import ResetPassword from './pages/RessetPassword/RessetPassword';
import ProfilePage from './pages/Profile/Profile';
import Contact from './pages/Contact/Contact';
import Courses from './pages/Courses/Courses';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import LoadingPage from './pages/LoadingPage/LoadingPage';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import VedioPage from './pages/VideoPage/VideoPage';
import CourseDetailsPage from './pages/CourseDetailsPage/CourseDetailsPage';
import { useGetCurrentUserQuery } from './redux/features/apiSlice';
import { setCredentials, logout, selectToken } from './redux/features/authSlice';
import { selectTheme } from './redux/features/themeSlice';
import Chat from './components/Chat/Chat';
import Pusher from 'pusher-js';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage';
import ProtectedCourseRoute from './components/ProtectedCourse/ProtectedCourseRoute';
import ViewMyCourses from './pages/ViewMyCourses/ViewMyCourses';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { useGetCoursesQuery } from "./redux/features/apiSlice";
import QuizPage from './pages/QuizPage/QuizPage';


function App() {
  console.log('Pusher Key:', import.meta.env.VITE_PUSHER_API_KEY);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const { error } = useGetCurrentUserQuery(token);

  const [showSplash, setShowSplash] = useState(true);

  
  useEffect(() => {
    if (error) {
      console.log("CurrentUser error:", error);
    }
  }, [error]);
  
  useEffect(() => {
    if (error && (error.originalStatus === 401 || error.originalStatus === 405)) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0.8, 1], scale: [0.8, 1.6, 1.4, 1.6] }}
          transition={{ duration: 5 }}
          src={logo}
          alt="Logo"
          className="absolute inset-0 m-auto w-56  md:w-72 h-72 object-contain"
        />
      </div>
    );
  }
  

  // useEffect(() => {
  //   Pusher.logToConsole = true;

  //   const pusher = new Pusher(import.meta.env.VITE_PUSHER_API_KEY, {
  //     cluster: 'eu',
  //   });
  //   const channel = pusher.subscribe('channel-name');
  //   channel.bind('my-event', function (data) {
  //     // Add notification to Redux store
  //     dispatch(addNotification({
  //       id: Date.now(), // Use timestamp as unique ID
  //       message: data.data.message || 'New notification received!',
  //       read: false,
  //       timestamp: new Date().toISOString()
  //     }));

  //     // Show toast notification
  //     toast(data.data.message || 'New notification received!', {
  //       duration: 4000,
  //       position: 'top-right',
  //       style: {
  //         background: theme === 'dark' ? '#1F2937' : '#fff',
  //         color: theme === 'dark' ? '#fff' : '#000',
  //         border: '1px solid #6D28D9',
  //       },
  //       icon: '🔔',
  //     });
  //   });

  //   return () => {
  //     channel.unbind_all();
  //     channel.unsubscribe();
  //   };
  // }, [theme, dispatch]);


  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Toaster position="top-center" />
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/me" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>}
          />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/my-courses" element={<ViewMyCourses />} />
        <Route
          path="/course/:id"
          element={
            <ProtectedCourseRoute>
              <VedioPage />
            </ProtectedCourseRoute>
          }
        />
        <Route path="/course-details/:id" element={<CourseDetailsPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/quiz/:courseId/:quizId" element={<QuizPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Footer />
      <Chat />
    </div>
  );
}

export default App;
