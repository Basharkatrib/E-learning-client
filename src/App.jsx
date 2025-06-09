import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

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

function App() {
  const theme = useSelector(selectTheme);


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
