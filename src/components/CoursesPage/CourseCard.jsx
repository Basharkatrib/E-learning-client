import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBookmark, FaRegBookmark, FaTrash } from 'react-icons/fa';
import { useCheckSavedCourseMutation, useSaveCourseMutation, useUnsaveCourseMutation } from '../../redux/features/apiSlice';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../redux/features/authSlice';

const CourseCard = ({
  id,
  title,
  description,
  author,
  duration,
  level,
  category,
  thumbnail_url,
  isDark,
  showSaveButton = true,
  isSavedPage = false
}) => {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardShadow = isDark
    ? 'shadow-lg shadow-black/30'
    : 'shadow-lg shadow-gray-200/60';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const badgeBg = isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const { t } = useTranslation();
  const token = useSelector(selectToken);

  const [isLocalSaved, setIsLocalSaved] = useState(isSavedPage);
  const [checkSaved, { data: savedStatus }] = useCheckSavedCourseMutation();
  const [saveCourse] = useSaveCourseMutation();
  const [unsaveCourse] = useUnsaveCourseMutation();

  useEffect(() => {
    if (token && !isSavedPage) {
      checkSaved({ courseId: id, token });
    }
  }, [checkSaved, id, token, isSavedPage]);

  useEffect(() => {
    if (!isSavedPage && savedStatus?.is_saved !== undefined) {
      setIsLocalSaved(savedStatus.is_saved);
    }
  }, [savedStatus, isSavedPage]);

  const handleSaveToggle = async () => {
    if (!token) {
      toast.error(t('Please login to save courses'));
      return;
    }

    try {
      if (isLocalSaved) {
        await unsaveCourse({ courseId: id, token }).unwrap();
        setIsLocalSaved(false);
        toast.success(t('Course removed from saved courses'));
      } else {
        await saveCourse({ courseId: id, token }).unwrap();
        setIsLocalSaved(true);
        toast.success(t('Course saved successfully'));
      }
    } catch (error) {
      toast.error(t('Error updating saved status'));
    }
  };

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
          src={thumbnail_url}
          alt={title}
          className="w-full h-72 object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-black/30 text-white`}>
            {duration}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-black/30 text-white`}>
            {t(level)}
          </span>
          {showSaveButton && (
            <button
              onClick={handleSaveToggle}
              className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md bg-black/30 text-white hover:bg-black/40 transition-colors"
              title={isSavedPage ? t('Remove from saved courses') : isLocalSaved ? t('Unsave course') : t('Save course')}
            >
              {isSavedPage ? (
                <FaTrash className="text-red-400 hover:text-red-500" />
              ) : isLocalSaved ? (
                <FaBookmark className="text-yellow-400" />
              ) : (
                <FaRegBookmark />
              )}
            </button>
          )}
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
            <Link 
              to={`/course-details/${id}`}
              className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition"
            >
              {t('View Course')}
            </Link>
          </div>

          <p className={`text-base ${subTextColor} mb-6 line-clamp-3`}>{description}</p>

          {/* Course Info */}
          <div className={`border-t ${borderColor} pt-4`}>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${badgeBg}`}>
                  {category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${badgeBg}`}>
                  {t(level)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${badgeBg}`}>
                  {duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;