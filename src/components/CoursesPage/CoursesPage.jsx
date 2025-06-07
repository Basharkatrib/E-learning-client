import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import CourseCard from './CourseCard';

import img1 from '../../assets/images/courses/Image-1.png';
import img2 from '../../assets/images/courses/Image-2.png';
import img3 from '../../assets/images/courses/Image-3.png';

const courses = [
  {
    title: 'Web Design Fundamentals',
    description: 'Learn the fundamentals of HTML, CSS, and responsive design principles.',
    author: 'John Smith',
    duration: '4 Weeks',
    level: 'Beginner',
    category: 'Web Development',
    curriculum: ['HTML Basics', 'CSS Styling', 'Responsive Design', 'UI Principles', 'Final Project'],
    images: [img1, img2, img3],
  },
  {
    title: 'UI/UX Design',
    description: 'Master UI/UX techniques from research to prototype, using design tools and user testing.',
    author: 'Emily Johnson',
    duration: '6 Weeks',
    level: 'Intermediate',
    category: 'Design',
    curriculum: ['Design Thinking', 'User Research', 'Wireframes & Prototypes', 'Visual Design', 'Usability Testing'],
    images: [img2, img3, img1],
  },
  {
    title: 'JavaScript for Beginners',
    description: 'Start your JavaScript journey and build interactive web features from scratch.',
    author: 'David Kim',
    duration: '5 Weeks',
    level: 'Beginner',
    category: 'Programming',
    curriculum: ['Intro to JS', 'Variables & Data Types', 'DOM Manipulation', 'Events & Forms', 'Mini Projects'],
    images: [img3, img1, img2],
  },
];

export default function CoursesPage() {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');

  // Filter options
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const categories = ['All', 'Web Development', 'Design', 'Programming'];
  const durations = ['All', '4 Weeks', '5 Weeks', '6 Weeks'];

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesDuration = selectedDuration === 'All' || course.duration === selectedDuration;

      return matchesSearch && matchesLevel && matchesCategory && matchesDuration;
    });
  }, [searchQuery, selectedLevel, selectedCategory, selectedDuration]);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative min-h-screen w-full overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950 transition-all duration-500" />
      <div className="mt-10 pt-16 pb-6 px-4 sm:px-6 lg:px-8">
        {/* <div className="mb-5 flex flex-col sm:flex-row">
          <h1 className="text-4xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent drop-shadow-lg mb-4">
            {t('Online Courses on Design and Development')}
          </h1>
          <p className={`text-lg ${theme === 'dark' ? "text-white" : "dark:text-gray-300"} mt-2 max-w-2xl mx-auto font-medium`}>
            {t('Explore our curated courses to help you grow your design and development skills step-by-step.')}
          </p>
        </div> */}

        {/* Search and Filters Section */}
        <div className="mb-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('Search courses...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
              } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
            />
            <svg
              className={`absolute  ltr:right-4 rtl:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Filter */}
            <div className="relative">
              <select
              dir='ltr'
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {t(level)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                dir='ltr'
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="relative">
              <select
              dir='ltr'
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {durations.map((duration) => (
                  <option key={duration} value={duration}>
                    {t(duration)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('Showing')} {filteredCourses.length} {t('courses')}
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-12">
          {filteredCourses.map((course, idx) => (
            <CourseCard key={idx} {...course} isDark={theme === 'dark'} />
          ))}
        </div>

        {/* No Results Message */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className={`mt-2 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('No courses found')}
            </h3>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('Try adjusting your search or filter criteria')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
