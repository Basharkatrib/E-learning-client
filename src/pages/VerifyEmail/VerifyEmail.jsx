import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const theme = useSelector(selectTheme);
    const [verificationStatus, setVerificationStatus] = useState('verifying');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const rawUrlEncoded = searchParams.get('url');
                if (!rawUrlEncoded) {
                    setVerificationStatus('error');
                    return;
                }
    
                const rawUrl = decodeURIComponent(rawUrlEncoded);
    
                const backendUrl = rawUrl.replace(
                    'https://e-learning-server.test',
                    import.meta.env.VITE_API_BASE_URL || 'https://e-learning-server.test'
                );
    
                const response = await fetch(backendUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
    
                if (response.ok) {
                    setVerificationStatus('success');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setVerificationStatus('error');
                }
            } catch (error) {
                console.error('Verification failed:', error);
                setVerificationStatus('error');
            }
        };
    
        verifyEmail();
    }, [searchParams, navigate]);
    

    return (
        <div className="min-h-screen pt-16 pb-8 flex items-center justify-center">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`p-8 rounded-2xl max-w-md mx-auto text-center ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'
                    }`}
                >
                    {verificationStatus === 'verifying' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Verifying your email...
                            </h2>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Please wait while we verify your email address.
                            </p>
                        </>
                    )}

                    {verificationStatus === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Email Verified Successfully!
                            </h2>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Your email has been verified. You will be redirected to the login page shortly.
                            </p>
                        </>
                    )}

                    {verificationStatus === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Verification Failed
                            </h2>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                We couldn't verify your email. The link may be invalid or expired.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                            >
                                Back to Login
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default VerifyEmail;