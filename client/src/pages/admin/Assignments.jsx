import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ClipboardList, Send, Clock, X, Terminal, ExternalLink, Award, Upload, Edit2, Trash2, Users } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function AdminAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', course: 'DSA', description: '', problemUrl: '', docUrl: '', xpReward: 20, deadline: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aRes, sRes] = await Promise.all([
                    API.get('/assignments'),
                    API.get('/assignments/submissions/all')
                ]);
                setAssignments(aRes.data);
                setSubmissions(sRes.data);
            } catch (err) {
                // Fallback or handle error
            }
        };
        fetchData();
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/assignments', form);
            toast.success('Assignment published!');
            setForm({ title: '', course: 'DSA', description: '', problemUrl: '', docUrl: '', xpReward: 20, deadline: '' });
            // re-fetch logic for simplicity
            const aRes = await API.get('/assignments');
            setAssignments(aRes.data);
            setActiveTab('tasks');
        } catch (err) {
            toast.error('Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Document must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, docUrl: reader.result });
                toast.success("Document attached successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Assignment Control Center</h1>
                    <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest font-bold opacity-60">Design tasks and track student submissions in real-time.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-primary-600 shadow-glow' : 'hover:bg-white/5'}`}
                    >
                        Assignments
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'submissions' ? 'bg-primary-600 shadow-glow' : 'hover:bg-white/5'}`}
                    >
                        Submissions
                    </button>
                </div>
            </div>

            {activeTab === 'tasks' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="glass-card p-8 border-primary-500/20 sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">New Coding Task</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Target Course</label>
                                    <input required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input-field py-2.5 text-sm" placeholder="e.g. DSA Mastery" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mission Title</label>
                                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field py-2.5 text-sm" placeholder="e.g. Newton's Apple Mystery" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Instruction Brief</label>
                                    <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field text-sm min-h-[100px]" placeholder="What should the student achieve?"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Problem Link</label>
                                        <input value={form.problemUrl} onChange={(e) => setForm({ ...form, problemUrl: e.target.value })} className="input-field py-2.5 text-sm" placeholder="LeetCode/CF URL" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex justify-between">
                                            Resource Doc / Sheet URL
                                            <label className="cursor-pointer text-primary-400 hover:text-primary-300 flex items-center gap-1 lowercase">
                                                <Upload className="w-3 h-3" /> upload file
                                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,image/*" />
                                            </label>
                                        </label>
                                        <input value={form.docUrl && form.docUrl.startsWith('data:') ? 'Attached Document (Base64 encoded)' : form.docUrl} onChange={(e) => setForm({ ...form, docUrl: e.target.value })} className="input-field py-2.5 text-sm" placeholder="URL or Upload File ->" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deadline</label>
                                        <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field py-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">XP Bounty</label>
                                        <input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} className="input-field py-2.5 text-sm" placeholder="20" />
                                    </div>
                                </div>
                                <button disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4">
                                    <Send className="w-4 h-4" /> Finalize Mission
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 glass-card border-dashed">
                                <Terminal className="w-12 h-12 text-gray-600 mb-4" />
                                <p className="text-gray-500">Waiting for mission deployment...</p>
                            </div>
                        ) : (
                            assignments.map(a => (
                                <div key={a._id} className="glass-card p-6 flex items-center justify-between group hover:border-primary-500/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-primary-400">
                                            <ClipboardList className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="badge bg-primary-600/20 text-primary-400 text-[10px]">{a.course}</span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter flex items-center gap-1">
                                                    <Award className="w-3 h-3" /> {a.xpReward} XP REWARD
                                                </span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter flex items-center gap-1 pl-2 border-l border-white/10">
                                                    <Users className="w-3 h-3" /> {a.attempting?.length || 0} ATTEMPTING
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-primary-300 transition-colors">{a.title}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                                        <button className="p-2 hover:bg-red-500/10 rounded-lg border border-white/5 transition-colors"><Trash2 className="w-4 h-4 text-red-400/60" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Cadet Info</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Task Mission</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Artifacts</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.length > 0 ? submissions.map(s => (
                                    <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs">
                                                    {s.student?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{s.student?.name}</p>
                                                    <p className="text-xs text-gray-500">{s.student?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{s.assignment?.title}</p>
                                            <p className="text-xs text-gray-500">{s.assignment?.course}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {s.code && <button className="p-1 px-2 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold">Code</button>}
                                                {s.solutionLink && <a href={s.solutionLink} target="_blank" className="p-1 px-2 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[10px] uppercase font-bold flex items-center gap-1">Live <ExternalLink className="w-2.5 h-2.5" /></a>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(s.submittedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <p className="text-gray-500 font-medium italic">Waiting for incoming responses...</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

