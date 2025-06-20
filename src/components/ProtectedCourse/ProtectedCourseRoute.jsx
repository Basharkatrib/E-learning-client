import React, { useEffect, useState } from 'react';
import { useIsEnrolledMutation } from '../../redux/features/apiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectToken } from '../../redux/features/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage/LoadingPage';

export default function ProtectedCourseRoute({ children }) {
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEnrolled, { isLoading }] = useIsEnrolledMutation();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (!user || !token) {
                navigate('/login'); // أو صفحة أخرى حسب حالتك
                return;
            }

            try {
                const response = await isEnrolled({
                    userId: user.id,
                    courseId: id,
                    token
                }).unwrap();

                if (response.isEnrolled) {
                    setVerified(true);
                } else {
                    navigate('/not-allowed'); // صفحة رفض الوصول
                }
            } catch (error) {
                console.error('Enrollment check failed', error);
                navigate('/error');
            }
        };

        checkEnrollment();
    }, [user, token, id]);

    if (isLoading || !verified) return <LoadingPage />;

    return children;
}
