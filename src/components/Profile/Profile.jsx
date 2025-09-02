import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import { setCredentials } from '../../redux/features/authSlice';
import { updateUser } from '../../redux/features/authSlice';
import profilePic from '../../assets/images/navbar/profilepic.jpg';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import coverImg from '../../assets/images/navbar/logo.png';
import { useUpdateProfileMutation, useGetCurrentUserQuery,useRemoveProfileImageMutation } from '../../redux/features/apiSlice';
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
  const [removeProfileImage] = useRemoveProfileImageMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    bio: '',
    country: '', 
    specialization: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        phoneNumber: userData.phone_number || '',
        email: userData.email || '',
        bio: userData.bio || '',
        country: userData.country || '',
        specialization: userData.specialization || '',
      });
      console.log(userData);
    } else if (currentUser) {
      setFormData({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        phoneNumber: currentUser.phone_number || '',
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
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        phoneNumber: formData.phoneNumber?.trim(),
        profileImage,
        bio: formData.bio?.trim(),
        country: formData.country?.trim(),
        specialization: formData.specialization?.trim(),
      };

      const response = await updateProfile(updatedData).unwrap();
      
      // Update user data with the response from backend
      if (response.user) {
        const updatedUser = {
          id: response.user.userId,
          name: `${response.user.userName.firstName} ${response.user.userName.lastName}`,
          firstName: response.user.userName.firstName,
          lastName: response.user.userName.lastName,
          phoneNumber: response.user.phoneNumber,
          profile_image: response.user.userProfileImage,
          specialization: response.user.userSpecialization,
          bio: response.user.userBio,
          country: response.user.userCountry,
          email: currentUser.email, // Keep existing email
        };
        
        dispatch(setCredentials({ user: updatedUser, token }));
      }

      // Refetch current user data immediately after successful update
      await refetch();

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
      console.error('Profile update error:', err);
      
      let errorMessage = t('Failed to update profile. Please try again.');
      
      if (err?.data?.errors) {
        // Handle Laravel validation errors
        const errors = err.data.errors;
        if (errors.firstName) {
          errorMessage = errors.firstName[0];
        } else if (errors.lastName) {
          errorMessage = errors.lastName[0];
        } else if (errors.phoneNumber) {
          errorMessage = errors.phoneNumber[0];
        } else if (errors.profile_image) {
          errorMessage = errors.profile_image[0];
        } else if (errors.bio) {
          errorMessage = errors.bio[0];
        } else if (errors.country) {
          errorMessage = errors.country[0];
        } else if (errors.specialization) {
          errorMessage = errors.specialization[0];
        } else if (err.data.message) {
          errorMessage = err.data.message;
        }
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      }
      
      toast.error(errorMessage, {
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
const handleRemoveImage = async () => {
  // الحالة 1: صورة محلية فقط (قبل الحفظ)
  if (profileImage && !userData?.profile_image) {
    setProfileImage(null);
    toast.success(t('Local image removed successfully!'), {
      duration: 3000,
      style: {
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#FFFFFF' : '#1F2937',
        border: `1px solid ${isDark ? '#065F46' : '#D1FAE5'}`,
        padding: '16px',
        borderRadius: '12px',
      },
      icon: '🗑️',
    });
    return;
  }

  // الحالة 2: صورة محفوظة في السيرفر
  if (userData?.profile_image) {
    try {
      await removeProfileImage(token).unwrap();
      setProfileImage(null);
      dispatch(updateUser({ profile_image: null }));
      await refetch();

      toast.success(t('Profile image removed successfully!'), {
        duration: 4000,
        style: {
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${isDark ? '#065F46' : '#D1FAE5'}`,
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '🗑️',
      });
    } catch (err) {
      console.error('Remove image error:', err);
      toast.error(t('Failed to remove profile image'), {
        duration: 4000,
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
    return;
  }

  // الحالة 3: لا صورة أصلًا (افتراضية فقط)
  toast.error(t('No profile image to remove'), {
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
};


  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen flex items-center justify-center px-4 mt-22 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full md:max-w-4xl rounded-2xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        {/* Cover Photo */}
        <div className={`relative h-40 md:h-44 w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <img src={coverImg} alt="cover" className="h-24 md:h-32 object-contain" />
        </div>
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-0">
          {/* Left: User Info */}
          <div className={`lg:w-2/5 flex flex-col items-center lg:items-start px-6 pt-16 pb-8 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
           <div className={`absolute top-2 lg:-top-16 left-1/2 ${lang === 'ar' ? 'lg:right-12' : 'lg:left-12'} transform -translate-x-1/2 lg:translate-x-0 z-10`}>
  <div className="relative">
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
    {editMode && (profileImage || userData?.profile_image) && (
  <button
    type="button"
    onClick={handleRemoveImage}
    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
  >
    ✕
  </button>
  )}
  </div>
</div>

            <div className="mt-20 lg:mt-16 w-full">
              <h2 className={`text-2xl font-bold mb-3 text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {userData?.first_name && userData?.last_name 
                  ? `${userData.first_name} ${userData.last_name}` 
                  : userData?.first_name || userData?.last_name || t('Name')
                }
              </h2>
              
              {userData?.bio && (
                <p className={`mb-4 text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{userData.bio}</p>
              )}
              
              <div className={`space-y-3 mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{userData?.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t('First Name')}: {userData?.first_name || t('Not specified')}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t('Last Name')}: {userData?.last_name || t('Not specified')}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{t('Phone Number')}: {userData?.phone_number || t('Not specified')}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('Country')}: {userData?.country || t('Not specified')}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span>{t('Specialty')}: {userData?.specialization || t('Not specified')}</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEdit}
                className={`px-6 py-3 rounded-full transition-colors duration-200 shadow-md font-semibold text-base mt-4 w-full lg:w-auto ${editMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
              >
                {editMode ? t('Cancel') : t('Edit Profile')}
              </motion.button>
            </div>
          </div>
          
          <div className={`hidden lg:block w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} my-8`}></div>
          
          <div className={`lg:w-3/5 flex items-center justify-center md:px-6 py-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <form onSubmit={handleSubmit} className={`w-full max-w-2xl space-y-6 rounded-xl shadow-md p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              
              <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editMode ? t('Edit Profile Information') : t('Profile Information')}
              </h3>
              
              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('Profile Picture')}
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${theme === 'dark'
                    ? 'border-gray-600 hover:border-primary bg-gray-700/50'
                    : 'border-gray-300 hover:border-primary bg-gray-50'
                  } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => {
                    if (editMode) {
                      document.getElementById('profile-image-input').click();
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-input"
                    onChange={handleImageChange}
                  />
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {editMode ? t('Click to upload new profile picture') : t('Profile picture upload disabled')}
                  </p>
                </div>
              </div>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('First Name')}</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder={t('Enter your first name')}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Last Name')}</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder={t('Enter your last name')}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Email')}</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    tabIndex="-1"
                    className={`w-full px-4 py-3 rounded-lg border cursor-not-allowed opacity-70 ${
                      isDark ? 'bg-gray-700/50 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Phone Number')}</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder={t('Enter your phone number')}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Country')}</label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder={t('Enter your country')}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Specialty')}</label>
                <input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder={t('Enter your specialty')}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('Bio')}</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows={4}
                  placeholder={t('Tell us about yourself...')}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              {editMode && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-3 mt-6 shadow-lg font-semibold text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('Saving Changes...')}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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