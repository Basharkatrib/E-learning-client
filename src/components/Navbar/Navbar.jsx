import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/images/navbar/Logo.svg';
import UAE from '../../assets/images/navbar/UAE.png';
import USA from '../../assets/images/navbar/USA.jpeg';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [currentLang, setCurrentLang] = useState('En');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const navItems = [
        { id: 1, name: 'Home', href: '/' },
        { id: 2, name: 'Courses', href: '/' },
        { id: 3, name: 'About Us', href: '/' },
        { id: 4, name: 'Pricing', href: '/about' },
        { id: 5, name: 'Contact', href: '/contact' }
    ];

    return (
        // Desktop Menu
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 w-full">
                    <div className="flex items-center gap-2">
                        <motion.img 
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10" 
                            src={logo} 
                            alt="logo" 
                        />
                        <ul className='hidden md:flex items-center gap-6 '>
                            {navItems.map((item) => (
                                <motion.li 
                                    key={item.id}
                                >
                                    <a 
                                        href={item.href}
                                        className="text-gray-700 hover:bg-gray-100 p-2 rounded-[4px]  hover:text-primary dark:text-white transition-all duration-200"
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
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            {darkMode ? (
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
                            <span className="text-gray-700 dark:text-gray-200">{currentLang}</span>
                            <img 
                                src={currentLang === 'En' ? USA : UAE} 
                                alt="language" 
                                className='w-7 h-5 object-cover rounded'
                            />
                        </motion.div>

                        <div className="hidden md:flex items-center gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'
                            >
                                Sign Up
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                className='bg-primary text-white font-bold px-4 py-2 rounded-md transition-colors duration-200'
                            >
                                Login
                            </motion.button>
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden flex justify-center items-center"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1 ">
                                {navItems.map((item) => (
                                    <motion.a
                                        key={item.id}
                                        href={item.href}
                                        whileHover={{ x: 10 }}
                                        className="block text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                                    >
                                        {item.name}
                                    </motion.a>
                                ))}
                                <div className="mt-4 flex flex-col gap-2 px-3 w-fit">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        className='px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left'
                                    >
                                        Sign Up
                                    </motion.button>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        className='bg-primary text-center text-white font-bold px-4 py-2 rounded-md w-full '
                                    >
                                        Login
                                    </motion.button>
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
