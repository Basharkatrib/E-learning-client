import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import Vector from '../../assets/images/benefits/Vector.svg'

function Benefits() {
    const theme = useSelector(selectTheme);

    const benefits = [
        {
            id: 1,
            title: "Flexible Learning",
            description: "Learn at your own pace with 24/7 access to courses. Set your own schedule and learn when it's most convenient for you.",
            icon: "📚"
        },
        {
            id: 2,
            title: "Expert Instructors",
            description: "Learn from industry professionals with years of practical experience. Our instructors are passionate about sharing their knowledge.",
            icon: "👨‍🏫"
        },
        {
            id: 3,
            title: "Interactive Content",
            description: "Engage with hands-on projects, quizzes, and interactive assignments that reinforce your learning and keep you motivated.",
            icon: "🤝"
        },
        {
            id: 4,
            title: "Career Support",
            description: "Get guidance on career paths, resume building, and job opportunities. Connect with our network of industry partners.",
            icon: "💼"
        },
        {
            id: 5,
            title: "Community Learning",
            description: "Join a vibrant community of learners. Collaborate on projects, share insights, and grow together through peer learning.",
            icon: "👥"
        },
        {
            id: 6,
            title: "Certified Courses",
            description: "Earn recognized certificates upon course completion. Add valuable credentials to your professional portfolio.",
            icon: "🎓"
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
        <div className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 py-12 ${
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
                        Why Choose Us
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                    >
                        Discover the advantages that set our learning platform apart and help you achieve your educational goals.
                    </motion.p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-6 py-3 rounded-md whitespace-nowrap hover:bg-primary/90 transition-colors duration-200 font-medium"
                >
                    Explore All Benefits
                </motion.button>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14"
            >
                {benefits.map((benefit) => (
                    <motion.div
                        key={benefit.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`w-full flex flex-col gap-4 p-6 rounded-xl shadow-lg ${
                            theme === 'dark' 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-50'
                        } transition-colors duration-200`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-4xl">{benefit.icon}</span>
                            <span className={`text-right font-bold text-3xl ${
                                theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                                0{benefit.id}
                            </span>
                        </div>
                        <h2 className={`text-2xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            {benefit.title}
                        </h2>
                        <p className={`${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            {benefit.description}
                        </p>
                        <motion.div 
                            className="w-full flex justify-end"
                            
                        >
                            <img src={Vector} alt="Learn more" className={`w-6 h-6 cursor-pointer ${
                                theme === 'dark' ? 'brightness-200' : ''
                            }`} />
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default Benefits;