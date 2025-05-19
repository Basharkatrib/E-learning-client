import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { selectTheme } from '../../redux/features/themeSlice'
import email from '../../assets/images/ContactUs/email.svg'
import phone from '../../assets/images/ContactUs/phone.svg'
import facebook from '../../assets/images/ContactUs/facebook.svg'
import linked from '../../assets/images/ContactUs/linkind.svg'
import location from '../../assets/images/ContactUs/location.svg'
import twiter from '../../assets/images/ContactUs/twiter.svg'

const ContactUs = () => {
    const theme = useSelector(selectTheme)
    const isDark = theme === 'dark'

    return (
        <div className={`w-full mt-15 px-10 py-12 flex flex-col justify-around items-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
            {/* Section 1 */}
            <div className='p-3 flex flex-col lg:flex-row justify-around items-center gap-8 text-center lg:text-left'>
                <h1 className='text-3xl md:text-4xl font-black'>Contact Us</h1>
                <div className='w-full lg:w-1/2'>
                    <p>
                        Welcome to SkillBridge's Pricing Plan page, where we offer two comprehensive options to cater to your needs: Free and Pro. We believe in providing flexible and affordable pricing options for our services. Whether you're an individual looking to enhance your skills or a business seeking professional development solutions, we have a plan that suits you. Explore our pricing options below and choose the one that best fits your requirements.
                    </p>
                </div>
            </div>

            <hr className={`w-full my-8 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`} />

            {/* Contact Section */}
            <div className={`w-full flex flex-col lg:flex-row justify-between items-center gap-12 container mt-4 p-6 md:p-12 drop-shadow-lg rounded-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                {/* Form Section */}
                <div className='w-full lg:w-2/3'>
                    <div className='flex flex-col items-center gap-10'>
                        <div className='w-full flex flex-col gap-5'>
                            <div className='flex flex-col md:flex-row gap-5'>
                                <div className='w-full'>
                                    <h3>First Name</h3>
                                    <input type='text' placeholder='Enter First Name'
                                        className={`w-full mt-3 rounded-sm p-4  focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                                </div>
                                <div className='w-full'>
                                    <h3>Last Name</h3>
                                    <input type='text' placeholder='Enter Last Name'
                                        className={`w-full mt-3 rounded-sm p-4  focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                                </div>
                            </div>

                            <div className='flex flex-col md:flex-row gap-5'>
                                <div className='w-full'>
                                    <h3>Email</h3>
                                    <input type='email' placeholder='Enter Your Email'
                                        className={`w-full mt-3 rounded-sm p-4 focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                                </div>
                                <div className='w-full'>
                                    <h3>Phone</h3>
                                    <input type='text' placeholder='Enter Your Phone'
                                        className={`w-full mt-3 rounded-sm p-4  focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                                </div>
                            </div>

                            <div>
                                <h3>Subject</h3>
                                <input type='text' placeholder='Enter Your Subject'
                                    className={`w-full mt-3 rounded-sm p-4  focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                            </div>
                            <div>
                                <h3>Message</h3>
                                <textarea placeholder='Enter Your Message'
                                    className={`w-full mt-3 rounded-sm p-4 h-32 resize-none  focus:border-primary ${isDark ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-black'}`} />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                        >
                            Send Your Message
                        </motion.button>
                    </div>
                </div>

                {/* Contact Info Section */}
                <div className='w-full lg:w-1/3 flex flex-col items-center gap-6'>
                    {[{ icon: email, text: 'support@skillbridge.com' },
                    { icon: phone, text: '+91 00000 00000' },
                    { icon: location, text: 'Some Where in the World' }].map((item, index) => (
                        <div key={index} className='flex flex-col items-center gap-3'>
                            <motion.a href="#" whileHover={{ x: 5 }}>
                                <div className='w-10 h-10 rounded-full flex items-center justify-center'>
                                    <img src={item.icon} alt="" />
                                </div>
                            </motion.a>
                            <h3 className='text-center'>{item.text}</h3>
                        </div>
                    ))}

                    {/* Social */}
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex gap-4'>
                            {[facebook, twiter, linked].map((icon, i) => (
                                <motion.a key={i} href="#" whileHover={{ x: 5 }}>
                                    <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                                        <img src={icon} alt="" />
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                        <h3>Social Profiles</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
