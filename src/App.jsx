import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';

import { useSelector } from 'react-redux';
import { selectTheme } from './redux/features/themeSlice';

function App() {
  const theme = useSelector(selectTheme);

  return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Navbar />
        <Home />
      </div>
  );
}

export default App
