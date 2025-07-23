import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import { setCredentials } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/navbar/profilepic.jpg';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import coverImg from '../../assets/images/navbar/logo.png';
import { useUpdateProfileMutation, useGetCurrentUserQuery } from '../../redux/features/apiSlice';
import { toast } from 'react-hot-toast';

function ProfilePage() {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const token = useSelector(state => state.auth.token);
  const { data: userData, refetch } = useGetCurrentUserQuery(token);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    country: '', 
    specialization: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || '',
        country: userData.country || '',
        specialization: userData.specialization || '',
      });
    } else if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        country: currentUser.country || '', 
        specialization: currentUser.specialization || '',
      });
    }
  }, [userData, currentUser]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setEditMode(!editMode);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('Image size should not exceed 2MB'), {
          duration: 3000,
          style: {
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#1F2937',
            border: `1px solid ${isDark ? '#991B1B' : '#FEE2E2'}`,
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '⚠️',
        });
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(t('Please upload JPG, JPEG, or PNG image'), {
          duration: 3000,
          style: {
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#1F2937',
            border: `1px solid ${isDark ? '#991B1B' : '#FEE2E2'}`,
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '⚠️',
        });
        return;
      }

      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading(t('Updating profile...'), {
      style: {
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#FFFFFF' : '#1F2937',
        border: `1px solid ${isDark ? '#1E40AF' : '#DBEAFE'}`,
        padding: '16px',
        borderRadius: '12px',
      },
    });

    try {
      const updatedData = {
        token,
        name: formData.name?.trim(),
        profileImage,
        bio: formData.bio?.trim(),
        country: formData.country?.trim(),
        specialization: formData.specialization?.trim(),
      };

      await updateProfile(updatedData).unwrap();
      const { data } = await refetch();
      
      if (data) {
        const profileImageUrl = data.profileImage ? `${data.profileImage}?${Date.now()}` : null;
        dispatch(setCredentials({ user: { ...data, profileImage: profileImageUrl }, token }));
      }

      toast.dismiss(loadingToast);
      toast.success(t('Profile updated successfully!'), {
        duration: 5000,
        style: {
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${isDark ? '#065F46' : '#D1FAE5'}`,
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '✅',
      });

      setEditMode(false);
      setProfileImage(null);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t('Failed to update profile. Please try again.'), {
        duration: 5000,
        style: {
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${isDark ? '#991B1B' : '#FEE2E2'}`,
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '❌',
      });
    }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen flex items-center justify-center px-4 mt-22 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
              <h2 className={`text-2xl font-bold mb-2 text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userData?.name || t('Name')}</h2>
              <p className={`mb-2 text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{userData?.bio}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{userData?.email}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Country')}: {userData?.country || t('Not specified')}</p>
              <p className={`mb-4 text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('Specialty')}: {userData?.specialization || t('Not specified')}</p>
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
                value={formData.name}
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
                value={formData.email}
                readOnly
                tabIndex="-1"
                className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed opacity-70 ${
                  isDark ? 'bg-gray-700/50 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}
              />
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Bio')}</label>
              </div>
              <textarea
                name="bio"
                value={formData.bio}
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
                value={formData.country}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex items-center gap-2 mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Specialty')}</label>
              </div>
              <input
                name="specialization"
                value={formData.specialization}
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