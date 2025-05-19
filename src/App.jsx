import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTheme } from './redux/features/themeSlice';
import Footer from './components/Footer/Footer';
import Register from './pages/Register/Register';
import Login from './pages/login/login';
import ForgetPassword from './pages/ForgetPassword/ForgetPassword';
import ResetPassword from './pages/RessetPassword/RessetPassword';
import ProfilePage from './pages/Profile/Profile';
import ContactUs from './components/ContactUs/ContactUs';


function App() {
  const theme = useSelector(selectTheme);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/resset" element={<ResetPassword />} />
        <Route path="/me" element={<ProfilePage />} />
      </Routes>
      <Footer />
      <ContactUs />
    </div>
  );
}

export default App
