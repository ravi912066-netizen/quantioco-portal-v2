import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function AdminAssignments() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await API.get('/courses');
                setCourses(res.data);
            } catch (err) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Command Desktops</h1>
                    <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest font-bold opacity-60">Select a course to open its dedicated assignment desktop.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input className="input-field pl-10 h-10 w-full text-sm" placeholder="Search domains..." />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 skeleton"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <motion.div
                            layout
                            key={course._id}
                            whileHover={{ y: -10 }}
                            className="glass-card group overflow-hidden border-transparent hover:border-primary-500/30 transition-all cursor-pointer"
                            onClick={() => navigate(`/courses/${course._id}`)}
                        >
                            <div className="h-44 relative overflow-hidden">
                                <img
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="badge bg-black/60 backdrop-blur-md text-[10px] uppercase font-black text-primary-400 border border-primary-500/20 px-3">
                                        {course.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex-1 text-center bg-primary-600 text-white py-2 rounded-lg font-bold text-xs uppercase shadow-glow shadow-primary-500/50 flex flex-col items-center gap-1">
                                        Open Desktop <ExternalLink className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">{course.name}</h3>
                                <p className="text-gray-400 text-xs line-clamp-2">{course.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

