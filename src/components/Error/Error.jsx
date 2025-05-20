import React from 'react';
import error from '../../assets/images/error/error.png';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { motion } from 'framer-motion';

const Error = () => {
    const theme = useSelector(selectTheme);

    return (
        <div
            className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center 
                ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-black border-gray-100'}
                border-t`}
        >
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mb-8">
                <img src={error} alt="Error" className="w-full h-auto object-contain" />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Page Not Found
            </h1>

            <p className={`text-sm sm:text-base md:text-lg mb-8 
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We can't find the page that you are looking for ...!
            </p>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-5 py-2.5 rounded-md text-sm sm:text-base hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
                Go Back
            </motion.button>
        </div>
    );
};

export default Error;