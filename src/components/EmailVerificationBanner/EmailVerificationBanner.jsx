import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useResendVerificationMutation } from '../../redux/features/apiSlice';
import { selectCurrentUser } from '../../redux/features/authSlice';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const EmailVerificationBanner = ({ user }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const theme = useSelector(selectTheme);
    const { t } = useTranslation();
    const [resendVerification, { isLoading }] = useResendVerificationMutation();
    const currentUser = useSelector(selectCurrentUser);

    if (!user || user.email_verified_at) {
        return null;
    }

    const handleResendVerification = async () => {
        if (!currentUser?.email) {
            console.log('Current user data:', currentUser);
            toast.error(t('User email not found'), {
                duration: 5000,
                style: {
                    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
                    padding: '16px',
                    borderRadius: '12px',
                },
                icon: '❌',
            });
            return;
        }

        const requestData = { email: currentUser.email };
        console.log('Sending verification request with data:', requestData);

        try {
            const response = await resendVerification(requestData).unwrap();
            console.log('Verification API Response:', response);
            
            toast.success(t('Verification email has been sent successfully'), {
                duration: 5000,
                style: {
                    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    border: `1px solid ${theme === 'dark' ? '#065F46' : '#D1FAE5'}`,
                    padding: '16px',
                    borderRadius: '12px',
                },
                icon: '✉️',
            });
        } catch (err) {
            console.error('Verification API Error:', {
                error: err,
                status: err?.status,
                data: err?.data,
                originalError: err?.originalError
            });
            
            toast.error(t(err?.data?.message || 'Failed to send verification email'), {
                duration: 5000,
                style: {
                    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FEE2E2'}`,
                    padding: '16px',
                    borderRadius: '12px',
                },
                icon: '❌',
            });
        }
    };

    return (
        <>
            {/* Collapsed Button */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={`fixed bottom-4 left-4 p-2 rounded-full shadow-lg z-50 ${
                        theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-50'
                    } hover:scale-105 transition-all duration-200 flex items-center gap-2 border ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                    title={t('Verify your email')}
                >
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </button>
            )}

            {/* Expanded Banner */}
            {isExpanded && (
                <div className={`fixed bottom-4 left-4 max-w-sm p-4 rounded-lg shadow-lg z-50 ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium mb-1">{t('Verify Your Email')}</h3>
                            <p className="text-xs opacity-90 mb-3">
                                {t('Please verify your email address to access all features.')}
                            </p>
                            <button
                                onClick={handleResendVerification}
                                disabled={isLoading}
                                className="w-full bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t('Sending...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{t('Resend Email')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className={`flex-shrink-0 p-1 rounded-full hover:bg-gray-700/10 transition-colors duration-200`}
                            title={t('Minimize')}
                        >
                            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmailVerificationBanner; 