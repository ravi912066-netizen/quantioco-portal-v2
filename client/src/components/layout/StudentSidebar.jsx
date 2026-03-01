import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, BookOpen, ClipboardList, Code2, Trophy,
    Calendar, User, LogOut, GraduationCap, Flame, Video
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/live', label: 'Live Sessions', icon: Video },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/problems', label: 'Problem Tracker', icon: Code2 },
    { to: '/contests', label: 'Contest Calendar', icon: Calendar },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'My Profile', icon: User },
];

export default function StudentSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="w-60 min-h-screen bg-dark-800 border-r border-white/5 flex flex-col"
        >
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg gradient-text">Quantioco.io</h1>
                        <p className="text-xs text-gray-500">Student Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 mx-3 mt-4 glass-card">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'S'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{user?.name || 'Student'}</p>
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <span>⚡</span>
                            <span>{user?.xp || 0} XP</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 text-xs">
                        <Flame className="w-3 h-3" />
                        <span>{user?.streak || 0}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs text-gray-600 font-semibold uppercase tracking-wider mb-3">Navigation</p>
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </motion.aside>
    );
}
