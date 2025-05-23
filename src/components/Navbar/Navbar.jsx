import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectTheme } from '../../redux/features/themeSlice';
import logo from '../../assets/images/navbar/Logo.svg';
import UAE from '../../assets/images/navbar/UAE.png';
import USA from '../../assets/images/navbar/USA.jpeg';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../redux/features/apiSlice';
import { toast } from 'react-hot-toast';
import { logout as logoutAction, selectToken, selectCurrentUser } from '../../redux/features/authSlice';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('En');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useSelector(selectTheme);
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);
    const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

    useEffect(() => {
        console.log(token);
    }, [token]);

    const navItems = [
        { id: 1, name: 'Home', href: '/' },
        { id: 2, name: 'Courses', href: '/' },
        { id: 3, name: 'About Us', href: '/' },
        { id: 4, name: 'Pricing', href: '/about' },
        { id: 5, name: 'Contact', href: '/contact' }
    ];

    const handleLogout = async () => {
        try {
            await logout(token).unwrap();
            dispatch(logoutAction());
            setIsUserMenuOpen(false);
            toast.success('Logged out successfully.');
        } catch (err) {
            toast.error('Logout failed.');
        }
    };

    const handleProfileClick = () => {
        setIsUserMenuOpen(false);
        navigate('/profile');
    };

    return (
        <nav className={`fixed top-0 w-full left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} shadow-md transition-colors duration-200`}>
            <div className="px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center py-4 w-full">
                    <div className="flex items-center gap-2">
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10"
                            src={logo}
                            alt="logo"
                        />
                        <ul className='hidden md:flex items-center gap-6'>
                            {navItems.map((item) => (
                                <motion.li key={item.id}>
                                    <a
                                        href={item.href}
                                        className={`p-2 rounded-[4px] transition-all duration-200 ${theme === 'dark'
                                            ? 'text-white hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div className='flex items-center gap-4'>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dispatch(toggleTheme())}
                            className={`p-2 rounded-full transition-colors duration-200 ${theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-100'
                                }`}
                        >
                            {theme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </motion.button>

                        {/* Language Toggle */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className='flex items-center gap-2 cursor-pointer'
                            onClick={() => setCurrentLang(currentLang === 'En' ? 'Ar' : 'En')}
                        >
                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                {currentLang}
                            </span>
                            <img
                                src={currentLang === 'En' ? USA : UAE}
                                alt="language"
                                className='w-7 h-5 object-cover rounded'
                            />
                        </motion.div>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="relative">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                                {user?.name}
                                            </span>
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {user.email}
                                            </span>
                                        </div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-5 w-5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </motion.div>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                                    } ring-1 ring-black ring-opacity-5`}
                                            >
                                                <Link to="/me">
                                                    <button
                                                        onClick={handleProfileClick}
                                                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${theme === 'dark'
                                                                ? 'text-gray-200 hover:bg-gray-700'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={logoutLoading}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${theme === 'dark'
                                                            ? 'text-red-400 hover:bg-gray-700'
                                                            : 'text-red-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {logoutLoading ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Logging out...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                            </svg>
                                                            <span>Logout</span>
                                                        </>
                                                    )}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/signup">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-4 py-2 rounded-md transition-colors cursor-pointer duration-200 ${theme === 'dark'
                                                    ? 'text-gray-200 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </Link>
                                    <Link to="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className='bg-primary text-white cursor-pointer font-bold px-4 py-2 rounded-md transition-colors duration-200'
                                        >
                                            Login
                                        </motion.button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`md:hidden inline-flex items-center justify-center p-2 rounded-md ${theme === 'dark'
                                ? 'text-gray-200 hover:text-purple-400'
                                : 'text-gray-700 hover:text-purple-600'
                                }`}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden flex justify-center items-center"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navItems.map((item) => (
                                    <motion.a
                                        key={item.id}
                                        href={item.href}
                                        whileHover={{ x: 10 }}
                                        className={`block text-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark'
                                            ? 'text-gray-200 hover:text-purple-400'
                                            : 'text-gray-700 hover:text-purple-600'
                                            }`}
                                    >
                                        {item.name}
                                    </motion.a>
                                ))}
                                {!user ? (
                                    <div className="mt-4 flex flex-col gap-2 px-3 w-fit">
                                        <Link to="/signup">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-4 py-2 rounded-md w-full text-left ${theme === 'dark'
                                                    ? 'text-gray-200 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                Sign Up
                                            </motion.button>
                                        </Link>
                                        <Link to="/login">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                className='bg-primary text-center text-white font-bold px-4 py-2 rounded-md w-full'
                                            >
                                                Login
                                            </motion.button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-col gap-2 px-3 w-fit">
                                        <Link to="/me">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-4 py-2 rounded-md w-full text-left ${theme === 'dark'
                                                    ? 'text-gray-200 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                Profile
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLogout} 
                                            className='bg-red-500 text-white font-bold px-4 py-2 rounded-md w-full'
                                        >
                                            Logout
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </nav>
    );
}

export default Navbar;
