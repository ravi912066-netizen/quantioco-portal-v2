import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Phone, GraduationCap, ArrowRight, ShieldCheck, CheckCircle, RefreshCcw } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'student',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async () => {
        setLoading(true);
        try {
            await API.post('/auth/send-otp', { phone: formData.phone, email: formData.email });
            toast.success('OTP sent to your mobile and email! Check both.');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/register', formData);
            if (res.data.pendingApproval) {
                toast.success(res.data.message);
                navigate('/login');
            } else {
                login(res.data.user, res.data.token);
                toast.success('Full verification successful! Welcome to Quantioco.');
                navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        await handleSendOTP();
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
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Quantioco<span className="text-primary-500">.io</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
                        {step === 1 ? 'Join the tech elite' : 'Securing your cadet account'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleInitialSubmit}
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Identity Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                    <input name="name" required className="input-field pl-12 h-12 text-sm" placeholder="Full Name" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Contact Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input name="email" type="email" required className="input-field pl-12 h-12 text-sm" placeholder="Email Address" onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Battle Mobile</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input name="phone" required className="input-field pl-12 h-12 text-sm" placeholder="Mobile Number" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                    <input name="password" type="password" required className="input-field pl-12 h-12 text-sm" placeholder="••••••••" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 mb-2 block">Choose Your Path</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setFormData({ ...formData, role: 'student' })}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${formData.role === 'student' ? 'border-primary-500 bg-primary-500/10 shadow-glow' : 'border-white/5 bg-white/5 grayscale'}`}
                                    >
                                        <User className={`w-5 h-5 ${formData.role === 'student' ? 'text-primary-500' : 'text-gray-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'student' ? 'text-white' : 'text-gray-500'}`}>Student</span>
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${formData.role === 'admin' ? 'border-purple-500 bg-purple-500/10 shadow-glow shadow-purple-500/20' : 'border-white/5 bg-white/5 grayscale'}`}
                                    >
                                        <ShieldCheck className={`w-5 h-5 ${formData.role === 'admin' ? 'text-purple-500' : 'text-gray-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'admin' ? 'text-white' : 'text-gray-500'}`}>Admin</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full h-12 mt-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                                {loading ? 'Initializing...' : <>Initialize Cadet <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister}
                            className="space-y-6"
                        >
                            <div className="bg-primary-500/10 border-2 border-primary-500/30 p-5 rounded-2xl text-center shadow-glow shadow-primary-500/10">
                                <p className="text-sm text-primary-400 font-black uppercase tracking-widest">Master Key Required</p>
                                <div className="mt-3 p-2 bg-black/40 rounded-xl border border-white/5">
                                    <p className="text-[11px] text-gray-300 font-medium">Bhai, code is in your <span className="text-primary-400 font-black">Server Terminal</span> console!</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 text-center block">Transmission Code</label>
                                <input
                                    name="otp"
                                    required
                                    maxLength={6}
                                    className="input-field text-center text-2xl font-black tracking-[1em] h-16"
                                    placeholder="000000"
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                                {loading ? 'Verifying...' : <>Confirm Transmission <CheckCircle className="w-4 h-4" /></>}
                            </button>

                            <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black uppercase text-gray-500 tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                                <RefreshCcw className="w-3 h-3" /> Back to Identity Details
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                        Enrolled already?{' '}
                        <Link to="/login" className="text-primary-500 hover:text-primary-400">
                            Return to Base
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
