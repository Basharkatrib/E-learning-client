import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTheme } from './redux/features/themeSlice';
import Footer from './components/Footer/Footer';
function App() {
  const theme = useSelector(selectTheme);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App
