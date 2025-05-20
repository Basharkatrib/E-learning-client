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
  // ألوان حسب الوضع
  const cardBg = isDark ? 'bg-gray-900' : 'bg-white';
  const cardShadow = isDark
    ? 'shadow-lg shadow-black/30'
    : 'shadow-lg shadow-gray-200/60';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const badgeBg = isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700';
  const curriculumBg = isDark ? 'bg-gray-800' : 'bg-white';
  const curriculumBorder = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: 'spring' }}
      className={`rounded-2xl ${cardBg} ${cardShadow} p-8 mb-8 transition-all`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-xl md:text-2xl font-bold mb-2 ${textColor}`}>{title}</h2>
          <p className={`text-base ${subTextColor}`}>{description}</p>
        </div>
        <button
          className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition"
        >
          View Course
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 gap-8">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${title}-img-${idx}`}
            className="rounded-xl w-full h-64 object-cover"
          />
        ))}
      </div>

      <div className="flex gap-3 mb-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeBg}`}>
          {duration}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeBg}`}>
          {level}
        </span>
      </div>

      <div className={`text-sm font-medium text-right mb-6 ${subTextColor}`}>
        By {author}
      </div>

      {/* Curriculum */}
      <div className={`rounded-xl ${curriculumBg} border ${curriculumBorder} p-5`}>
        <h3 className={`font-semibold mb-4 ${textColor}`}>Curriculum</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {curriculum.map((item, i) => (
            <div
              key={i}
              className={`text-center`}
            >
              <span className="block text-4xl font-extrabold text-primary mb-1">
                {i + 1 < 10 ? `0${i + 1}` : i + 1}
              </span>
              <span className={`text-lg font-medium ${subTextColor}`}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;