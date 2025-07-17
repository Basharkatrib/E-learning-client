import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/testimonials/me.jpg';
import { useTranslation } from 'react-i18next';
import coverImg from '../../assets/images/navbar/logo.png';
import { selectTranslate } from '../../redux/features/translateSlice';

function ProfilePage() {
  const theme = useSelector(selectTheme);
  const currentUser = useSelector(selectCurrentUser);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: 'Front-End Developer',
    country: '',
    specialization: '',
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || 'Front-End Developer',
        country: currentUser.country || '',
        specialization: currentUser.specialization || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        <div className={`relative h-40 md:h-44 w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <img src={coverImg} alt="cover" className="h-24 md:h-32 object-contain" />
        </div>

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
              <p className={`mb-1 text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.bio}</p>
              <p className={`text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              <p className={`text-sm mt-2 text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Country')}: {user.country || t('Not specified')}</p>
              <p className={`text-sm mb-4 text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Specialization')}: {user.specialization || t('Not specified')}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEdit}
                className={`px-6 py-2 rounded-full transition-colors duration-200 shadow-md font-semibold text-base mt-2 w-full md:w-auto ${editMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
              >
                {editMode ? t('Cancel') : t('Edit Profile')}
              </motion.button>
            </div>
          </div>

          {/* Divider */}
          <div className={`hidden md:block w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} my-8`}></div>

          {/* Right: Profile Form */}
          <div className={`md:w-1/2 flex items-center justify-center px-6 py-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <form onSubmit={handleSubmit} className={`w-full max-w-md space-y-6 rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Name */}
              <FormField label={t('Name')} name="name" value={user.name} onChange={handleChange} editMode={editMode} theme={theme} />
              {/* Email */}
              <FormField label={t('Email')} name="email" value={user.email} onChange={handleChange} editMode={editMode} theme={theme} type="email" />
              {/* Country */}
              <FormField label={t('Country')} name="country" value={user.country} onChange={handleChange} editMode={editMode} theme={theme} />
              {/* Specialization */}
              <FormField label={t('Specialization')} name="specialization" value={user.specialization} onChange={handleChange} editMode={editMode} theme={theme} />
              {/* Bio */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Bio')}</label>
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

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

function FormField({ label, name, value, onChange, editMode, theme, type = 'text' }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={!editMode}
        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
      />
    </div>
  );
}

export default ProfilePage;
