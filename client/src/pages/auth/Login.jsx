import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, GraduationCap, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handlePasswordLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        if (!email) return toast.error('Enter email first');
        setLoading(true);
        try {
            await API.post('/auth/login-send-otp', { email });
            toast.success('Login OTP sent to your email!');
            setOtpSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login-verify', { email, otp });
            login(res.data.user, res.data.token);
            toast.success(`Verified! Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-900">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-card p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl animated-gradient flex items-center justify-center shadow-glow p-0.5 overflow-hidden">
                        <div className="w-full h-full bg-dark-900 rounded-2xl flex items-center justify-center">
                            <img src="/quantioco.svg" alt="Quantioco Logo" className="w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                        Quantioco<span className="text-primary-500">.io</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
                        {otpSent ? 'Enter Secret Code' : 'Secure Entry Protocol'}
                    </p>
                </div>

                {/* Login Mode Toggle */}
                <div className="flex bg-dark-800 p-1 rounded-xl mb-6 border border-white/5">
                    <button
                        onClick={() => { setLoginMode('password'); setOtpSent(false); }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'password' ? 'bg-primary-500 text-white shadow-glow shadow-primary-500/30' : 'text-gray-500 hover:text-white'}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setLoginMode('otp')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'otp' ? 'bg-primary-500 text-white shadow-glow shadow-primary-500/30' : 'text-gray-500 hover:text-white'}`}
                    >
                        One-Time Code
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {loginMode === 'password' ? (
                        <motion.form
                            key="pass"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={handlePasswordLogin}
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                    <input name="email" type="email" required className="input-field pl-12 h-12 text-sm" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                    <input name="password" type="password" required className="input-field pl-12 h-12 text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                                {loading ? 'Authenticating...' : <>Grant Access <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={otpSent ? handleOtpVerify : handleSendOTP}
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Identity Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                    <input name="email" type="email" required disabled={otpSent} className="input-field pl-12 h-12 text-sm" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>

                            {otpSent && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Secret Code</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input name="otp" required className="input-field pl-12 h-12 text-sm tracking-[1em] font-black" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                                    </div>
                                </motion.div>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                                {loading ? 'Processing...' : otpSent ? <>Verify & Join <ShieldCheck className="w-4 h-4" /></> : <>Send Login Code <ArrowRight className="w-4 h-4" /></>}
                            </button>

                            {otpSent && (
                                <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
                                    Didn't receive it? <button type="button" onClick={handleSendOTP} className="text-primary-400 hover:underline">Resend Code</button>
                                </p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400">
                            Create Identity
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
