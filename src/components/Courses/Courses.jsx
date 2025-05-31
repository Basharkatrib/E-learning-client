import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import image1 from '../../assets/images/courses/Image-1.png';
import image2 from '../../assets/images/courses/Image-2.png';
import image3 from '../../assets/images/courses/Image-3.png';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';



function Courses() {
    const theme = useSelector(selectTheme);
    const lang = useSelector(selectTranslate);


    const courses = [
        {
          id: 1,
          image: image1,
          duration: "6 Weeks",
          level: "Beginner",
          instructor: "John Smith",
          title: "Web Design Fundamentals",
          description:
            "Learn the basics of HTML, CSS, and responsive design. Build modern websites that are functional and user-friendly.",
        },
        {
          id: 2,
          image: image2,
          duration: "8 Weeks",
          level: "Intermediate",
          instructor: "Sarah Johnson",
          title: "JavaScript for Web Development",
          description:
            "Master the core concepts of JavaScript, including DOM manipulation, ES6 features, and asynchronous programming.",
        },
        {
          id: 3,
          image: image3,
          duration: "10 Weeks",
          level: "Advanced",
          instructor: "David Lee",
          title: "Full-Stack Development with MERN",
          description:
            "Build powerful full-stack applications using MongoDB, Express, React, and Node.js. Learn how to structure and deploy your apps.",
        },
        {
          id: 4,
          image: image1,
          duration: "3 Weeks",
          level: "Beginner",
          instructor: "Emily Davis",
          title: "Introduction to UI/UX Design",
          description:
            "Explore user interface and user experience design concepts. Learn about wireframing, prototyping, and usability testing.",
        },
        {
          id: 5,
          image: image2,
          duration: "5 Weeks",
          level: "Intermediate",
          instructor: "Michael Brown",
          title: "React Basics and Components",
          description:
            "Dive into the React ecosystem. Learn how to create dynamic UIs using components, props, state, and hooks.",
        },
        {
          id: 6,
          image: image3,
          duration: "7 Weeks",
          level: "Advanced",
          instructor: "Laura Wilson",
          title: "Backend APIs with Node.js & Express",
          description:
            "Build robust backend APIs using Express and Node.js. Understand routing, middleware, databases, and RESTful services.",
        },
        {
            id: 7,
            image: image1,
            duration: "3 Weeks",
            level: "Beginner",
            instructor: "Emily Davis",
            title: "Introduction to UI/UX Design",
            description:
              "Explore user interface and user experience design concepts. Learn about wireframing, prototyping, and usability testing.",
          },
          {
            id: 8,
            image: image2,
            duration: "5 Weeks",
            level: "Intermediate",
            instructor: "Michael Brown",
            title: "React Basics and Components",
            description:
              "Dive into the React ecosystem. Learn how to create dynamic UIs using components, props, state, and hooks.",
          },
          {
            id: 9,
            image: image3,
            duration: "7 Weeks",
            level: "Advanced",
            instructor: "Laura Wilson",
            title: "Backend APIs with Node.js & Express",
            description:
              "Build robust backend APIs using Express and Node.js. Understand routing, middleware, databases, and RESTful services.",
          },
      ];
      

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-12 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-40"
            >
                <div className="w-full flex flex-col gap-4">
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-4xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        Featured Courses
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                    >
                        Explore our most popular courses and start your learning journey today
                    </motion.p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-6 py-3 rounded-md whitespace-nowrap hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                >
                    View All Courses
                </motion.button>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14"
            >
                {courses.map((course) => (
                    <motion.div
                        key={course.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`w-full flex flex-col rounded-xl overflow-hidden shadow-lg ${
                            theme === 'dark' 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-50'
                        } transition-all duration-200`}
                    >
                        <div className="relative w-full h-48">
                            <img 
                                src={course.image} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {course.duration}
                                </span>
                                <span className={`${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {course.level}
                                </span>
                            </div>
                            
                            <h3 className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {course.title}
                            </h3>
                            
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                {course.description}
                            </p>
                            
                            <div className="mt-2 flex items-center justify-between">
                                <span className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    By {course.instructor}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                                >
                                    Get it Now
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default Courses;