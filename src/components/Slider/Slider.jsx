import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import { useSelector } from 'react-redux'
import { Autoplay } from 'swiper/modules'
import { selectTheme } from '../../redux/features/themeSlice'

import brand_w_1 from '../../assets/images/slider-white/brand-1.svg';
import brand_w_2 from '../../assets/images/slider-white/brand-2.svg';
import brand_w_3 from '../../assets/images/slider-white/brand-3.svg';
import brand_w_4 from '../../assets/images/slider-white/brand-4.svg';
import brand_w_5 from '../../assets/images/slider-white/brand-5.svg';
import brand_w_6 from '../../assets/images/slider-white/brand-6.svg';
import brand_w_7 from '../../assets/images/slider-white/brand-7.svg';

import brand_b_1 from '../../assets/images/slider/brand-1.svg';
import brand_b_2 from '../../assets/images/slider/brand-2.svg';
import brand_b_3 from '../../assets/images/slider/brand-3.svg';
import brand_b_4 from '../../assets/images/slider/brand-4.svg';
import brand_b_5 from '../../assets/images/slider/brand-5.svg';
import brand_b_6 from '../../assets/images/slider/brand-6.svg';
import brand_b_7 from '../../assets/images/slider/brand-7.svg';

const Slider = () => {
  const theme = useSelector(selectTheme)

  const partners = [
    { id: 1, imageLight: brand_b_1, imageDark: brand_w_1, name: 'Microsoft' },
    { id: 2, imageLight: brand_b_2, imageDark: brand_w_2, name: 'Google' },
    { id: 3, imageLight: brand_b_3, imageDark: brand_w_3, name: 'Apple' },
    { id: 4, imageLight: brand_b_4, imageDark: brand_w_4, name: 'Amazon' },
    { id: 5, imageLight: brand_b_5, imageDark: brand_w_5, name: 'Meta' },
    { id: 6, imageLight: brand_b_6, imageDark: brand_w_6, name: 'IBM' },
    { id: 7, imageLight: brand_b_7, imageDark: brand_w_7, name: 'Oracle' },
    { id: 8, imageLight: brand_b_1, imageDark: brand_w_1, name: 'Microsoft' },
    { id: 9, imageLight: brand_b_2, imageDark: brand_w_2, name: 'Google' },
    { id: 10, imageLight: brand_b_3, imageDark: brand_w_3, name: 'Apple' },
  ];

  return (
    <div className={` py-12`}>
      <div className="relative">
        <div className={`absolute left-0 top-0 bottom-0 w-14 md:w-32 bg-gradient-to-r ${
          theme === 'dark' 
          ? 'from-gray-900' 
          : 'from-white'
        } to-transparent z-10`} />
        <div className={`absolute right-0 top-0 bottom-0 w-14 md:w-32 bg-gradient-to-l ${
          theme === 'dark' 
          ? 'from-gray-900' 
          : 'from-white'
        } to-transparent z-10`} />

        <div className="overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={50}
            slidesPerView={3}
            loop={true}
            speed={3000}
            centeredSlides={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              reverseDirection: false,
            }}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
            className="py-8"
          >
            {partners.map((partner) => (
              <SwiperSlide key={partner.id} className="flex items-center justify-center">
                <div className="flex items-center justify-center group relative transition-all duration-300 hover:scale-110">
                  <img 
                    src={theme === 'dark' ? partner.imageDark : partner.imageLight}
                    alt={partner.name}
                    className="h-[35px] md:h-12 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={`text-sm whitespace-nowrap ${
                      theme === 'dark' 
                      ? 'text-gray-400' 
                      : 'text-gray-600'
                    }`}>
                      {partner.name}
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

export default Slider
