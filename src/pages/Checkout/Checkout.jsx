import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetCourseQuery, useEnrollUserMutation, useCheckPaymentStatusQuery } from '../../redux/features/apiSlice';
import { selectToken, selectCurrentUser } from '../../redux/features/authSlice';
import LoadingPage from '../LoadingPage/LoadingPage';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import CashSyr from '../../assets/images/ViewVideo/SyriatelCash.png'
import CashMtn from '../../assets/images/ViewVideo/MtnCash.png'
export default function Checkout() {
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const { id } = useParams();
    const lang = useSelector(selectTranslate);
    const navigate = useNavigate();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('syriatel');
    const [isProcessing, setIsProcessing] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [enrollUser, { isLoading: isEnrolling }] = useEnrollUserMutation();
    const { data: courseData, error, isLoading } = useGetCourseQuery(id, { refetchOnMountOrArgChange: true });
    const { data: paymentStatus, refetch: refetchPaymentStatus } = useCheckPaymentStatusQuery({ token, courseId: id }, { skip: !token || !id });

    useEffect(() => {
        if (!token) {
            toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            navigate('/login');
            return;
        }

        if (!user) {
            toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            navigate('/login');
            return;
        }

        if (user.role !== 'student') {
            toast.error(lang === 'ar' ? 'فقط الطلاب يمكنهم التسجيل في الدورات' : 'Only students can enroll in courses');
            navigate('/courses');
            return;
        }
    }, [token, user, navigate, lang]);

    const handleEnroll = async () => {
        if (!courseData || courseData.price <= 0) {
            toast.error(lang === 'ar' ? 'هذه الدورة مجانية' : 'This course is free');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await enrollUser({ id, token }).unwrap();
            
            if (response.payment_details) {
                setEnrollmentData(response);
                toast.success(lang === 'ar' ? 'تم إنشاء طلب الدفع بنجاح' : 'Payment request created successfully');
            } else {
                toast.success(lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Enrolled successfully!');
                navigate(`/courses/${id}/videos`);
            }
        } catch (error) {
            if (error?.status === 402 && error?.data?.payment_details) {
                setEnrollmentData(error.data);
                toast.success(lang === 'ar' ? 'تم إنشاء طلب الدفع بنجاح' : 'Payment request created successfully');
            } else {
                toast.error(lang === 'ar' ? 'حدث خطأ أثناء إنشاء طلب الدفع' : 'Error creating payment request');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckPaymentStatus = async () => {
        try {
            await refetchPaymentStatus();
            toast.info(lang === 'ar' ? 'الدفع لا يزال في انتظار التأكيد' : 'Payment is still pending confirmation');
        } catch (error) {
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء التحقق من حالة الدفع' : 'Error checking payment status');
        }
    };

    if (isLoading) return <LoadingPage />;

    if (error || !courseData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <h2 className="text-xl font-semibold text-red-500">
                        {lang === 'ar' ? 'الدورة غير موجودة' : 'Course Not Found'}
                    </h2>
                    <button
                        onClick={() => navigate('/courses')}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {lang === 'ar' ? 'العودة إلى الدورات' : 'Back to Courses'}
                    </button>
                </div>
            </div>
        );
    }

    if (courseData.price <= 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-blue-600 text-blue-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <h2 className="text-xl font-semibold text-blue-500">
                        {lang === 'ar' ? 'هذه الدورة مجانية' : 'This Course is Free'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {lang === 'ar' ? 'يمكنك التسجيل مباشرة من صفحة الدورة' : 'You can enroll directly from the course page'}
                    </p>
                    <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {lang === 'ar' ? 'العودة إلى الدورة' : 'Back to Course'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen mt-22 w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {lang === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
                    </h1>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {lang === 'ar' ? 'اختر طريقة الدفع المفضلة لديك' : 'Choose your preferred payment method'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Course Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}
                    >
                        <h2 className="text-xl font-bold mb-4">{lang === 'ar' ? 'ملخص الدورة' : 'Course Summary'}</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                                    {courseData.thumbnail_url ? (
                                        <img src={courseData.thumbnail_url} alt="course" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{courseData.title?.[lang]}</h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {courseData.teacher?.name || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                        {lang === 'ar' ? 'سعر الدورة:' : 'Course Price:'}
                                    </span>
                                    <span className="font-bold text-lg text-green-600">{courseData.price} {t('SYP')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                        {lang === 'ar' ? 'المدة:' : 'Duration:'}
                                    </span>
                                    <span>{courseData.duration?.[lang]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                        {lang === 'ar' ? 'المستوى:' : 'Level:'}
                                    </span>
                                    <span>{t(courseData.difficulty_level)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}
                    >
                        <h2 className="text-xl font-bold mb-6">{lang === 'ar' ? 'طرق الدفع' : 'Payment Methods'}</h2>

                        {!enrollmentData ? (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                   {/* Syriatel Cash */}
                                  <label className="flex flex-col gap-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer transition-all w-full shadow-md hover:shadow-lg">
  <div className="flex items-center gap-4">
    <input
      type="radio"
      name="paymentMethod"
      value="syriatel"
      checked={selectedPaymentMethod === 'syriatel'}
      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      className="text-primary focus:ring-primary"
    />

    {/* شعار Syriatel */}
    <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg">
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"></div>
      <img
        src={CashSyr}
        alt="Syriatel Cash"
        className="w-10 h-10 object-contain relative z-10"
      />
    </div>

    {/* العنوان */}
    <div>
      <div className="font-bold text-lg">Syriatel Cash</div>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {lang === 'ar' ? 'دفع عبر سيرياتيل كاش' : 'Pay via Syriatel Cash'}
      </div>
    </div>
  </div>

  {/* خطوات الدفع */}
  {selectedPaymentMethod === 'syriatel' && (
    <div className={`mt-2 p-4 rounded-xl text-sm space-y-3 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">📱</div>
        <span>{lang === 'ar' ? 'افتح تطبيق "أقرب إليك"' : 'Open the "Aqrab Elik" app'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">🔑</div>
        <span>{lang === 'ar' ? 'اذهب إلى سيرياتيل كاش وأدخل كلمة المرور' : 'Go to Syriatel Cash and enter your password'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">📞</div>
        <span>{lang === 'ar' ? 'أدخل رقم هاتفك ' : 'Enter your phone number'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">💰</div>
        <span>{lang === 'ar' ? 'أدخل المبلغ المطلوب' : 'Enter the required amount'}</span>
      </div>
    </div>
  )}
</label>

{/* MTN Cash */}
<label className="flex flex-col gap-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer transition-all w-full shadow-md hover:shadow-lg">
  <div className="flex items-center gap-4">
    <input
      type="radio"
      name="paymentMethod"
      value="mtn"
      checked={selectedPaymentMethod === 'mtn'}
      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      className="text-primary focus:ring-primary"
    />

    {/* شعار MTN */}
    <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg">
      <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-md"></div>
      <img
        src={CashMtn}
        alt="MTN Cash"
        className="w-10 h-10 object-contain relative z-10"
      />
    </div>

    {/* العنوان */}
    <div>
      <div className="font-bold text-lg">MTN Cash</div>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {lang === 'ar' ? 'دفع عبر MTN كاش' : 'Pay via MTN Cash'}
      </div>
    </div>
  </div>

  {/* خطوات الدفع */}
  {selectedPaymentMethod === 'mtn' && (
    <div className={`mt-2 p-4 rounded-xl text-sm space-y-3 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">📱</div>
        <span>{lang === 'ar' ? 'افتح تطبيق MTN Cash' : 'Open the MTN Cash app'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">🔑</div>
        <span>{lang === 'ar' ? 'أدخل كلمة المرور الخاصة بك' : 'Enter your password'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">📞</div>
        <span>{lang === 'ar' ? 'أدخل رقم هاتفك ' : 'Enter your phone number'}</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg shadow">💰</div>
        <span>{lang === 'ar' ? 'أدخل المبلغ المطلوب' : 'Enter the required amount'}</span>
      </div>
    </div>
  )}
</label>

                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleEnroll}
                                    disabled={isProcessing || isEnrolling}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                >
                                    {isProcessing || isEnrolling
                                        ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                                        : `${lang === 'ar' ? 'إتمام الدفع' : 'Complete Payment'} - ${courseData.price} ${t('SYP')}`
                                    }
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Payment Instructions */}
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200`}>
                                    <h3 className="font-bold text-lg mb-3 text-blue-600">
                                        {lang === 'ar' ? 'تعليمات الدفع' : 'Payment Instructions'}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>{lang === 'ar' ? '1. قم بمسح رمز QR أدناه باستخدام تطبيق' : '1. Scan the QR code below using'} {selectedPaymentMethod === 'syriatel' ? 'Syriatel Cash' : 'MTN Cash'}</p>
                                        <p>{lang === 'ar' ? '2. تأكد من إرسال المبلغ الصحيح:' : '2. Make sure to send the correct amount:'} <span className="font-bold text-green-600">{courseData.price} {t('SYP')}</span></p>
                                        <p>{lang === 'ar' ? '3. احتفظ بإيصال الدفع كدليل' : '3. Keep the payment receipt as proof'}</p>
                                        <p>{lang === 'ar' ? '4. سيتم تفعيل حسابك بعد تأكيد الدفع' : '4. Your account will be activated after payment confirmation'}</p>
                                    </div>
                                </div>

                                {/* QR Code */}
                                {enrollmentData.payment_details?.teacherQRCodes?.[selectedPaymentMethod] && (
                                    <div className="text-center">
                                        <div className={`inline-block p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-200`}>
                                            <img
                                                src={enrollmentData.payment_details.teacherQRCodes[selectedPaymentMethod]}
                                                alt={`${selectedPaymentMethod} QR Code`}
                                                className="w-48 h-48 object-contain"
                                            />
                                        </div>
                                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {lang === 'ar' ? 'رمز QR للدفع' : 'Payment QR Code'}
                                        </p>
                                    </div>
                                )}

                                {/* Payment Status */}
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'} border border-yellow-200`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                                        <span className="font-semibold text-yellow-600">
                                            {lang === 'ar' ? 'حالة الدفع: في انتظار التأكيد' : 'Payment Status: Pending Confirmation'}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {lang === 'ar' ? 'سيتم مراجعة الدفع من قبل المعلم وتفعيل حسابك قريباً' : 'Payment will be reviewed by the teacher and your account will be activated soon'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCheckPaymentStatus}
                                        className="flex-1 py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {lang === 'ar' ? 'فحص حالة الدفع' : 'Check Payment Status'}
                                    </motion.button>
                                    <Link
                                        to={`/courses/${id}`}
                                        className="flex-1 py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-center"
                                    >
                                        {lang === 'ar' ? 'العودة للدورات' : 'Back to Courses'}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Additional Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}
                >
                    <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'معلومات مهمة' : 'Important Information'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{lang === 'ar' ? 'دفع آمن ومشفر' : 'Secure and encrypted payment'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{lang === 'ar' ? 'وصول فوري للدورة بعد التأكيد' : 'Instant course access after confirmation'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{lang === 'ar' ? 'دعم فني متاح على مدار الساعة' : '24/7 technical support available'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{lang === 'ar' ? 'ضمان استرداد الأموال' : 'Money-back guarantee'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
