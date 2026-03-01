import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, FileText, ChevronRight, Lock,
    CheckCircle2, Clock, Share2, MessageSquare, Plus, Video, Code, Award, QrCode
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [showDoubtModal, setShowDoubtModal] = useState(false);
    const [doubtText, setDoubtText] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentRequested, setEnrollmentRequested] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const { user, updateUser } = useAuth();

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const [courseRes, assignRes, subRes] = await Promise.all([
                    API.get(`/courses/${id}`),
                    API.get('/assignments'),
                    user?.role === 'student' ? API.get('/assignments/submissions/me') : { data: [] }
                ]);
                const cData = courseRes.data;
                setCourse(cData);

                // Filter assignments for this course by course name or ID
                setAssignments(assignRes.data.filter(a => a.course === cData.name || a.course === cData._id));
                setSubmittedTasks(subRes.data.map(s => s.assignment?._id));

                if (user?.enrolledCourses?.includes(cData._id)) {
                    setIsEnrolled(true);
                    if (cData.lectures?.length > 0) {
                        setActiveLecture(cData.lectures[0]);
                    }
                }
            } catch (err) {
                // Fallback for demo
            }
        };
        if (user) fetchCourseData();
    }, [id, user]);

    const handleAskDoubt = async () => {
        try {
            await API.post('/doubts', { question: doubtText, course: course.name });
            toast.success('Your doubt has been submitted to mentors!');
            setShowDoubtModal(false);
            setDoubtText('');
        } catch (err) {
            toast.error('Failed to submit doubt');
        }
    };

    const handleUpiPayment = async () => {
        try {
            await API.post('/payments/enroll', { courseId: course._id, amount: course.price });
            setIsEnrolled(true);
            toast.success('Payment received! Course unlocked instantly. 🚀');
            if (course.lectures?.length > 0) {
                setActiveLecture(course.lectures[0]);
            }
            // Update local user context so it persists
            updateUser({ ...user, enrolledCourses: [...(user.enrolledCourses || []), course._id] });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment initiation failed');
        }
    };

    const handleFreeEnrollment = async () => {
        try {
            await API.post(`/courses/${course._id}/enroll`);
            setIsEnrolled(true);
            toast.success('Course unlocked instantly for free!');
            if (course.lectures?.length > 0) {
                setActiveLecture(course.lectures[0]);
            }
            // Update local user context so it persists
            updateUser({ ...user, enrolledCourses: [...(user.enrolledCourses || []), course._id] });
        } catch (err) {
            toast.error('Failed to enroll');
        }
    };

    if (!course) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="skeleton w-64 h-64"></div></div>;

    // Payment Required View
    if (!isEnrolled && user?.role !== 'admin') {
        // Use admin's actual UPI ID
        const upiId = "7379078059@ybl";
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}&pn=Ravi%20Yadav&am=${course.price}&cu=INR`;

        return (
            <StudentLayout>
                <div className="max-w-2xl mx-auto mt-10">
                    <div className="glass-card p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>

                        <div className="mb-8">
                            <span className="badge bg-primary-500/20 text-primary-400 font-black uppercase tracking-widest text-[10px] mb-4 border border-primary-500/30">Restricted Access</span>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{course.name}</h1>
                            <p className="text-gray-400">Unlock full access to lectures, assignments, and mentorship.</p>
                        </div>

                        {enrollmentRequested ? (
                            <div className="bg-green-500/10 border-2 border-green-500/30 p-8 rounded-3xl mb-8 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Request Transmitted!</h3>
                                <p className="text-gray-400 text-sm">Waiting for Admin to verify your UPI payment and grant access.</p>
                            </div>
                        ) : course.price === 0 || !course.price ? (
                            <div className="bg-primary-500/10 border border-primary-500/30 p-8 rounded-3xl mb-8 flex flex-col items-center">
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">100% Free Access</h3>
                                <p className="text-gray-400 text-sm mb-6">This course is currently available for free. Jump right in!</p>
                                <button onClick={handleFreeEnrollment} className="btn-primary w-full h-14 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.2em] shadow-glow">
                                    Start Learning Now <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-black/40 border border-white/5 p-8 rounded-3xl mb-8 flex flex-col items-center">
                                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-primary-400" /> UPI Payment Processing
                                </h3>
                                <div className="p-4 bg-white rounded-2xl mb-6 shadow-glow shadow-primary-500/20">
                                    <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
                                </div>
                                <div className="text-center mb-6">
                                    <p className="text-xl font-black text-white mb-1">₹{course.price}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scan with GPay/PhonePe to pay</p>
                                </div>
                                <button onClick={handleUpiPayment} className="btn-primary w-full h-14 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
                                    I Have Paid via UPI <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-left border-t border-white/5 pt-8">
                            <div className="space-y-1">
                                <div className="text-primary-400"><Play className="w-4 h-4" /></div>
                                <p className="text-xs font-bold text-white uppercase">HD Lectures</p>
                                <p className="text-[10px] text-gray-500">Full access to curriculum</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-purple-400"><Code className="w-4 h-4" /></div>
                                <p className="text-xs font-bold text-white uppercase">Assignments</p>
                                <p className="text-[10px] text-gray-500">Live code submissions</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-yellow-400"><Award className="w-4 h-4" /></div>
                                <p className="text-xs font-bold text-white uppercase">Certification</p>
                                <p className="text-[10px] text-gray-500">Upon completion</p>
                            </div>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Main Content: Player + Content */}
                <div className="lg:col-span-2 flex-1 space-y-8">
                    {/* Video Player Section */}
                    <div className="glass-card overflow-hidden bg-black border-white/5 relative aspect-video group">
                        {activeLecture?.videoUrl ? (
                            <iframe
                                className="w-full h-full"
                                src={activeLecture.videoUrl.replace('watch?v=', 'embed/')}
                                title="video player"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <div className="w-20 h-20 rounded-full animated-gradient flex items-center justify-center p-0.5">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                        <Play className="w-8 h-8 text-primary-500 translate-x-1" />
                                    </div>
                                </div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Waiting for Content Stream...</p>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{activeLecture?.title || 'Select a lesson to start'}</h2>
                                        <p className="text-primary-400 text-sm font-bold flex items-center gap-2 mt-1">
                                            <Video className="w-4 h-4" /> MODULE 1: INTRODUCTION
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs and Info */}
                    <div className="glass-card p-8">
                        <div className="flex gap-8 border-b border-white/5 mb-8 overflow-x-auto">
                            {['Overview', 'Lecture Notes', 'Assignments', 'Student Doubts', ...(user?.role === 'admin' ? ['Enrolled Cadets'] : [])].map((tab, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-white'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {activeTab === 'Overview' && (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{activeLecture?.title || course.name}</h2>
                                        <p className="text-gray-400 leading-relaxed text-sm max-w-2xl">{course.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 glass-card hover:bg-white/5 transition-colors"><Share2 className="w-4 h-4" /></button>
                                        <button onClick={() => setShowDoubtModal(true)} className="flex items-center gap-2 btn-secondary py-2 text-xs uppercase font-bold">
                                            <MessageSquare className="w-4 h-4" /> Ask Mentors
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Lecture Notes' && (
                                <div className="py-8 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No notes available for this lecture yet.</p>
                                </div>
                            )}

                            {activeTab === 'Assignments' && (
                                <div className="space-y-4">
                                    {assignments.length > 0 ? assignments.map(a => (
                                        <div key={a._id} className="p-4 glass-card bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                                    <Code className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{a.title}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{a.xpReward} XP Reward</span>
                                                        {submittedTasks.includes(a._id) && (
                                                            <span className="text-[10px] text-green-400 font-black tracking-widest uppercase bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30">Submitted</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <a href={`/assignments`} className="badge bg-primary-500 text-white font-black uppercase tracking-widest transition-transform hover:scale-105">
                                                {submittedTasks.includes(a._id) ? 'View Lab' : 'Start Lab'}
                                            </a>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No active assignments for this course.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Student Doubts' && (
                                <div className="py-8 text-center text-gray-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Be the first to ask a question!</p>
                                    <button onClick={() => setShowDoubtModal(true)} className="btn-secondary mt-4 text-xs">Ask Mentor</button>
                                </div>
                            )}

                            {activeTab === 'Enrolled Cadets' && user?.role === 'admin' && (
                                <div className="space-y-4">
                                    {course.enrolledStudents?.length > 0 ? course.enrolledStudents.map(studentId => (
                                        <div key={studentId} className="p-4 glass-card bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                                                    S
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">Verified Cadet</h4>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5 max-w-[200px] truncate">{studentId}</p>
                                                </div>
                                            </div>
                                            <a href={`/admin/students`} className="btn-secondary text-xs">View Profile</a>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No cadets enrolled in this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coding Environment Prompt (as per UI reference) */}
                    <div className="glass-card p-1 bg-gradient-to-r from-primary-600/20 to-purple-600/20 shadow-glow shadow-primary-500/10">
                        <div className="bg-dark-900 rounded-xl p-8 flex items-center justify-between border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Code className="w-8 h-8 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Integrated Sandbox Environment</h3>
                                    <p className="text-gray-500 text-sm">Practice code directly as you learn. No setup required.</p>
                                </div>
                            </div>
                            <button className="btn-primary text-xs uppercase tracking-widest relative z-10">
                                Open Lab <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Content List */}
                <aside className="w-full lg:w-96 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Course Curriculum</h3>
                            <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded">20% DONE</span>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {course.lectures?.map((lecture, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveLecture(lecture)}
                                    className={`w-full flex items-start gap-4 p-5 hover:bg-white/5 transition-colors text-left group ${activeLecture?._id === lecture._id ? 'bg-primary-600/10 border-r-4 border-primary-500' : ''}`}
                                >
                                    <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${i === 0 ? 'bg-green-500 border-green-500' : i === 1 ? 'border-primary-500' : 'border-gray-700'}`}>
                                        {i === 0 ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate group-hover:text-primary-300 transition-colors ${activeLecture?._id === lecture._id ? 'text-primary-400' : 'text-gray-300'}`}>
                                            {lecture.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold text-gray-600">
                                            <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">{lecture.duration || '12:00'}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Locked Modules */}
                            <div className="p-5 flex items-start gap-4 opacity-40 bg-white/5 grayscale">
                                <div className="mt-1 h-6 w-6 rounded-full border-2 border-gray-700 flex items-center justify-center shrink-0">
                                    <Lock className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500">Module 2: Advanced Patterns</p>
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1 block">Locked by Teacher</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Action or Reward Card */}
                    {user?.role === 'admin' ? (
                        <div className="glass-card p-6 bg-primary-500/10 border-primary-500/20 text-center relative overflow-hidden">
                            <div className="absolute top-[-50%] right-[-50%] w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
                            <Video className="w-10 h-10 text-primary-400 mx-auto mb-4" />
                            <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-xl">Host Live Class</h4>
                            <p className="text-gray-400 text-xs mb-6 font-medium">Launch a real-time collaborative video session for the enrolled cadets.</p>
                            <a href="/admin/live" className="btn-primary w-full text-xs flex justify-center uppercase tracking-widest font-black">
                                Configure Room
                            </a>
                        </div>
                    ) : (
                        <div className="glass-card p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-glow shadow-yellow-500/50">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-bold text-white">Course Reward</h4>
                            </div>
                            <p className="text-gray-400 text-xs mb-6">Complete all lectures and assignments to unlock your certificate and <span className="text-yellow-400 font-bold underline">+500 XP bonus</span>.</p>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 rounded-full bg-dark-600 overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-1/5 shadow-glow shadow-yellow-500/20"></div>
                                </div>
                                <span className="text-[10px] font-bold">20%</span>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Doubt Modal */}
            <AnimatePresence>
                {showDoubtModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card-dark w-full max-w-lg p-8">
                            <h2 className="text-2xl font-bold mb-2">Ask mentors a doubt</h2>
                            <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest font-bold">You will receive an answer within 4 hours.</p>
                            <textarea
                                className="input-field min-h-[150px] mb-6 text-sm"
                                placeholder="Describe your issue in detail..."
                                onChange={(e) => setDoubtText(e.target.value)}
                            ></textarea>
                            <div className="flex gap-4">
                                <button onClick={handleAskDoubt} className="btn-primary flex-1">Send Doubt</button>
                                <button onClick={() => setShowDoubtModal(false)} className="btn-secondary flex-1">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
