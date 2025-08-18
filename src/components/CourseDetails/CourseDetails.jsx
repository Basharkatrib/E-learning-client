import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { selectTranslate } from '../../redux/features/translateSlice';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import FAQ from '../FAQ/FAQ';
import { useGetCourseQuery, useEnrollUserMutation, useUnenrollUserMutation, useCourseEnrollmentsQuery, useCheckPaymentStatusQuery } from '../../redux/features/apiSlice';
import { selectToken, selectCurrentUser } from '../../redux/features/authSlice';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';
import toast from 'react-hot-toast';
import { useIsEnrolledMutation } from '../../redux/features/apiSlice';
import { Link } from 'react-router-dom';
import { useCourseRatingsMutation, useCourseRatingsUpdateMutation, useCourseRatingsDeleteMutation, useCourseMyRatingQuery } from '../../redux/features/apiSlice';

const dummyCourse = {
    stats: {
        series: 4,
        rating: 4.7,
        reviews: 814,
        level: 'Beginner',
        duration: '2 months',
        schedule: 'Flexible schedule',
        registered: 39969,
        startDate: 'June 6',
    },
    details: [
        { icon: '💼', title: 'Shareable Certificate', desc: 'Add to your LinkedIn profile' },
        { icon: '🌐', title: 'Studying in English', desc: '25 languages available' },
    ],
};

