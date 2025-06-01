import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/testimonials/me.jpg';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';

function ProfilePage() {
  const theme = useSelector(selectTheme);
  const currentUser = useSelector(selectCurrentUser);
  const [editMode, setEditMode] = useState(false);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: 'Front-End Developer'
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || 'Front-End Developer'
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setEditMode(!editMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add update profile logic here
    setEditMode(false);
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center px-4 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-4xl rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'}`}
      >
        <div className="flex flex-col items-center col-span-1">
          <div className="relative">
            <img
              src={profilePic}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full ring-4 ring-primary/30 mb-4"
            />
            {editMode && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-6 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleEdit}
            className={`mt-2 px-6 py-2 rounded-full transition-colors duration-200 ${
              editMode 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {editMode ? t('Cancel') : t('Edit Profile')}
          </motion.button>
        </div>

        <div className="col-span-2">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Name')}</label>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Email')}</label>
              <input
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Bio')}</label>
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                disabled={!editMode}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {editMode && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
