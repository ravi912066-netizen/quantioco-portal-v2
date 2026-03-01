import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send a dummy OTP so server's OTP check passes if real routes are used
            // In demo mode, this goes directly through
            const res = await API.post('/auth/register', { ...formData, otp: '000000' });
            if (res.data.pendingApproval) {
                toast.success('Registered! Waiting for admin approval.');
                navigate('/login');
            } else {
                login(res.data.user, res.data.token);
                toast.success(`Welcome to Quantioco, ${res.data.user.name}!`);
                navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-900">
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
                        Create your account
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input name="name" required className="input-field pl-12 h-12 text-sm" placeholder="Full Name" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input name="email" type="email" required className="input-field pl-12 h-12 text-sm" placeholder="Email Address" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Phone (optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input name="phone" className="input-field pl-12 h-12 text-sm" placeholder="Mobile Number" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input name="password" type="password" required className="input-field pl-12 h-12 text-sm" placeholder="••••••••" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-1 pt-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 mb-2 block">Account Type</label>
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
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${formData.role === 'admin' ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 grayscale'}`}
                            >
                                <ShieldCheck className={`w-5 h-5 ${formData.role === 'admin' ? 'text-purple-500' : 'text-gray-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'admin' ? 'text-white' : 'text-gray-500'}`}>Admin</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full h-12 mt-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                        {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                        Already have account?{' '}
                        <Link to="/login" className="text-primary-500 hover:text-primary-400">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
