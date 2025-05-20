// LoadingPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
const Loading = () => {
    const theme = useSelector(selectTheme);
    return (
        <div className={` ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-black border-gray-100'} flex items-center justify-center h-screen`}>
            <div className="flex flex-col items-center space-y-6">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin "></div>


                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                    Please wait for loading...
                </motion.p>
            </div>
        </div>
    );
};

export default Loading;
