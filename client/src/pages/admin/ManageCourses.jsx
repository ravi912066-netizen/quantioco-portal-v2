import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, LayoutGrid, List, MoreVertical, X, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Development', thumbnail: '', instructor: '' });
    const navigate = useNavigate();

    const fetchCourses = async () => {
        try {
            const res = await API.get('/courses');
            setCourses(res.data);
        } catch (err) {
            toast.error('Failed to fetch courses');
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/courses', form);
            toast.success('Course created successfully');
            setShowModal(false);
            fetchCourses();
        } catch (err) {
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Course Management</h1>
                    <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest font-bold opacity-60">Control Center / Courses</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Course
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        className="input-field pl-12"
                        placeholder="Search courses by name or category..."
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-3 glass-card text-gray-400 hover:text-white transition-colors"><LayoutGrid className="w-5 h-5" /></button>
                    <button className="p-3 glass-card text-gray-400 hover:text-white transition-colors"><List className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="lg:col-span-3 py-20 text-center glass-card border-dashed">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium">No courses found. Start by creating one!</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <motion.div
                            key={course._id}
                            layout
                            className="glass-card overflow-hidden group hover:border-primary-500/20 transition-all"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'}
                                    alt={course.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="badge bg-primary-600 text-white uppercase tracking-tighter">{course.category}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{course.name}</h3>
                                    <button className="p-1 hover:bg-white/5 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">{course.description}</p>
                                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="text-lg font-bold text-white">₹{course.price}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/courses/${course._id}`)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-white/10"><ExternalLink className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors border border-white/10"><Edit2 className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-white/10"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-dark w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                                <h2 className="text-2xl font-bold">Create New Course</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Course Name</label>
                                        <input name="name" required className="input-field" placeholder="Complete Web Development Bootcamp" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Category</label>
                                        <select className="input-field appearance-none" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                            <option>Development</option>
                                            <option>DSA</option>
                                            <option>Cloud</option>
                                            <option>UI/UX</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Price (INR)</label>
                                        <input name="price" type="number" required className="input-field" placeholder="499" onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Instructor</label>
                                        <input name="instructor" required className="input-field" placeholder="Ravi Yadav" onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Thumbnail URL</label>
                                        <input name="thumbnail" className="input-field" placeholder="https://..." onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2 font-bold uppercase tracking-wider">Description</label>
                                        <textarea name="description" className="input-field min-h-[100px]" placeholder="Detailed description of the course..." onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Launch Course'}</button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

const BookOpen = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
);
