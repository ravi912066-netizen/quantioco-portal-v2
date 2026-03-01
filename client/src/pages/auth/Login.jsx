import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
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
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                        Quantioco<span className="text-primary-500">.io</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input
                                type="email" required
                                className="input-field pl-12 h-12 text-sm"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                            <input
                                type="password" required
                                className="input-field pl-12 h-12 text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                        {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                        No account?{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400">
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