export default function CourseDetails() {
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const { id } = useParams();
    const lang = useSelector(selectTranslate);
    const navigate = useNavigate();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
    const [showUnenrollSuccess, setShowUnenrollSuccess] = useState(false);
    const [enrollUser, { isLoading: isEnrolling }] = useEnrollUserMutation();
    const { data, error, isLoading, refetch } = useGetCourseQuery(id, { refetchOnMountOrArgChange: true });
    const [isEnrolled, { isLoading: isCheckingEnrollment }] = useIsEnrolledMutation();
    const [enrollmentStatus, setEnrollmentStatus] = useState(false);
    const [localEnrollmentStatus, setLocalEnrollmentStatus] = useState(false); // Local state for immediate updates
    const [localPaymentStatus, setLocalPaymentStatus] = useState(null); // Local state for payment status
    const [isUnenrollingLocal, setIsUnenrollingLocal] = useState(false); // Track local unenroll state
    const [unenrollUser, { isLoading: isUnenrolling }] = useUnenrollUserMutation();
    const { data: enrollmentsData, refetch: refetchEnrollments, error: enrollmentsError } = useCourseEnrollmentsQuery({ id, token }, {
        skip: !token
    });
    
    // Check payment status for paid courses - only once when page loads
    const { data: paymentStatusData, refetch: refetchPaymentStatus, isLoading: isPaymentStatusLoading, error: paymentStatusError } = useCheckPaymentStatusQuery(
        { token, courseId: id },
        { 
            skip: !token || !id || !data?.price || data?.price <= 0,
            refetchOnMountOrArgChange: true
            // Removed pollingInterval to prevent repeated requests
        }
    );

    // Debug payment status
    useEffect(() => {
        console.log('=== PAYMENT STATUS DEBUG ===');
        console.log('Course ID:', id);
        console.log('Course Price:', data?.price);
        console.log('Token exists:', !!token);
        console.log('Payment Status Data:', paymentStatusData);
        console.log('Payment Status Error:', paymentStatusError);
        console.log('Payment Status Loading:', isPaymentStatusLoading);
        console.log('Course data:', data);
        console.log('===========================');
    }, [paymentStatusData, paymentStatusError, isPaymentStatusLoading, id, data?.price, token, data]);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [submitRating, { isLoading: isRatingLoading }] = useCourseRatingsMutation();
    const [updateRating, { isLoading: isUpdateLoading }] = useCourseRatingsUpdateMutation();
    const [deleteRating, { isLoading: isDeleteLoading }] = useCourseRatingsDeleteMutation();
    const { data: myRatingData, refetch: refetchMyRating, isLoading: isMyRatingLoading } = useCourseMyRatingQuery({ token, courseId: id }, { skip: !token || !id });
    const [hideRating, setHideRating] = useState(false);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            // Only check enrollment automatically for free courses once data is available
            if (!user || !token || !data) return;
            if ((data.price ?? 0) > 0) return; // Skip for paid courses

            try {
                const response = await isEnrolled({
                    userId: user.id,
                    courseId: id,
                    token,
                }).unwrap();
                console.log(response);
                const isUserEnrolled = response.isEnrolled === true;
                setEnrollmentStatus(isUserEnrolled);
                setLocalEnrollmentStatus(isUserEnrolled);
            } catch (error) {
                setEnrollmentStatus(false);
                setLocalEnrollmentStatus(false);
            }
        };

        checkEnrollmentStatus();
    }, [user, token, id, data]);



    // Check payment status once when course data is loaded
    useEffect(() => {
        if (data?.price > 0 && token && id) {
            // Only refetch if we don't have payment status data yet
            if (!paymentStatusData && !isPaymentStatusLoading) {
                refetchPaymentStatus();
            }
        }
    }, [data, token, id, paymentStatusData, isPaymentStatusLoading, refetchPaymentStatus]);

    // Update local payment status when API data changes
    useEffect(() => {
        if (paymentStatusData && data?.price > 0) {
            setLocalPaymentStatus(paymentStatusData.paymentStatus);
        }
    }, [paymentStatusData, data?.price]);

    // Update enrollment status when payment status changes
    useEffect(() => {
        if (data?.price > 0 && paymentStatusData) {
            console.log('Payment status changed:', paymentStatusData);
            if (paymentStatusData.paymentStatus === 'paid' || paymentStatusData.enrollmentStatus === 'accepted') {
                setEnrollmentStatus(true);
                setLocalEnrollmentStatus(true);
                setLocalPaymentStatus(paymentStatusData.paymentStatus);
                console.log('Setting enrollment status to true');
            } else if (paymentStatusData.paymentStatus === 'rejected' || paymentStatusData.enrollmentStatus === 'rejected') {
                setEnrollmentStatus(false);
                setLocalEnrollmentStatus(false);
                setLocalPaymentStatus(paymentStatusData.paymentStatus);
                console.log('Setting enrollment status to false');
            }
        }
    }, [paymentStatusData, data?.price]);

    // Force refetch payment status when enrollment status changes (for paid courses)
    useEffect(() => {
        if (data?.price > 0 && !enrollmentStatus && token && id) {
            // If enrollment status is false and it's a paid course, refetch payment status
            refetchPaymentStatus();
        }
    }, [enrollmentStatus, data?.price, token, id, refetchPaymentStatus]);

    // Update local payment status when local enrollment status changes (for immediate UI updates)
    useEffect(() => {
        if (!localEnrollmentStatus && data?.price > 0) {
            // If user unenrolled, immediately set payment status to null
            setLocalPaymentStatus(null);
            console.log('Local enrollment status changed to false - setting payment status to null');
        }
    }, [localEnrollmentStatus, data?.price]);

    // Helper function to determine if user can access course
    const canAccessCourse = () => {
        console.log('=== CAN ACCESS COURSE DEBUG ===');
        console.log('Course Price:', data?.price);
        console.log('Enrollment Status:', enrollmentStatus);
        console.log('Local Enrollment Status:', localEnrollmentStatus);
        console.log('Payment Status Data:', paymentStatusData);
        console.log('Payment Status Error:', paymentStatusError);
        
        // If local enrollment status is false, user cannot access regardless of payment status
        if (!localEnrollmentStatus) {
            console.log('Local enrollment status is false - cannot access');
            return false;
        }
        
        if (data?.price <= 0) {
            console.log('Free course - using local enrollment status:', localEnrollmentStatus);
            return localEnrollmentStatus; // For free courses, use local enrollment status
        } else {
            // For paid courses, use payment status
            if (!paymentStatusData) {
                console.log('No payment status data - cannot access');
                return false;
            }
            const canAccess = paymentStatusData.paymentStatus === 'paid' || paymentStatusData.enrollmentStatus === 'accepted';
            console.log('Paid course - payment status:', paymentStatusData.paymentStatus, 'enrollment status:', paymentStatusData.enrollmentStatus, 'can access:', canAccess);
            return canAccess;
        }
    };

    // Helper function to get payment status for paid courses
    const getPaymentStatus = () => {
        console.log('=== GET PAYMENT STATUS DEBUG ===');
        console.log('Course Price:', data?.price);
        console.log('Payment Status Data:', paymentStatusData);
        console.log('Local Payment Status:', localPaymentStatus);
        console.log('Is Unenrolling Local:', isUnenrollingLocal);
        console.log('Payment Status Error:', paymentStatusError);
        
        if (data?.price <= 0) {
            console.log('Free course - no payment status');
            return null;
        }
        
        // If user is unenrolling locally, return null immediately
        if (isUnenrollingLocal) {
            console.log('User is unenrolling - returning null');
            return null;
        }
        
        // Use local payment status if available, otherwise use API data
        const status = localPaymentStatus !== null ? localPaymentStatus : (paymentStatusData?.paymentStatus || null);
        console.log('Final Payment Status:', status);
        return status;
    };

    useEffect(() => {
        if (myRatingData && myRatingData.rating) {
            setRating(myRatingData.rating.rating);
            setReview(myRatingData.rating.review || '');
            setHideRating(false);
        } else {
            setRating(0);
            setReview('');
        }
    }, [myRatingData]);

    const handleUnenroll = () => {
        setShowUnenrollConfirm(true);
    };

    const handleRegister = () => {
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        try {
            await enrollUser({ id, token }).unwrap();
            setShowConfirm(false);
            setShowCongrats(true);
            toast.success(lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Enrolled successfully!');
            refetchEnrollments();
            
            // Update local state immediately
            setEnrollmentStatus(true);
            setLocalEnrollmentStatus(true);
            setLocalPaymentStatus('paid'); // Set payment status to paid for free courses
            
            setTimeout(() => {
                setShowCongrats(false);
                navigate(`/courses/${id}/videos`);
            }, 1800);
        } catch (e) {
            setShowConfirm(false);
            if (e?.status === 402) {
                toast.error(lang === 'ar' ? 'يرجى تفعيل بريدك الإلكتروني أولاً قبل التسجيل في الدورات.' : 'Please verify your email address before enrolling in courses.');
            }
            else if (e?.status === 401) {
                toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
                navigate('/login');
            }
            else if (e?.status === 409) {
                toast.error(lang === 'ar' ? 'أنت مسجل بالفعل في هذه الدورة' : 'You are already enrolled in this course');
            }
            else if (e?.status === 403) {
                toast.error(lang === 'ar' ? 'أنت لست طالباً' : 'You are not a student');
            }
            else if (e?.status === 404) {
                toast.error(lang === 'ar' ? 'الدورة غير موجودة' : 'Course not found');
            }
            else {
                toast.error(lang === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Error during enrollment');
            }
        }
    };

    const handleUnenrollConfirm = async () => {
        try {
            setIsUnenrollingLocal(true); // Set local unenrolling state
            await unenrollUser({ id, token }).unwrap();
            setShowUnenrollConfirm(false);
            setShowUnenrollSuccess(true);
            toast.success(lang === 'ar' ? 'تم إلغاء التسجيل بنجاح' : 'Unenrolled successfully');
            
            // Update local state immediately - this will make canAccessCourse return false immediately
            setEnrollmentStatus(false);
            setLocalEnrollmentStatus(false);
            setLocalPaymentStatus(null); // Reset payment status immediately
            
            refetchEnrollments();
            
            // Force refetch payment status to update buttons immediately
            if (data?.price > 0) {
                // Clear payment status data immediately to show checkout button
                setTimeout(() => {
                    refetchPaymentStatus();
                }, 500); // Small delay to ensure backend has processed the unenroll
            }
            
            // Reset local unenrolling state after a short delay
            setTimeout(() => {
                setIsUnenrollingLocal(false);
            }, 1000);
        } catch (error) {
            setIsUnenrollingLocal(false);
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء الإلغاء' : 'Error during unenrollment');
            setShowUnenrollConfirm(false);
        }
    };

    const handleStarClick = (star) => {
        setRating(star);
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        try {
            if (myRatingData && myRatingData.rating && editMode) {
                await updateRating({ id, token, ratingId: myRatingData.rating.id, rating, review }).unwrap();
                toast.success(lang === 'ar' ? 'تم تحديث التقييم بنجاح' : 'Rating updated successfully');
                setEditMode(false);
            } else {
                await submitRating({ id, token, rating, review }).unwrap();
                toast.success(lang === 'ar' ? 'تم إرسال التقييم بنجاح' : 'Rating submitted successfully');
            }
            setShowRating(false);
            refetchMyRating();
        } catch (err) {
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء إرسال التقييم' : 'Error submitting rating');
        }
    };

    const handleDeleteRating = async () => {
        try {
            await deleteRating({ token, courseId: id, ratingId: myRatingData.rating.id }).unwrap();
            toast.success(lang === 'ar' ? 'تم حذف التقييم' : 'Rating deleted');
            setShowRating(false);
            setEditMode(false);
            setRating(0);
            setReview('');
            setHideRating(true);
            refetchMyRating();
        } catch (err) {
            toast.error(lang === 'ar' ? 'حدث خطأ أثناء حذف التقييم' : 'Error deleting rating');
        }
    };

    if (isLoading) return <LoadingPage />;
    
    // Check if course data exists and is valid
    if (error || !data || !data.id) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-red-600 text-red-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <svg
                        className="mx-auto h-12 w-12 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
                        />
                    </svg>
                    <h2 className="text-xl font-semibold text-red-500">
                        {lang === 'ar' ? 'الدورة غير موجودة' : 'Course Not Found'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {lang === 'ar' 
                            ? 'عذراً، الدورة التي تبحث عنها غير موجودة أو تم حذفها.' 
                            : 'Sorry, the course you are looking for does not exist or has been removed.'}
                    </p>
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

    // Check if essential course data is missing
    if (!data.title || !data.description || !data.sections || !data.skills || !data.benefits) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className={`${theme === 'dark' ? 'bg-[#1f2937]' : 'bg-white'} border border-yellow-600 text-yellow-400 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-3`}>
                    <svg
                        className="mx-auto h-12 w-12 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <h2 className="text-xl font-semibold text-yellow-500">
                        {lang === 'ar' ? 'بيانات الدورة غير مكتملة' : 'Incomplete Course Data'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {lang === 'ar' 
                            ? 'عذراً، بيانات هذه الدورة غير مكتملة. يرجى المحاولة مرة أخرى لاحقاً.' 
                            : 'Sorry, this course data is incomplete. Please try again later.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Helper function to render action buttons based on course access and payment status
    const renderActionButtons = () => {
        const canAccess = canAccessCourse();
        console.log('=== RENDER ACTION BUTTONS DEBUG ===');
        console.log('Can Access Course:', canAccess);
        console.log('Course Price:', data?.price);
        console.log('Payment Status:', getPaymentStatus());
        console.log('===========================');

        if (canAccess) {
            // User can access the course - show unenroll and watch videos buttons
            return (
                <div className="flex gap-3 items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleUnenroll}
                        disabled={isCheckingEnrollment}
                        className={`px-3 md:px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm md:text-lg flex items-center gap-2
                            bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isCheckingEnrollment ? 'bg-gray-400' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {isCheckingEnrollment
                            ? (lang === 'ar' ? 'يرجى الانتظار...' : 'Please wait...')
                            : (lang === 'ar' ? 'إلغاء التسجيل من الدورة' : 'Unenroll from course')}
                    </motion.button>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Link
                            to={`/courses/${id}/videos`}
                            className={`px-3 md:px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm md:text-lg flex items-center gap-2
                                bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                            {lang === 'ar' ? 'مشاهدة الفيديوهات' : 'Watch Videos'}
                        </Link>
                    </motion.div>
                </div>
            );
        }

        // User cannot access the course
        if (data.price > 0) {
            // Paid course - check payment status
            if (isPaymentStatusLoading) {
                return (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <button
                            disabled
                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                                bg-gray-400 text-white opacity-50 cursor-not-allowed`}
                        >
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {lang === 'ar' ? 'جاري التحقق...' : 'Checking...'}
                        </button>
                    </motion.div>
                );
            }

            const paymentStatus = getPaymentStatus();

            if (paymentStatus === 'pending') {
                return (
                    <div className="flex flex-col gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                                bg-gradient-to-r from-yellow-500 to-orange-500 text-white`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {lang === 'ar' ? 'الدفع قيد المعالجة' : 'Payment Pending'}
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                refetchPaymentStatus();
                                toast.success(lang === 'ar' ? 'جاري تحديث حالة الدفع...' : 'Updating payment status...');
                            }}
                            className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-sm flex items-center gap-2
                                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {lang === 'ar' ? 'تحديث حالة الدفع' : 'Refresh Payment Status'}
                        </motion.button>
                    </div>
                );
            }

            if (paymentStatus === 'rejected') {
                return (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Link
                            to={`/checkout/${id}`}
                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                                bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            {lang === 'ar' ? 'إعادة الدفع' : 'Retry Payment'}
                        </Link>
                    </motion.div>
                );
            }

            // Default: Show checkout button for paid courses
            return (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Link
                        to={`/checkout/${id}`}
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                            bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {lang === 'ar' ? 'اذهب للدفع' : 'Go to Checkout'}
                    </Link>
                </motion.div>
            );
        } else {
            // Free course - show register button
            return (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRegister}
                    disabled={isCheckingEnrollment}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-2
                        bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${isCheckingEnrollment ? 'bg-gray-400' : ''}`}
                >
                    {isCheckingEnrollment
                        ? (lang === 'ar' ? 'يرجى الانتظار...' : 'Please wait...')
                        : (lang === 'ar' ? 'سجل مجاناً' : 'Register for free')
                    }
                    {!isCheckingEnrollment && (
                        <span className="block text-xs font-normal mt-1">
                            {lang === 'ar' ? 'تبدأ في' : 'Starts'} {dummyCourse.stats.startDate}
                        </span>
                    )}
                </motion.button>
            );
        }
    };

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen mt-22 w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <h2 className="text-xl font-bold mb-4 text-center">{lang === 'ar' ? 'تأكيد التسجيل' : 'Confirm Enrollment'}</h2>
                        <p className="mb-6 text-center">{lang === 'ar' ? 'هل أنت متأكد أنك تريد التسجيل في هذه الدورة؟' : 'Are you sure you want to enroll in this course?'}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleConfirm}
                                className="px-6 py-2 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary/90 transition"
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? (lang === 'ar' ? 'جاري التسجيل...' : 'Enrolling...') : (lang === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-bold shadow hover:bg-gray-400 transition"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCongrats && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <svg className="mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <h2 className="text-2xl font-bold mb-2 text-center">{lang === 'ar' ? 'مبروك!' : 'Congratulations!'}</h2>
                        <p className="text-center mb-2">{lang === 'ar' ? 'تم تسجيلك في الدورة بنجاح.' : 'You have been enrolled in the course successfully.'}</p>
                    </div>
                </div>
            )}
            {showUnenrollConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <h2 className="text-xl font-bold mb-4 text-center">{lang === 'ar' ? 'تأكيد إلغاء التسجيل' : 'Confirm Unenrollment'}</h2>
                        <p className="mb-6 text-center">{lang === 'ar' ? 'هل أنت متأكد أنك تريد إلغاء تسجيلك في هذه الدورة؟' : 'Are you sure you want to unenroll from this course?'}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleUnenrollConfirm}
                                className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                                disabled={isUnenrolling}
                            >
                                {isUnenrolling
                                    ? (lang === 'ar' ? 'جاري الإلغاء...' : 'Unenrolling...')
                                    : (lang === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>

                            <button
                                onClick={() => setShowUnenrollConfirm(false)}
                                className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-bold shadow hover:bg-gray-400 transition"
                            >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showUnenrollSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className={`rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <svg className="mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#ef4444" />
                            <path d="M15 10l-4 4-2-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="text-2xl font-bold mb-2 text-center">
                            {lang === 'ar' ? 'تم الإلغاء' : 'Unenrolled'}
                        </h2>
                        <p className="text-center mb-4">
                            {lang === 'ar' ? 'تم إلغاء تسجيلك في الدورة بنجاح.' : 'You have been unenrolled from the course successfully.'}
                        </p>
                        <button
                            onClick={() => setShowUnenrollSuccess(false)}
                            className="mt-2 px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
                        >
                            {lang === 'ar' ? 'تم' : 'Done'}
                        </button>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden rounded-b-2xl flex flex-col md:flex-row justify-between items-center md:items-start gap-8 pb-20 px-4 sm:px-6 lg:px-8 pt-9 bg-gradient-to-br from-primary/10 via-blue-200/30 to-white dark:from-gray-900 dark:via-primary/10 dark:to-gray-950"
            >
                {data.thumbnail_url && (
                    <>
                        <img
                            src={data.thumbnail_url}
                            alt="banner"
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent" />
                    </>
                )}
                <div className="relative z-10 flex-1 max-w-2xl">
                    <motion.h1
                        {...fadeInUp}
                        className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent drop-shadow-lg"
                    >
                        {data.title?.[lang]}
                    </motion.h1>
                    <p className={`text-lg mb-2 font-medium text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.description?.[lang]}</p>
                    
                    {/* Rating Section - Compact Professional Design */}
                    {canAccessCourse() && (
                        <div className="mb-6">
                            {!hideRating && myRatingData && myRatingData.rating ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`h-5 w-5 ${myRatingData.rating.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setShowRating(true); setEditMode(true); }}
                                        className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} 
                                            flex items-center gap-2 transition-colors duration-300`}
                                    >
                                        {lang === 'ar' ? 'تعديل تقييمك' : 'Edit your rating'}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowRating(true); setEditMode(false); }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark 
                                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white' 
                                        : 'bg-white/80 hover:bg-gray-50/80 text-gray-900'} 
                                        backdrop-blur-sm border border-gray-200/20 shadow-sm transition-all duration-300`}
                                >
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                                    {lang === 'ar' ? 'قيّم هذه الدورة' : 'Rate this course'}
                                </motion.button>
                            )}

                            {/* Rating Modal */}
                            <AnimatePresence>
                                {showRating && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                                    >
                                        <motion.div 
                                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                            onClick={() => setShowRating(false)}
                                        />
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className={`relative rounded-2xl ${isDark 
                                                ? 'bg-gray-800 border border-gray-700' 
                                                : 'bg-white border border-gray-200'} 
                                                shadow-xl p-6 max-w-md w-full`}
                                        >
                                            <button 
                                                onClick={() => setShowRating(false)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            <h3 className="text-xl font-bold mb-6 text-center">
                                                {lang === 'ar' ? 'قيّم تجربتك مع الدورة' : 'Rate your experience'}
                                            </h3>

                                            <form onSubmit={handleSubmitRating} className="space-y-6">
                                                <div className="flex justify-center gap-2">
                                                    {[1,2,3,4,5].map((star) => (
                                                        <motion.button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => handleStarClick(star)}
                                                            whileHover={{ scale: 1.2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="focus:outline-none"
                                                        >
                                                            <svg
                                                                className={`h-10 w-10 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} 
                                                                transition-colors duration-300`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                                                            </svg>
                                                        </motion.button>
                                                    ))}
                                                </div>

                                                <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                    <textarea
                                                        className={`w-full p-4 focus:outline-none focus:ring-2 focus:ring-primary bg-transparent
                                                            text-base resize-none ${isDark ? 'text-white' : 'text-gray-900'}
                                                            placeholder-gray-400`}
                                                        rows={3}
                                                        placeholder={lang === 'ar' ? 'اكتب مراجعتك هنا (اختياري)' : 'Write your review here (optional)'}
                                                        value={review}
                                                        onChange={e => setReview(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex gap-3">
                                                    {editMode && (
                                                        <motion.button
                                                            type="button"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={handleDeleteRating}
                                                            disabled={isDeleteLoading}
                                                            className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20
                                                                font-semibold transition-all duration-300 disabled:opacity-50"
                                                        >
                                                            {lang === 'ar' ? 'حذف التقييم' : 'Delete Rating'}
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isRatingLoading || isUpdateLoading || rating === 0}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold
                                                            transition-all duration-300 disabled:opacity-50"
                                                    >
                                                        {(isRatingLoading || isUpdateLoading)
                                                            ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                                                            : (editMode
                                                                ? (lang === 'ar' ? 'تحديث' : 'Update')
                                                                : (lang === 'ar' ? 'إرسال' : 'Submit'))}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-primary">{t('Teacher')}:</span>
                        <span className={`text-sm font-medium text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {data.teacher?.first_name + ' ' + data.teacher?.last_name || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                        </span>
                    </div>
                    
                    {/* Course Price */}
                    {data.price && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-semibold text-primary">{lang === 'ar' ? 'السعر:' : 'Price:'}</span>
                            <span className={`text-lg font-bold text-green-600 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                {data.price} {t('SYP')}
                            </span>
                            {data.original_price && data.original_price > data.price && (
                                <span className={`text-sm line-through text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {data.original_price} {t('SYP')}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
                        {renderActionButtons()}
                        <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2 sm:mt-0`}>
                            {(enrollmentsData?.data?.length || 0).toLocaleString()} {lang === 'ar' ? 'مسجل بالفعل' : 'already registered'}
                        </span>
                    </div>
                    <div className={`text-sm text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {data.price > 0 && getPaymentStatus() === 'pending' ? (
                            lang === 'ar' 
                                ? 'تم إرسال طلب الدفع الخاص بك. يرجى انتظار تأكيد المدرس للدفع.'
                                : 'Your payment request has been sent. Please wait for teacher confirmation.'
                        ) : (
                            lang === 'ar' 
                                ? 'جرّب مجاناً: سجّل لبدء تجربتك المجانية مع وصول كامل لمدة 7 أيام.' 
                                : 'Try for free: Sign up to start your free trial with full access for 7 days.'
                        )}
                    </div>
                </div>
                {!data.thumbnail_url && (
                    <div className="relative z-10 flex-shrink-0 w-full md:w-80 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800">
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`w-full flex flex-col md:flex-row gap-6 justify-between items-stretch ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl px-6 md:px-16 py-8 mt-[-3rem] mb-16 mx-auto max-w-7xl relative z-10`}
            >
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg text-primary">{data.sections.length} <span>{t('training course series')}</span></span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('Gain in-depth knowledge of the subject')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg flex items-center gap-1">{dummyCourse.stats.rating}<span className="text-yellow-400">★</span></span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>({dummyCourse.stats.reviews} reviews)</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{t(data.difficulty_level)} {t('level')}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('No previous experience required')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{data.duration?.[lang]}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.duration?.[lang]} {t('a week')}</span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start">
                    <span className="font-bold text-lg">{t(dummyCourse.stats.schedule)}</span>
                    <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('Learn at your own pace')}</span>
                </div>
                {data.price && (
                    <div className="flex-1 flex flex-col items-center md:items-start">
                        <span className="font-bold text-lg text-green-600">{data.price} {t('SYP')}</span>
                        <span className={`text-xs text-gray-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lang === 'ar' ? 'سعر الدورة' : 'Course Price'}</span>
                    </div>
                )}
            </motion.div>

            {/* Content Container for consistent padding */}
            <div className="px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Skills Section */}
                <motion.div {...fadeInUp}>
                    <h2 className="text-2xl font-bold mb-6">{t('Skills you will acquire')}</h2>
                    <div className="flex flex-wrap gap-3">
                        {data.skills && data.skills.length > 0 ? (
                            data.skills.map(skill => (
                                <span key={skill.id || skill} className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm shadow-sm">
                                    {skill.name?.en || skill.name || skill}
                                </span>
                            ))
                        ) : (
                            <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {lang === 'ar' ? 'لا توجد مهارات محددة لهذه الدورة' : 'No specific skills listed for this course'}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dummyCourse.details.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow border border-gray-100 dark:border-gray-800">
                            <span className="text-3xl">{item.icon}</span>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{t(item.title)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t(item.desc)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">{t('The most important benefits gained from the course')}</h2>
                    {data.benefits && data.benefits.length > 0 ? (
                        <ul className="list-disc p-6 pt-2 space-y-3 text-base">
                            {data.benefits.map((b, i) => (
                                <li key={i} className={`text-gray-800 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {b.title?.[lang] || b.title?.en || b.title || b}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} p-6`}>
                            {lang === 'ar' ? 'لا توجد فوائد محددة لهذه الدورة' : 'No specific benefits listed for this course'}
                        </p>
                    )}
                </div>

                {/* Course Groups Section */}
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            {t('Course Curriculum')}
                        </h2>
                        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                            {t('Master the fundamentals through')} {data.sections.length} {t('comprehensive modules designed by industry experts')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.sections && data.sections.length > 0 ? (
                            data.sections.map((section, id) => (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: id * 0.1 }}
                                    className={`group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${theme === 'dark'
                                        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border border-gray-700'
                                        : 'bg-gradient-to-br from-white via-blue-50 to-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Section Number Badge */}
                                    <div className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-10`}>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${theme === 'dark'
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'bg-primary/10 text-primary border border-primary/20'
                                            } text-sm font-bold shadow-lg backdrop-blur-sm`}>
                                            {id + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative p-8 h-64 flex flex-col items-center justify-center text-center">
                                        {/* Icon */}
                                        <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-6 ${theme === 'dark'
                                            ? 'bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary'
                                            : 'bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary'
                                            } text-4xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {id === 0 ? '🚀' : id === 1 ? '💡' : id === 2 ? '⚡' : id === 3 ? '🎯' : id === 4 ? '🏆' : '📚'}
                                        </div>

                                        {/* Title */}
                                        <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            } group-hover:text-primary transition-colors duration-300`}>
                                            {section.title?.[lang] || section.title?.en || section.title || (lang === 'ar' ? 'قسم غير محدد' : 'Unnamed Section')}
                                        </h3>

                                        {/* Progress Indicator */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                                            <div className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500 group-hover:w-full" style={{ width: '0%' }} />
                                        </div>

                                        {/* Status */}
                                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            {section.videos?.length || 0} {t('Lessons')}
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {lang === 'ar' ? 'لا توجد أقسام متاحة لهذه الدورة' : 'No sections available for this course'}
                                </p>
                            </div>
                        )}
                    </div>

                   
                </div>
            </div>
            <FAQ Faqs={data.faqs} />

        </div>
    );
}