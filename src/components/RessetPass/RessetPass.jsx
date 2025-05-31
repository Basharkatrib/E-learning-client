import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import { useResetPasswordMutation } from '../../redux/features/apiSlice';
import Cookies from 'js-cookie';


function ResetPassword() {
  const theme = useSelector(selectTheme);
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await resetPassword({
        email,
        password,
        password_confirmation: confirm,
        token
      }).unwrap();
      if (res.token) {
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      }
      setSuccessMsg('Your password has been reset successfully. You can now login with your new password.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-8 flex items-center justify-center mt-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="w-full lg:w-1/2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-4 lg:p-8 rounded-2xl ${theme==='dark'?'bg-gray-800':'bg-white shadow-xl'}`}> 
              <h2 className={`text-2xl font-bold text-center mb-2 ${theme==='dark'?'text-white':'text-gray-900'}`}>Reset Password</h2>
              <p className={`text-center mb-6 ${theme==='dark'?'text-gray-400':'text-gray-600'}`}>Set a new password for your account</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme==='dark'?'text-gray-300':'text-gray-700'}`}>Email Address</label>
                  <input type="email" value={email} readOnly placeholder="Enter your email"
                    className={`w-full px-4 py-2 rounded-lg border ${theme==='dark'?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-primary focus:border-transparent`} required />
                </div>
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
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50">{isLoading ? 'Resetting...' : 'Confirm Change'}</button>
                {successMsg && <p className="text-green-500 text-center text-sm mt-2">{successMsg}</p>}
                {errorMsg && <p className="text-red-500 text-center text-sm mt-2">{errorMsg}</p>}
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