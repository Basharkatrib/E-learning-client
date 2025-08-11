import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';

const TrendingNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null); // حالة جديدة لتخزين الكرت الذي تم توسيعه
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
          params: {
            lang: 'en',
            country: 'us',
            max: 8, 
            category: 'technology',
            token: 'c7c1e4293893892175f5767b19215f96',
          }
        })
        setNews(response.data.articles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  const handleReadMore = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <h2 className={`text-2xl font-bold text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Trending Technology News
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {news.map((article, index) => (
          <motion.div
            key={index}
            className={`p-6 rounded-lg shadow-xl transition-transform transform hover:scale-105 ${
              theme === 'dark' 
              ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700' 
              : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            }`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={article.image || 'https://via.placeholder.com/400'}
              alt={article.title}
              className="w-full h-56 object-cover rounded-t-lg"
            />
            <h3 className="text-lg font-semibold mt-4">{article.title}</h3>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {expandedIndex === index ? article.content || article.description : article.description.substring(0, 100) + '...'}
            </p>
            <button
              onClick={() => handleReadMore(index)}
              className={`text-blue-500 hover:text-blue-700 mt-4 block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
            >
              {expandedIndex === index ? 'Show Less' : 'Read More'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingNews;
