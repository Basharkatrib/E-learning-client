import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import time from '../../assets/images/ViewVideo/time.svg';

const ViewVideo = () => {
    const theme = useSelector(selectTheme);
    const isDark = theme === 'dark';

    const DATA = [
        {
            id: 1,
            num: "01",
            title: "Introduction to UI/UX Design",
            description1: "Understanding UI/UX Design Principles",
            time1: "45 Minutes",
            description2: "Importance of User-Centered Design",
            time2: "1Hour",
            description3: "The Role of UI/UX Design in Product Development",
            time3: "45 Minutes",
            img: time,
        },
        {
            id: 2,
            num: "02",
            title: "User Research and Analysis",
            description1: "Conducting User Research and Interviews",
            time1: "1Hour",
            description2: "Analyzing User Needs and Behavior",
            time2: "1Hour",
            description3: "Creating User Personas and Scenarios",
            time3: "45 Minutes",
            img: time,
        },
        {
            id: 3,
            num: "03",
            title: "Wireframing and Prototyping",
            description1: "Introduction to Wireframing Tools and Techniques",
            time1: "45 Minutes",
            description2: "Creating Low-Fidelity Wireframes",
            time2: "1Hour",
            description3: "Prototyping and Interactive Mockups",
            time3: "45 Minutes",
            img: time,
        },
        {
            id: 4,
            num: "04",
            title: "Visual Design and Branding",
            description1: "Color Theory and Typography in UI Design",
            time1: "45 Minutes",
            description2: "Visual Hierarchy and Layout Design",
            time2: "1Hour",
            description3: "Creating a Strong Brand Identity",
            time3: "45 Minutes",
            img: time,
        },
    ];

    return (
        <div className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>

            {/* Header */}
            <div className="flex flex-col mt-10 lg:flex-row justify-between items-start lg:items-center gap-6">
                <h1 className="font-extrabold text-3xl sm:text-4xl">UI/UX Design Course</h1>
                <div className="w-full lg:w-1/2 text-base sm:text-lg">
                    <p>
                        Welcome to our UI/UX Design course! This comprehensive program will equip you with the knowledge and skills to create exceptional user interfaces (UI) and enhance user experiences (UX). Dive into the world of design thinking, wireframing, prototyping, and usability testing. Below is an overview of the curriculum.
                    </p>
                </div>
            </div>

            {/* Video */}
            <div className="w-full  mt-10">
                <div className='w-full h-126'>
                    <iframe
                        className="w-full h-full rounded-lg shadow-md"
                        src="https://www.youtube.com/embed/MJDPFYe_0g0"
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            {/* Cards */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14"
            >
                {DATA.map((t) => (
                    <motion.div
                        key={t.id}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`flex flex-col gap-4 p-6 rounded-2xl shadow-md transition-all duration-300 border ${isDark
                            ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                            : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-900'
                            }`}
                    >
                        <div>
                            <h1 className="text-lg font-semibold text-indigo-500">{t.num}</h1>
                            <h3 className="text-xl sm:text-2xl font-bold">{t.title}</h3>
                        </div>

                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-start justify-between gap-4 py-3 border-t border-dashed border-gray-400"
                            >
                                <div className="flex-1">
                                    <h4 className="text-sm sm:text-base font-medium">{t[`description${i}`]}</h4>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <img src={t.img} alt="time" className="w-5 h-5" />
                                    <span className="text-xs sm:text-sm font-medium">{t[`time${i}`]}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ViewVideo;
