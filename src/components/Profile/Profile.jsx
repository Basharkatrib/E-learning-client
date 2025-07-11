import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/testimonials/me.jpg';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import coverImg from '../../assets/images/navbar/logo.png';

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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen flex items-center justify-center px-4 mt-22 py-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        {/* Cover Photo */}
        <div className={`relative h-40 md:h-44 w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <img src={coverImg} alt="cover" className="h-24 md:h-32 object-contain" />
        </div>
        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:items-stretch gap-0">
          {/* Left: User Info */}
          <div className={`md:w-1/2 flex flex-col items-center md:items-start px-6 pt-16 pb-8 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="absolute top-2 md:-top-16 left-1/2 md:left-12 transform -translate-x-1/2 md:translate-x-0 z-10">
              <img
                src={profilePic}
                alt="Profile"
                className={`w-32 h-32 object-cover rounded-full ring-4 ring-primary/40 shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              />
            </div>
            <div className="mt-20 md:mt-16 w-full">
              <h2 className={`text-2xl font-bold mb-2 text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name || t('Name')}</h2>
              <p className={`mb-2 text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.bio}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEdit}
                className={`px-6 py-2 rounded-full transition-colors duration-200 shadow-md font-semibold text-base mt-2 w-full md:w-auto ${
                  editMode 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                {editMode ? t('Cancel') : t('Edit Profile')}
              </motion.button>
              {/* User Stats Example */}
              <div className="mt-8 w-full flex flex-col gap-2">
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a7.963 7.963 0 01-2.4 2.4M4.6 15a7.963 7.963 0 002.4 2.4M12 4v1m0 14v1m8-8h-1M5 12H4"/></svg>
                  <span>{t('Joined')}: 2023-01-01</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M4 11h16"/></svg>
                  <span>{t('Courses')}: 5</span>
                </div>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className={`hidden md:block w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} my-8`}></div>
          {/* Right: Profile Form */}
          <div className={`md:w-1/2 flex items-center justify-center px-6 py-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <form onSubmit={handleSubmit} className={`w-full max-w-md space-y-6 rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Name')}</label>
              </div>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4"/></svg>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Email')}</label>
              </div>
              <input
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v9"/></svg>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Bio')}</label>
              </div>
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                disabled={!editMode}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {editMode && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg font-semibold text-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('Save Changes')}
                </motion.button>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
