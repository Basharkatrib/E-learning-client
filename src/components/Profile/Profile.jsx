import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import { setCredentials } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/navbar/profilepic.jpg';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import coverImg from '../../assets/images/navbar/logo.png';
import { useUpdateProfileMutation, useGetCurrentUserQuery } from '../../redux/features/apiSlice';

function ProfilePage() {
  const theme = useSelector(selectTheme);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const [updateProfile, { isLoading, isSuccess, error }] = useUpdateProfileMutation();
  const token = useSelector(state => state.auth.token);
  const { data: userData, refetch } = useGetCurrentUserQuery(token);
  const [profileImage, setProfileImage] = useState(null);

  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: 'Front-End Developer',
    country: '',  // إضافة حقل البلد
    specialty: '',  // إضافة حقل التخصص
  });

  useEffect(() => {
    if (userData) {
      setUser({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || 'Front-End Developer',
        country: userData.country || '',  // استرجاع البلد
        specialty: userData.specialty || '',  // استرجاع التخصص
      });
    } else if (currentUser) {
      setUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || 'Front-End Developer',
        country: localStorage.getItem('userCountry') || '',  // استرجاع البلد من localStorage
        specialty: localStorage.getItem('userSpecialty') || '',  // استرجاع التخصص من localStorage
      });
    }
  }, [userData, currentUser]);

  const handleChange = (e) => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setEditMode(!editMode);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        token,
        name: user.name?.trim(),
        profileImage: profileImage,
        country: user.country,  // إضافة البلد عند التحديث
        specialty: user.specialty,  // إضافة التخصص عند التحديث
      }).unwrap();

      // حفظ القيم في localStorage
      localStorage.setItem('userCountry', user.country);
      localStorage.setItem('userSpecialty', user.specialty);

      setEditMode(false);
      const { data } = await refetch();
      if (data) {
        const profileImageUrl = data.profileImage ? `${data.profileImage}?${Date.now()}` : null;
        dispatch(setCredentials({ user: { ...data, profileImage: profileImageUrl }, token }));
      }
    } catch (err) {
      console.error('Update error:', err);
    }
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
            <div className={`absolute top-2 md:-top-16 left-1/2 ${lang === 'ar' ? 'md:right-12' : 'md:left-12'} transform -translate-x-1/2 md:translate-x-0 z-10`}>
              <img
                src={profileImage ? URL.createObjectURL(profileImage) : (userData && userData.profile_image) ? userData.profile_image : profilePic}
                alt="Profile"
                className={`w-32 h-32 object-cover rounded-full ring-4 ring-primary/40 shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                style={{ cursor: editMode ? 'pointer' : 'default' }}
                onClick={() => {
                  if (editMode) {
                    document.getElementById('profile-image-input').click();
                  }
                }}
              />
            </div>
            <div className="mt-20 md:mt-16 w-full">
              <h2 className={`text-2xl font-bold mb-2 text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name || t('Name')}</h2>
              <p className={`mb-2 text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.bio}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Country')}: {user.country || t('Not specified')}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Specialty')}: {user.specialty || t('Not specified')}</p>
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
          <div className={`hidden md:block w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} my-8`}></div>
          <div className={`md:w-1/2 flex items-center justify-center px-6 py-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <form onSubmit={handleSubmit} className={`w-full max-w-md space-y-6 rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Name')}</label>
              </div>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-input"
                onChange={handleImageChange}
              />
              <div className="flex items-center gap-2 mb-2">
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
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Country')}</label>
              </div>
              <input
                name="country"
                value={user.country}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Specialty')}</label>
              </div>
              <input
                name="specialty"
                value={user.specialty}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {editMode && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg font-semibold text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('Save Changes')}
                    </>
                  )}
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
