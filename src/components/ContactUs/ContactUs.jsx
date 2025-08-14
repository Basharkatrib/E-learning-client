import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useTranslation } from 'react-i18next';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useAddContactMutation } from '../../redux/features/apiSlice';
import { toast } from 'react-hot-toast';
import email from '../../assets/images/footer/email.svg';
import phone from '../../assets/images/ContactUs/phone.svg';
import facebook from '../../assets/images/ContactUs/facebook.svg';
import linked from '../../assets/images/ContactUs/linkind.svg';
import location from '../../assets/images/ContactUs/location.svg';
import twitter from '../../assets/images/ContactUs/twiter.svg';
import email_w from '../../assets/images/footer-white/email_w.svg';
import phone_w from '../../assets/images/footer-white/phone_w.svg';
import facebook_w from '../../assets/images/footer-white/facebook_w.svg';
import linked_w from '../../assets/images/footer-white/linked_w.svg';
import location_w from '../../assets/images/footer-white/location_w.svg';
import twitter_w from '../../assets/images/footer-white/twitter_w.svg';

const ContactUs = () => {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();
  const token = useSelector(state => state.auth.token);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [addContact, { isLoading }] = useAddContactMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
    return requiredFields.every(field => formData[field].trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error(t('Please fill in all required fields'), {
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

    try {
      const loadingToast = toast.loading(t('Sending message...'), {
        style: {
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#1F2937',
          border: `1px solid ${isDark ? '#1E40AF' : '#DBEAFE'}`,
          padding: '16px',
          borderRadius: '12px',
        },
      });

      await addContact({
        token,
        ...formData
      }).unwrap();

      toast.dismiss(loadingToast);
      toast.success(t('Message sent successfully!'), {
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

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (err) {
      toast.error(t('Failed to send message. Please try again.'), {
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

  const contactIcons = [
    { icon: isDark ? email_w : email, text: 'support@skillbridge.com' },
    { icon: isDark ? phone_w : phone, text: '+91 00000 00000' },
    { icon: isDark ? location_w : location, text: 'Some Where in the World' }
  ];

  const socialIcons = [
    isDark ? facebook_w : facebook,
    isDark ? twitter_w : twitter,
    isDark ? linked_w : linked
  ];

  const inputClasses = `w-full mt-2 rounded-xl p-4 border transition-shadow focus:outline-none focus:ring-4 ${
    isDark
      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-primary/20'
      : 'bg-white border-gray-200 text-black focus:ring-primary/30'
  }`;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`relative w-full mt-14 pt-16 pb-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-white via-gray-50 to-white text-black'}`}>
      <div className='p-3 flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left max-w-6xl mx-auto'>
        <h1 className='text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent'>
          {t('Contact Us')}
        </h1>
        <div className='w-full lg:w-2/3'>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t("We're always happy to hear from you! Whether you have a question, need support, or simply want to share your feedback, our team is here and ready to help. Please don't hesitate to get in touch — we'll do our best to respond as quickly and efficiently as possible.")}</p>
        </div>
      </div>

      <hr className={`w-full my-8 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`} />

      <div className={`w-full max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-8 mt-8 p-6 md:p-10 rounded-2xl backdrop-blur shadow-xl ring-1 ${isDark ? 'bg-gray-900/70 text-white ring-white/10' : 'bg-white/90 text-black ring-black/5'}`}>
        <form onSubmit={handleSubmit} className='w-full lg:w-2/3'>
          <div className='flex flex-col items-center gap-10'>
            <div className='w-full flex flex-col gap-5'>
              <div className='flex flex-col md:flex-row gap-5'>
                <div className='w-full'>
                  <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('First Name')} *</h3>
                  <input
                    type='text'
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('Enter First Name')}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className='w-full'>
                  <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('Last Name')} *</h3>
                  <input
                    type='text'
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('Enter Last Name')}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div className='flex flex-col md:flex-row gap-5'>
                <div className='w-full'>
                  <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('Email')} *</h3>
                  <input
                    type='email'
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('Enter Your Email')}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className='w-full'>
                  <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('Phone')}</h3>
                  <input
                    type='text'
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('Enter Your Phone')}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('Subject')} *</h3>
                <input
                  type='text'
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder={t('Enter Your Subject')}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <h3 className='text-sm text-gray-600 dark:text-gray-300'>{t('Message')} *</h3>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('Enter Your Message')}
                  className={`${inputClasses} h-32 resize-none`}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                isDark ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 text-white'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('Sending...') : t('Send Your Message')}
            </motion.button>
          </div>
        </form>

        <div className='w-full lg:w-1/3 flex flex-col items-stretch gap-6'>
          {contactIcons.map((item, index) => (
            <div key={index} className={`flex items-center gap-4 rounded-xl px-4 py-3 w-full ${isDark ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary/10' : 'bg-primary/10'} ring-1 ${isDark ? 'ring-white/10' : 'ring-primary/10'}`}>
                <img src={item.icon} alt="icon" className='w-6 h-6' />
              </div>
              <h3 className={`text-sm md:text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t(item.text)}</h3>
            </div>
          ))}

          <div className='flex flex-col items-start gap-3'>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('Social Profiles')}</h3>
            <div className='flex gap-3'>
              {socialIcons.map((icon, i) => (
                <motion.a key={i} href="#" whileHover={{ scale: 1.08 }} className={`rounded-xl p-2 ${isDark ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                  <img src={icon} alt="social" className='w-5 h-5' />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;