import React from 'react';
import { motion } from 'framer-motion';

const CourseCard = ({
  title,
  description,
  author,
  duration,
  level,
  curriculum,
  images,
  isDark,
}) => {
  const cardBg = isDark ? 'bg-gray-900' : 'bg-white';
  const cardShadow = isDark
    ? 'shadow-lg shadow-black/30'
    : 'shadow-lg shadow-gray-200/60';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const badgeBg = isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`flex flex-col md:flex-row rounded-2xl ${cardBg} ${cardShadow} overflow-hidden hover:shadow-xl transition-all duration-300`}
    >
      {/* Course Image */}
      <div className="md:w-1/3 relative">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-64 md:h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-black/30 text-white`}>
            {duration}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-black/30 text-white`}>
            {level}
          </span>
        </div>
      </div>

      {/* Course Details */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className={`text-xl md:text-2xl font-bold ${textColor}`}>{title}</h2>
              <p className={`text-sm ${subTextColor} mt-1`}>By {author}</p>
            </div>
            <button className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition">
              View Course
            </button>
          </div>

          <p className={`text-base ${subTextColor} mb-6`}>{description}</p>

          {/* Curriculum Preview */}
          <div className={`border-t ${borderColor} pt-4`}>
            <h3 className={`font-semibold mb-3 ${textColor}`}>Course Curriculum</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {curriculum.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className={`text-sm font-medium ${subTextColor}`}>{item}</span>
                </div>
              ))}
              {curriculum.length > 3 && (
                <div className={`text-sm font-medium text-primary`}>
                  +{curriculum.length - 3} more modules
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;