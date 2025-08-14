import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import CourseCard from './CourseCard';
import { useGetCoursesQuery } from '../../redux/features/apiSlice';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import { useLocation } from 'react-router-dom';

export default function CoursesPage() {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const { data: coursesData, isLoading, error } = useGetCoursesQuery();

  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');

  // تحديث selectedCategory من الكويري بارامز
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategory(catParam.toLowerCase());
    }
  }, [location.search]);

  const levels = useMemo(() => [
    { value: 'all', label: t('All') },
    { value: 'beginner', label: t('beginner') },
    { value: 'intermediate', label: t('intermediate') },
    { value: 'advanced', label: t('advanced') }
  ], [t]);

  const categories = useMemo(() => {
    if (!coursesData?.data) return [{ value: 'all', label: t('All') }];
    
    const uniqueCategories = new Set(
      coursesData.data.map(course => 
        course.category?.name?.[lang] || course.category?.name?.en || 'Uncategorized'
      )
    );
    
    return [
      { value: 'all', label: t('All') },
      ...Array.from(uniqueCategories).map(cat => ({ 
        value: cat.toLowerCase(), 
        label: cat 
      }))
    ];
  }, [coursesData, lang, t]);

  // Pricing filter options
  const pricingOptions = useMemo(() => ([
    { value: 'all', label: t('All') },
    { value: 'free', label: t('Free') },
    { value: 'paid', label: t('Paid') },
  ]), [t]);

  const filteredCourses = useMemo(() => {
    if (!coursesData?.data) return [];

    return coursesData.data.filter(course => {
      const courseTitle = (course.title?.[lang] || course.title?.en || '').toLowerCase();
      const courseCategory = (course.category?.name?.[lang] || course.category?.name?.en || '').toLowerCase();
      const courseLevel = (course.difficulty_level || '').toLowerCase();

      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = searchQuery === '' || courseTitle.includes(searchLower);

      const matchesLevel = selectedLevel === 'all' || courseLevel === selectedLevel;
      const matchesCategory = selectedCategory === 'all' || courseCategory === selectedCategory;
      const matchesPricing =
        selectedPricing === 'all' ||
        (selectedPricing === 'free' && Number(course.price) === 0) ||
        (selectedPricing === 'paid' && Number(course.price) > 0);

      return matchesSearch && matchesLevel && matchesCategory && matchesPricing;
    });
  }, [coursesData, searchQuery, selectedLevel, selectedCategory, selectedPricing, lang]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-red-500">{t('Error loading courses')}</h2>
          <p className="text-sm text-gray-400">{t('Please try again later')}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative min-h-screen w-full overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950 transition-all duration-500" />
      <div className="mt-14 pt-16 pb-6 px-4 sm:px-6 lg:px-8">
        {/* Search & Filters */}
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
              className={`absolute ${lang === 'ar' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 ${
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
            <div className="flex flex-col gap-1">
              <label htmlFor="levelFilter" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('Level')}
              </label>
              <select
                id="levelFilter"
                dir="ltr"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor="categoryFilter" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('Category')}
              </label>
              <select
                id="categoryFilter"
                dir="ltr"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor="pricingFilter" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('Pricing')}
              </label>
              <select
                id="pricingFilter"
                dir="ltr"
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
              >
                {pricingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('Showing')} {filteredCourses.length === 0 ?  0 : filteredCourses.length} {t('courses')}
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-12">
          {filteredCourses.map((course) => {
            const courseTitle = course.title?.[lang] || course.title?.en || '';
            const courseDescription = course.description?.[lang] || course.description?.en || '';
            const courseDuration = course.duration?.[lang] || course.duration?.en || '';
            const courseCategory = course.category?.name?.[lang] || course.category?.name?.en || '';

            return (
              <CourseCard
                key={course.id}
                id={course.id}
                title={courseTitle}
                description={courseDescription}
                author={course.teacher?.first_name + ' ' + course.teacher?.last_name || 'Unknown Teacher'}
                duration={courseDuration}
                level={course.difficulty_level}
                category={courseCategory}
                thumbnail_url={course.thumbnail_url}
                price={course.price}
                isDark={theme === 'dark'}
              />
            );
          })}
        </div>

        {/* No Courses Message */}
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
