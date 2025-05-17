import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import per1 from '../../assets/images/testimonials/image-1.png';
import per2 from '../../assets/images/testimonials/image-2.png';
import per3 from '../../assets/images/testimonials/image-3.png';

const testimonials = [
  { id: 1, name: "Sarah L.", avatar: per1, text: "The web design course provided a solid foundation for me...", role: "Web Developer" },
  { id: 2, name: "John M.", avatar: per2, text: "The course content was comprehensive...", role: "UX Designer" },
  { id: 3, name: "Emily R.", avatar: per3, text: "This platform has transformed my learning experience...", role: "Frontend Developer" }
];

function ResetPassword() {
  const theme = useSelector(selectTheme);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pt-16 pb-8 flex items-center justify-center mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row gap-8 items-center lg:items-start">
          <div className="w-full lg:w-1/2 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Students Testimonials</h2>
              <p className={`text-base mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Hear what our students say about their learning experience with us</p>
            </motion.div>
            <div className="relative">
              <Swiper modules={[Navigation, Autoplay, Pagination]} spaceBetween={30} slidesPerView={1}
                navigation={{ prevEl: '.custom-prev', nextEl: '.custom-next' }}
                pagination={{ el: '.custom-pagination', clickable: true, bulletClass: `swiper-pagination-bullet ${theme==='dark'?'dark':''}`, bulletActiveClass: 'swiper-pagination-bullet-active' }}
                autoplay={{ delay: 5000, disableOnInteraction: false }} className="testimonials-swiper pb-12">
                {testimonials.map(item => (
                  <SwiperSlide key={item.id}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                      className={`p-6 rounded-xl ${theme==='dark'?'bg-gray-800/50 backdrop-blur-sm':'bg-white/80 backdrop-blur-sm shadow-lg'}`}> 
                      <div className="flex items-center gap-4 mb-4">
                        <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                        <div>
                          <h4 className={`font-semibold ${theme==='dark'?'text-white':'text-gray-900'}`}>{item.name}</h4>
                          <p className={`text-sm ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{item.role}</p>
                        </div>
                      </div>
                      <p className={`text-base italic ${theme==='dark'?'text-gray-300':'text-gray-600'}`}>"{item.text}"</p>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="flex justify-center gap-4 mt-4">
                <button className={`custom-prev w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme==='dark'?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-white hover:bg-gray-100 text-gray-600 shadow-md'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </button>
                <button className={`custom-next w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme==='dark'?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-white hover:bg-gray-100 text-gray-600 shadow-md'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                </button>
              </div>
              <div className="custom-pagination flex justify-center gap-2 mt-4"></div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-4 lg:p-8 rounded-2xl ${theme==='dark'?'bg-gray-800':'bg-white shadow-xl'}`}> 
              <h2 className={`text-2xl font-bold text-center mb-2 ${theme==='dark'?'text-white':'text-gray-900'}`}>Reset Password</h2>
              <p className={`text-center mb-6 ${theme==='dark'?'text-gray-400':'text-gray-600'}`}>Set a new password for your account</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme==='dark'?'text-gray-300':'text-gray-700'}`}>New Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New Password"
                    className={`w-full px-4 py-2 rounded-lg border ${theme==='dark'?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-transparent`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme==='dark'?'text-gray-300':'text-gray-700'}`}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm Password"
                    className={`w-full px-4 py-2 rounded-lg border ${theme==='dark'?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-transparent`} required />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">Confirm Change</button>
                <p className={`text-center text-sm ${theme==='dark'?'text-gray-400':'text-gray-600'}`}>Remembered your password? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;