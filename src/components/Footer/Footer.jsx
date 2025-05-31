import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { toggleLanguage, selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';


import email from '../../assets/images/footer/email.svg';
import facebook from '../../assets/images/footer/facebook.svg';
import twitter from '../../assets/images/footer/Twitter.svg';
import linkedin from '../../assets/images/footer/linkedin.svg';
import phone from '../../assets/images/footer/phone.svg';
import location from '../../assets/images/footer/location.svg';
import logo from '../../assets/images/footer/logo.svg';

// Dark mode icons
import email_w from '../../assets/images/footer-white/email_w.svg';
import facebook_w from '../../assets/images/footer-white/facebook_w.svg';
import linked_w from '../../assets/images/footer-white/linked_w.svg';
import location_w from '../../assets/images/footer-white/location_w.svg';
import twitter_w from '../../assets/images/footer-white/twitter_w.svg';
import phone_w from '../../assets/images/footer-white/phone_w.svg';

import { motion } from 'framer-motion';

function Footer() {
  const theme = useSelector(selectTheme);
  const { t } = useTranslation();
  const lang = useSelector(selectTranslate);



  const navigation = {
    home: [
      { name: 'Benefits', href: '#' },
      { name: 'Our Courses', href: '#' },
      { name: 'Our Testimonials', href: '#' },
      { name: 'Our FAQ', href: '#' },
    ],
    about: [
      { name: 'Company', href: '#' },
      { name: 'Achievements', href: '#' },
      { name: 'Our Goals', href: '#' },
    ],
    social: [
      {
        name: 'Facebook',
        iconLight: facebook,
        iconDark: facebook_w,
        href: '#',
        color: 'hover:bg-blue-500',
      },
      {
        name: 'Twitter',
        iconLight: twitter,
        iconDark: twitter_w,
        href: '#',
        color: 'hover:bg-sky-500',
      },
      {
        name: 'LinkedIn',
        iconLight: linkedin,
        iconDark: linked_w,
        href: '#',
        color: 'hover:bg-blue-700',
      },
    ],
  };

  return (
    <footer
    dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      } border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 flex flex-col gap-6 items-start">
            <img src={logo} alt="SkillForge" className="h-10 w-auto" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <img src={theme === 'dark' ? email_w : email} alt="email" className="w-5 h-5" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  hello@skillforge.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img src={theme === 'dark' ? phone_w : phone} alt="phone" className="w-5 h-5" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  +91 9983 23 2009
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img src={theme === 'dark' ? location_w : location} alt="location" className="w-5 h-5" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('Somewhere in the World')}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('Home')}
            </h3>
            <ul className="space-y-3">
              {navigation.home.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`text-sm hover:text-primary transition-colors duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t(item.name)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('About Us')}
            </h3>
            <ul className="space-y-3">
              {navigation.about.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`text-sm hover:text-primary transition-colors duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t(item.name)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className={`text-sm font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('Social Profiles')}
            </h3>
            <div className="flex flex-col gap-4">
              {navigation.social.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-3 group ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 group-hover:bg-gray-700'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    } ${item.color}`}
                  >
                    <img
                      src={theme === 'dark' ? item.iconDark : item.iconLight}
                      alt={item.name}
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="text-sm group-hover:text-primary transition-colors duration-200">
                    {t(item.name)}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('© 2023 SkillForge. All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
