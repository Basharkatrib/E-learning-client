import React from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import CourseCard from './CourseCard';

import img1 from '../../assets/images/courses/image-1.png';
import img2 from '../../assets/images/courses/image-2.png';
import img3 from '../../assets/images/courses/image-3.png';

const courses = [
  {
    title: 'Web Design Fundamentals',
    description: 'Learn the fundamentals of HTML, CSS, and responsive design principles.',
    author: 'John Smith',
    duration: '4 Weeks',
    level: 'Beginner',
    curriculum: ['HTML Basics', 'CSS Styling', 'Responsive Design', 'UI Principles', 'Final Project', 'Final Project', 'Final Project'],
    images: [img1, img2, img3],
  },
  {
    title: 'UI/UX Design',
    description: 'Master UI/UX techniques from research to prototype, using design tools and user testing.',
    author: 'Emily Johnson',
    duration: '6 Weeks',
    level: 'Intermediate',
    curriculum: ['Design Thinking', 'User Research', 'Wireframes & Prototypes', 'Visual Design', 'Usability Testing'],
    images: [img2, img3, img1],
  },
  {
    title: 'JavaScript for Beginners',
    description: 'Start your JavaScript journey and build interactive web features from scratch.',
    author: 'David Kim',
    duration: '5 Weeks',
    level: 'Beginner',
    curriculum: ['Intro to JS', 'Variables & Data Types', 'DOM Manipulation', 'Events & Forms', 'Mini Projects'],
    images: [img3, img1, img2],
  },
  {
    title: 'JavaScript for Beginners',
    description: 'Start your JavaScript journey and build interactive web features from scratch.',
    author: 'David Kim',
    duration: '5 Weeks',
    level: 'Beginner',
    curriculum: ['Intro to JS', 'Variables & Data Types', 'DOM Manipulation', 'Events & Forms', 'Mini Projects'],
    images: [img3, img1, img2],
  },
];

export default function CoursesPage() {
  const theme = useSelector(selectTheme); 

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950 transition-all duration-500" />
      <div className="mt-10 pt-16 pb-6 px-4 sm:px-6 lg:px-8">
        <div className=" mb-14 flex flex-col sm:flex-row">
          <h1 className="text-4xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent drop-shadow-lg mb-4">
            Online Courses on Design and Development
          </h1>
          <p className={`text-lg ${theme === 'dark'? "text-white" : "dark:text-gray-300"} mt-2 max-w-2xl mx-auto font-medium`}>
            Explore our curated courses to help you grow your design and development skills step-by-step.
          </p>
        </div>
        <div className="space-y-12 ">
          {courses.map((course, idx) => (
            <CourseCard key={idx} {...course} isDark={theme === 'dark'} />
          ))}
        </div>
      </div>
    </div>
  );
}
