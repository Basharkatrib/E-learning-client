import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import { useSelector } from 'react-redux'
import { Autoplay } from 'swiper/modules'
import { selectTheme } from '../../redux/features/themeSlice'
import { useGetCategoriesQuery } from '../../redux/features/apiSlice'
import { Link, useNavigate } from 'react-router-dom'



const Slider = () => {
  const theme = useSelector(selectTheme)
  const { data, isLoading, isError, error } = useGetCategoriesQuery();
  const categories = data?.data || [];
  const navigate = useNavigate();

  const allChildren = categories.flatMap(cat => Array.isArray(cat.children) ? cat.children : []);

  const handleCategoryClick = (cat) => {
    const catName = cat.name?.en || cat.name?.ar || cat.name;
    navigate(`/courses?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className={` py-4`}>
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

        <div className="overflow-x-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={9}
            slidesPerView={3}
            loop={false}
            speed={2000}
            centeredSlides={false}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              reverseDirection: true,
            }}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 }, 
              1024: { slidesPerView: 6 }, 
              1536: { slidesPerView: 8 },
            }}
            className="py-8 flex-nowrap"
            style={{flexWrap: 'nowrap'}}
          >
            {isLoading ? (
              <SwiperSlide><div className="text-center text-gray-400">Loading...</div></SwiperSlide>
            ) : isError ? (
              <SwiperSlide><div className="text-center text-red-500 font-semibold">حدث خطأ أثناء تحميل التصنيفات</div></SwiperSlide>
            ) : allChildren.map((child) => (
              <SwiperSlide key={child.id} className="flex items-center justify-center">
                <div className="flex items-center justify-center group relative transition-all duration-300 hover:scale-110">
                  <div
                    className={`w-20 h-20 text-center rounded-full font-bold text-lg flex items-center justify-center transition-all duration-300 cursor-pointer
                      ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : ' text-black group-hover:text-primary'}`}
                    onClick={() => handleCategoryClick(child)}
                  >
                    {child.name?.en || child.name?.ar || child.name}
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
