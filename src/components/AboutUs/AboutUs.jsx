import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { motion } from 'framer-motion';

const achievements = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#8B5CF6"/><path d="M12 17l-5 2 1-5.5L3 9.5l5.5-.5L12 4l3.5 5 5.5.5-5 4.5 1 5.5-5-2z" fill="#fff"/></svg>
    ),
    title: "Trusted by Thousands",
    desc: "We have successfully served thousands of students, helping them unlock their potential and achieve their career goals.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#F59E42"/><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#fff"/></svg>
    ),
    title: "Award-Winning Courses",
    desc: "Our courses have received recognition and accolades in the industry for their quality, depth of content, and effective teaching methodologies.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#10B981"/><path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" fill="#fff"/></svg>
    ),
    title: "Positive Student Feedback",
    desc: "We take pride in the positive feedback we receive from our students, who appreciate the practicality and relevance of our course materials.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#6366F1"/><path d="M17 7H7v10h10V7zm-2 8h-2v-2h2v2zm0-4h-2V9h2v2z" fill="#fff"/></svg>
    ),
    title: "Industry Partnerships",
    desc: "We have established strong partnerships with industry leaders, enabling us to provide our students with access to the latest tools and technologies.",
  },
];

const goals = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#3B82F6"/><path d="M12 17l-5-5h3V7h4v5h3l-5 5z" fill="#fff"/></svg>
    ),
    title: "Provide Practical Skills",
    desc: "We focus on delivering practical skills that are relevant to the current industry demands. Our courses are designed to equip learners with the knowledge and tools needed to excel in their chosen field.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#F472B6"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#fff"/></svg>
    ),
    title: "Foster Creative Problem-Solving",
    desc: "We encourage creative thinking and problem-solving abilities, allowing our students to tackle real world challenges with confidence and innovation.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#06B6D4"/><path d="M17 10.5V8c0-1.1-.9-2-2-2H9C7.9 6 7 6.9 7 8v2.5l5 4.5 5-4.5zM7 12.5V16c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-3.5l-5 4.5-5-4.5z" fill="#fff"/></svg>
    ),
    title: "Promote Collaboration and Community",
    desc: "We believe in the power of collaboration and peer learning. Our platform fosters a supportive and inclusive community where learners can connect, share insights, and grow together.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#F43F5E"/><path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: "Stay Ahead of the Curve",
    desc: "The digital landscape is constantly evolving, and we strive to stay at the forefront of industry trends. We regularly update our course content to ensure our students receive the latest knowledge and skills.",
  },
];

const containerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      type: 'spring',
    },
  }),
};

export default function AboutUs() {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen w-full mt-18 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} pt-8 pb-16`}> 
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-start items-center gap-8 text-center md:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent drop-shadow-lg">
              About LearNova
            </h1>
          </div>
          <p className={`max-w-xl ${isDark? 'text-white' : 'text-gray-500'} text-sm sm:text-base md:text-lg font-medium mx-auto md:mx-0`}>
            Welcome to our platform, where we are passionate about empowering individuals to master the world of design and development. We offer a wide range of online courses designed to equip learners with the skills and knowledge needed to succeed in the ever-evolving digital landscape.
          </p>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        className="px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 mt-12"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-2">Achievements</h2>
        <p className={`text-gray-400 text-sm sm:text-base mb-6 ${isDark? 'text-white' : 'text-gray-500'}`}>
          Our commitment to excellence has led us to achieve significant milestones along our journey. Here are some of our notable achievements
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {achievements.map((item, idx) => (
            <motion.div
              key={item.title}
              className={`group flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 rounded-2xl p-4 sm:p-6 shadow-xl border transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-gray-700' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border-gray-200'} hover:scale-[1.025] hover:shadow-2xl w-full`}
              custom={idx}
              variants={fadeInUp}
              whileHover={{ y: -6, boxShadow: '0 8px 32px 0 rgba(80,80,200,0.15)' }}
            >
              <div className="flex-shrink-0 mb-2 sm:mb-0">{item.icon}</div>
              <div className="w-full">
                <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDark? 'text-white' : 'text-gray-500'}`}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div
        className="px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-2">Our Goals</h2>
        <p className={`text-gray-400 text-sm sm:text-base mb-6 ${isDark? 'text-white' : 'text-gray-500'}`}>
          At SkillBridge, our goal is to empower individuals from all backgrounds to thrive in the world of design and development. We believe that education should be accessible and transformative, enabling learners to pursue their passions and make a meaningful impact. Through our carefully crafted courses, we aim to
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {goals.map((item, idx) => (
            <motion.div
              key={item.title}
              className={`group flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 rounded-2xl p-4 sm:p-6 shadow-xl border transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-gray-700' : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border-gray-200'} hover:scale-[1.025] hover:shadow-2xl w-full`}
              custom={idx}
              variants={fadeInUp}
              whileHover={{ y: -6, boxShadow: '0 8px 32px 0 rgba(80,80,200,0.15)' }}
            >
              <div className="flex-shrink-0 mb-2 sm:mb-0">{item.icon}</div>
              <div className="w-full">
                <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDark? 'text-white' : 'text-gray-500'}`}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="px-4 sm:px-6 lg:px-8 flex justify-center md:justify-end"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white font-bold w-full sm:w-auto px-8 py-4 rounded-xl shadow-lg text-base sm:text-lg transition-all"
        >
          Join Now
        </motion.button>
      </motion.div>
    </div>
  );
}
