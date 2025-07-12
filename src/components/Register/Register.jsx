import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useTranslation } from 'react-i18next';
import {useRegisterMutation,useResendVerificationMutation} from '../../redux/features/apiSlice';
import { setEmail, selectEmail } from '../../redux/features/authSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const theme = useSelector(selectTheme);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const dispatch = useDispatch();
  const email = useSelector(selectEmail);
   const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('File size should not exceed 10MB'));
        return;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(t('Invalid file type. Please upload PDF, JPG, JPEG, or PNG'));
        return;
      }
      setCertificate(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setCertificatePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setCertificatePreview(null);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(t('Invalid image type. Only JPG and PNG allowed.'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('Image size should not exceed 5MB.'));
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required(t('Full name is required')),
      email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
      password: Yup.string().min(6, t('Password must be at least 6 characters')).required(t('Password is required')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], t('Passwords must match'))
        .required(t('Please confirm your password')),
      terms: Yup.boolean().oneOf([true], t('You must accept the terms and privacy policy'))
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('name', values.fullName);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('password_confirmation', values.confirmPassword);
        if (avatar) formData.append('avatar', avatar);
        if (isTeacher && certificate) formData.append('certificate', certificate);

        await registerUser(formData).unwrap();

        dispatch(setEmail(values.email));
        toast.success(t('Registration successful. Please check your email.'));
        setShowResend(true);
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        toast.error(err?.data?.message || t('Registration failed. Please try again.'));
      }
    }
  });

  const handleResend = async () => {
    try {
      await resendVerification(email).unwrap();
      toast.success(t('Verification email has been resent.'));
    } catch (err) {
      toast.error(err?.data?.message || t('Failed to resend verification email.'));
    }
  };
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-white via-gray-100 to-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl p-8 mt-20 md:p-10 bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white">{t('Sign Up')}</h2>

        {/* صورة المستخدم */}
        <div className="flex flex-col items-center space-y-3 mt-6 mb-6">
          <label className="text-sm text-gray-800 dark:text-white/90">{lang==='en'?'Upload Profile Picture':'تحميل صورة الملف الشخصي'}</label>
          <div className="relative">
            <img
              src={avatarPreview || "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg"}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
            />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v11.586A2 2 0 004.586 18H16a2 2 0 002-2V5a2 2 0 00-2-2H4zm5 5a3 3 0 116 0 3 3 0 01-6 0zM4 16a6 6 0 1112 0H4z" />
              </svg>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        {/* نوع المستخدم */}
        <div className="flex gap-4 mb-6 bg-white/20 dark:bg-white/10 p-2 rounded-xl">
          <button
            onClick={() => setIsTeacher(false)}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition duration-300 ${
              !isTeacher
                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                : 'bg-white text-black'
            }`}
          >
            {t('Student')}
          </button>
          <button
            onClick={() => setIsTeacher(true)}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition duration-300 ${
              isTeacher
                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                : 'bg-white text-black'
            }`}
          >
            {t('Teacher')}
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <input type="text" name="fullName" placeholder={t("Full Name")} onChange={formik.handleChange} value={formik.values.fullName} className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500" />
          <input type="email" name="email" placeholder={t("Email")} onChange={formik.handleChange} value={formik.values.email} className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500" />
          {isTeacher && (
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertificateChange} className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800" />
          )}
          <input type={showPassword ? 'text' : 'password'} name="password" placeholder={t("Password")} onChange={formik.handleChange} value={formik.values.password} className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500" />
          <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder={t("Confirm Password")} onChange={formik.handleChange} value={formik.values.confirmPassword} className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500" />

          <div className={`flex items-center text-sm ${
      theme === 'dark'
        ? 'text-white'
        : 'text-black'
          }`}>
            <input type="checkbox" name="terms" checked={formik.values.terms} onChange={formik.handleChange} className="mr-2" />
            {t('I agree with')} <Link to="/terms" className="underline mx-1">{t('Terms of Use')}</Link> {t('and')} <Link to="/privacy" className="underline mx-1">{t('Privacy Policy')}</Link>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
            {isLoading ? t('Signing Up...') : t('Sign Up')}
          </button>

          {showResend && (
            <button type="button" onClick={handleResend} disabled={isResending} className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 mt-2">
              {isResending ? t('Resending...') : t('Resend Verification Link')}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export default Register;
