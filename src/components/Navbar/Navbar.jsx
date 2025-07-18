import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/navbar/logo.png';
import UAE from '../../assets/images/navbar/UAE.png';
import USA from '../../assets/images/navbar/USA.jpeg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../../redux/features/apiSlice';
import { toast } from 'react-hot-toast';
import { logout as logoutAction, selectToken, selectCurrentUser } from '../../redux/features/authSlice';
import { selectNotifications, selectUnreadCount, removeNotification, markAsRead, markAllAsRead, clearAllNotifications } from '../../redux/features/notificationsSlice';
import { Menu } from '@headlessui/react';
import { FaGraduationCap, FaBookmark } from 'react-icons/fa';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);
    const { t, i18n } = useTranslation();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);
    const notifications = useSelector(selectNotifications);
    const unreadCount = useSelector(selectUnreadCount);
    const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
    const location = useLocation()
    const currentPath = location.pathname

    function changeLanguage() {
        dispatch(toggleLanguage());
    }
    useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang])

    // 
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRemoveNotification = (id) => {
        dispatch(removeNotification(id));
    };

    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const navItems = [
        { id: 1, name: 'Home', href: '/' },
        { id: 2, name: 'Courses', href: '/courses' },
        { id: 3, name: 'About Us', href: '/aboutus' },
        // { id: 4, name: 'Pricing', href: '/pricing' },
        { id: 5, name: 'Contact', href: '/contactus' }
    ];

    const handleLogout = async () => {
        try {
            await logout(token).unwrap();
            dispatch(logoutAction());
            setIsUserMenuOpen(false);
            setIsOpen(false);
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
        <nav dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`fixed top-0 w-full left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} shadow-md transition-colors duration-200`}>
            <div className="px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center py-4 w-full">
                    <div className="flex items-center gap-2">
                        <Link to="/">
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                className="w-auto h-15"
                                src={logo}
                                alt="logo"
                            />
                        </Link>

                        <ul className='hidden md:flex items-center gap-6'>
                            {navItems.map((item) => {
                                const isActive = currentPath === item.href;
                                return (
                                    <motion.li key={item.id}>
                                        <Link
                                            to={item.href}
                                            className={`p-2 rounded-[4px] transition-all duration-200 ${theme === 'dark'
                                                ? isActive
                                                    ? 'bg-gray-700 text-white'
                                                    : 'text-white hover:bg-gray-700'
                                                : isActive
                                                    ? 'bg-gray-100 text-primary'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                                }`}
                                        >
                                            {t(item.name)}
                                        </Link>
                                    </motion.li>
                                );
                            })}

                            {user && (
                                <>
                                    <motion.li>
                                        <Link
                                            to="/my-courses"
                                            className={`p-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 ${
                                                theme === 'dark'
                                                    ? currentPath === '/my-courses'
                                                        ? 'bg-gray-700 text-white'
                                                        : 'text-white hover:bg-gray-700'
                                                    : currentPath === '/my-courses'
                                                        ? 'bg-gray-100 text-primary'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                            }`}
                                        >
                                            <FaGraduationCap className="text-lg" />
                                            {t('My Courses')}
                                        </Link>
                                    </motion.li>
                                    <motion.li>
                                        <Link
                                            to="/saved-courses"
                                            className={`p-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 ${
                                                theme === 'dark'
                                                    ? currentPath === '/saved-courses'
                                                        ? 'bg-gray-700 text-white'
                                                        : 'text-white hover:bg-gray-700'
                                                    : currentPath === '/saved-courses'
                                                        ? 'bg-gray-100 text-primary'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                            }`}
                                        >
                                            <FaBookmark className="text-lg" />
                                            {t('Saved Courses')}
                                        </Link>
                                    </motion.li>
                                </>
                            )}
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
                            onClick={() => changeLanguage()}
                        >
                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                {lang === 'en' ? 'Ar' : 'En'}
                            </span>
                            <img
                                src={lang === 'en' ? UAE : USA}
                                alt="language"
                                className='w-8 h-6 object-cover rounded'
                            />
                        </motion.div>


                        {/* BUTTON Notifications */}
                        <div className="relative" ref={notifRef}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsNotifOpen(prev => !prev)}
                                className={`p-2 rounded-full transition-colors duration-200 relative ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.437L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>

                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>

                            {/* Mobile Sidebar Notifications */}
                            <AnimatePresence>
                                {isNotifOpen && (
                                    <>
                                        {/* Overlay for mobile */}
                                        <motion.div
                                            className="fixed inset-0 z-40 bg-black/40 md:hidden"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsNotifOpen(false)}
                                        />
                                        {/* Sidebar for mobile */}
                                        <motion.div
                                            initial={{ x: '100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '100%' }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            className={`fixed top-0 right-0 h-full w-80 max-w-full z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-2xl md:hidden flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900`}
                                        >
                                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                                                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Notifications</span>
                                                <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-12 w-12 text-gray-400 mb-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.437L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                            />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                            We'll notify you when something arrives
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {notifications.map((notif) => (
                                                            <li
                                                                key={notif.id}
                                                                className={`group relative ${!notif.read ? 'bg-primary/5' : ''}`}
                                                            >
                                                                <div className="p-4 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 mt-1">
                                                                            <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`text-sm ${theme === "dark" ? 'text-gray-100' : 'text-gray-900'}`}>
                                                                                {notif.message}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                {new Date(notif.timestamp).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex-shrink-0 flex items-center gap-2">
                                                                            {!notif.read && (
                                                                                <button
                                                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                                                                >
                                                                                    Mark read
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => handleRemoveNotification(notif.id)}
                                                                                className="text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Desktop Dropdown Notifications */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`hidden md:fixed md:absolute right-0 mt-2 w-[calc(100vw-2rem)] md:w-80 lg:w-96 rounded-xl shadow-lg z-50 
                                                ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                                                border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                                                max-h-[calc(100vh-8rem)] flex flex-col md:block`}
                                        >
                                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-inherit z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold">Notifications</span>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                            {unreadCount} new
                                                        </span>
                                                    )}
                                                </div>
                                                {notifications.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleMarkAllAsRead}
                                                            className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                                                        >
                                                            Mark all read
                                                        </button>
                                                        <button
                                                            onClick={() => dispatch(clearAllNotifications())}
                                                            className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
                                                        >
                                                            Clear all
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="overflow-y-auto flex-1">
                                                {notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-12 w-12 text-gray-400 mb-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.437L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                            />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                            We'll notify you when something arrives
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {notifications.map((notif) => (
                                                            <li
                                                                key={notif.id}
                                                                className={`group relative ${!notif.read ? 'bg-primary/5' : ''}`}
                                                            >
                                                                <div className="p-4 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 mt-1">
                                                                            <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`text-sm ${theme === "dark" ? 'text-gray-100' : 'text-gray-900'}`}>
                                                                                {notif.message}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                {new Date(notif.timestamp).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex-shrink-0 flex items-center gap-2">
                                                                            {!notif.read && (
                                                                                <button
                                                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                                                                >
                                                                                    Mark read
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => handleRemoveNotification(notif.id)}
                                                                                className="text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* END BUTTON Notifications */}

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
                                        {user.profile_image ? (
                                          <img
                                            src={user.profile_image}
                                            alt="profile"
                                            className="w-10 h-10 rounded-full object-cover shadow-lg border border-primary"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {user.email?.charAt(0).toUpperCase()}
                                          </div>
                                        )}
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
                                                        {t('Profile')}
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
                                                            <span>{t('Logout')}</span>
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
                                            {t('Sign Up')}
                                        </motion.button>
                                    </Link>
                                    <Link to="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className='bg-primary text-white cursor-pointer font-bold px-4 py-2 rounded-md transition-colors duration-200'
                                        >
                                            {t('Login')}
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
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`md:hidden absolute top-full left-0 right-0 ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-lg' : 'bg-white/95 backdrop-blur-lg'} shadow-lg border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="px-4 py-6 max-w-md mx-auto">
                                <div className="space-y-4">
                                    {navItems.map((item) => {
                                        const isActive = currentPath === item.href

                                        return (
                                            <motion.div key={item.href}>
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${theme === 'dark'
                                                        ? `text-gray-200 hover:bg-gray-700/50 ${isActive ? 'bg-gray-700 text-primary' : ''}`
                                                        : `text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-200 text-primary' : ''}`
                                                        }`}
                                                >
                                                    <span className="font-medium">{t(item.name)}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:rotate-0 rtl:rotate-180 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                    {user && (
                                        <>
                                            <motion.div key="my-courses">
                                                <Link
                                                    to="/my-courses"
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${theme === 'dark'
                                                        ? `text-gray-200 hover:bg-gray-700/50 ${currentPath === '/my-courses' ? 'bg-gray-700 text-primary' : ''}`
                                                        : `text-gray-700 hover:bg-gray-100 ${currentPath === '/my-courses' ? 'bg-gray-200 text-primary' : ''}`
                                                        }`}
                                                >
                                                    <span className="font-medium">{(lang === "en") ? "MyCourses" : "الدورات المسجل بها"}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:rotate-0 rtl:rotate-180 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </Link>
                                            </motion.div>
                                            <motion.div key="saved-courses">
                                                <Link
                                                    to="/saved-courses"
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${theme === 'dark'
                                                        ? `text-gray-200 hover:bg-gray-700/50 ${currentPath === '/saved-courses' ? 'bg-gray-700 text-primary' : ''}`
                                                        : `text-gray-700 hover:bg-gray-100 ${currentPath === '/saved-courses' ? 'bg-gray-200 text-primary' : ''}`
                                                        }`}
                                                >
                                                    <span className="font-medium">{(lang === "en") ? "Saved Courses" : "الدورات المحفوظة"}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:rotate-0 rtl:rotate-180 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </Link>
                                            </motion.div>
                                        </>
                                    )}
                                </div>

                                <div className={`mt-6 pt-6 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                                    {!user ? (
                                        <div className="space-y-3">
                                            <Link to="/signup" onClick={() => setIsOpen(false)} className="block">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${theme === 'dark'
                                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                                                        <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                                    </svg>
                                                    {t('Sign Up')}
                                                </motion.button>
                                            </Link>
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-primary/90"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('Login')}
                                                </motion.button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Link to="/me" onClick={() => setIsOpen(false)} className="block">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${theme === 'dark'
                                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('Profile')}
                                                </motion.button>
                                            </Link>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 rounded-lg bg-red-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-red-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                </svg>
                                                {t('Logout')}
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </nav>
    );
}

export default Navbar;