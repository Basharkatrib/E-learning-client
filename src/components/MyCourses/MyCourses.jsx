import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../redux/features/authSlice';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useUserEnrollmentsQuery } from '../../redux/features/apiSlice';
import { Link } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';

const MyCourses = () => {
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const theme = useSelector(selectTheme);
    const isDark = theme === 'dark';
    const [courses, setCourses] = useState([]);
    const lang = useSelector(selectTranslate);

    const { data, isLoading, error } = useUserEnrollmentsQuery(
        { id: user?.id, token },
        {
            skip: !user || !token,
        }
    );

    useEffect(() => {
        if (data && Array.isArray(data.data)) {
            console.log("Courses received:", data.data);
            setCourses(data.data);
        } else {
            console.error("Unexpected data format", data);
            setCourses([]);
        }
    }, [data]);

    if (isLoading) return <LoadingPage />;
    if (error) return <div className="text-red-500">Error loading courses</div>;

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <h2 className={`text-4xl sm:text-5xl font-extrabold text-center mb-10 mt-10 tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {(lang === "en" ? "My Enrolled Courses" : "الدورات التي التحقت بها")}
                </h2>

                {courses.length === 0 ? (
                    <p className={`text-center text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {(lang === "en") ? "You haven't enrolled in any courses yet." : "لم تقم بالتسجيل في أي دورات بعد."}
                    </p>
                ) : (
                    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.courseId}
                                className={`rounded-2xl overflow-hidden shadow-md transform transition duration-300 hover:scale-105 hover:shadow-2xl
                                ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                            >
                                <img
                                    src={course.courseThumbnailUrl || "https://via.placeholder.com/400x200?text=Course+Thumbnail"}
                                    alt={course.courseTitle}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-2">{(lang === "en" ? course.courseTitle.en : course.courseTitle.ar)}</h3>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {(lang === "en" ? course.courseDescription.en : course.courseDescription.ar)}
                                    </p>
                                    <Link
                                        to={`/course/${course.courseId}`}
                                        className="inline-block mt-2 text-sm font-semibold text-blue-500 hover:text-blue-700 transition"
                                    >
                                        {(lang === "en") ? " Go to Course" : "الذهاب الى الدورة "}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
