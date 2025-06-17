import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { addNotification } from './redux/features/notificationsSlice';

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

import { useGetCurrentUserQuery } from './redux/features/apiSlice';
import { setCredentials } from './redux/features/authSlice';
import { selectTheme } from './redux/features/themeSlice';
import Chat from './components/Chat/Chat';
import Pusher from 'pusher-js';
function App() {
  console.log('Pusher Key:', import.meta.env.VITE_PUSHER_API_KEY);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/me" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/course" element={<VedioPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Footer />
      <Chat />
    </div>
  );
}

export default App;
