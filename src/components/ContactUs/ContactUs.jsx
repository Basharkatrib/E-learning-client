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

  const inputClasses = `w-full mt-3 rounded-sm p-4 border focus:outline-none focus:ring-2 focus:ring-primary ${
    isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'
  }`;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`w-full mt-14 pt-16 pb-14 px-4 sm:px-6 lg:px-8 flex flex-col justify-around items-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className='p-3 flex flex-col lg:flex-row justify-around items-center gap-8 text-center lg:text-left'>
        <h1 className='text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent'>{t('Contact Us')}</h1>
        <div className='w-full lg:w-1/2'>
          <p>{t('We\'re always happy to hear from you! Whether you have a question, need support, or simply want to share your feedback, our team is here and ready to help. Please don\'t hesitate to get in touch — we\'ll do our best to respond as quickly and efficiently as possible.')}</p>
        </div>
      </div>

      <hr className={`w-full my-8 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`} />

      <div className={`w-full flex flex-col lg:flex-row justify-between items-center gap-12 container mt-4 p-6 md:p-12 drop-shadow-lg rounded-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <form onSubmit={handleSubmit} className='w-full lg:w-2/3'>
          <div className='flex flex-col items-center gap-10'>
            <div className='w-full flex flex-col gap-5'>
              <div className='flex flex-col md:flex-row gap-5'>
                <div className='w-full'>
                  <h3>{t('First Name')} *</h3>
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
                  <h3>{t('Last Name')} *</h3>
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
                  <h3>{t('Email')} *</h3>
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
                  <h3>{t('Phone')}</h3>
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
                <h3>{t('Subject')} *</h3>
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
                <h3>{t('Message')} *</h3>
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
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`bg-primary text-white px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
              }`}
            >
              {isLoading ? t('Sending...') : t('Send Your Message')}
            </motion.button>
          </div>
        </form>

        <div className='w-full lg:w-1/3 flex flex-col items-center gap-6'>
          {contactIcons.map((item, index) => (
            <div key={index} className='flex flex-col items-center gap-3'>
              <motion.a href="#" whileHover={{ scale: 1.2 }}>
                <div className='w-10 h-10 rounded-full flex items-center justify-center'>
                  <img src={item.icon} alt="icon" />
                </div>
              </motion.a>
              <h3 className='text-center'>{t(item.text)}</h3>
            </div>
          ))}

          <div className='flex flex-col items-center gap-2'>
            <div className='flex gap-4'>
              {socialIcons.map((icon, i) => (
                <motion.a key={i} href="#" whileHover={{ scale: 1.2 }}>
                  <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                    <img src={icon} alt="social" />
                  </div>
                </motion.a>
              ))}
            </div>
            <h3>{t('Social Profiles')}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
