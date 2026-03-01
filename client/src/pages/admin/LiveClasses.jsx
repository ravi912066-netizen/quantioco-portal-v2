import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, UserCheck, X, Link as LinkIcon, FileText, Send, Maximize } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { JitsiMeeting } from '@jitsi/react-sdk';
import AdminLayout from '../../components/layout/AdminLayout';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminLiveClasses() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);
    const [newMaterial, setNewMaterial] = useState({ title: '', link: '', type: 'note' });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const fetchClasses = async () => {
        try {
            const res = await API.get('/live-classes');
            setClasses(res.data);
            if (activeRoom) {
                const refreshedActive = res.data.find(c => c._id === activeRoom._id);
                if (refreshedActive) setActiveRoom(refreshedActive);
            }
        } catch (err) {
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        fetchClasses();
        const interval = setInterval(fetchClasses, 10000); // Poll for live attendees

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/live-classes', { title });
            setClasses([res.data, ...classes]);
            setTitle('');
            setIsCreating(false);
            toast.success('Live class created!');
        } catch (err) {
            toast.error('Failed to create class');
        }
    };

    const handleEndClass = async (id) => {
        try {
            await API.put(`/live-classes/${id}/end`);
            toast.success('Class ended');
            setActiveRoom(null);
            fetchClasses();
        } catch (err) {
            toast.error('Failed to end class');
        }
    };

    const handleJoinClass = (liveClass) => {
        setActiveRoom(liveClass);
    };

    const handleShareMaterial = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post(`/live-classes/${activeRoom._id}/materials`, newMaterial);
            setActiveRoom(res.data);
            setNewMaterial({ title: '', link: '', type: 'note' });
            toast.success('Material shared live!');
        } catch (err) {
            toast.error('Failed to share material');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        try {
            const res = await API.delete(`/live-classes/${activeRoom._id}/materials/${materialId}`);
            setActiveRoom(res.data);
        } catch (err) {
            toast.error('Failed to remove material');
        }
    };

    if (activeRoom) {
        return (
            <AdminLayout>
                <div ref={containerRef} className="h-[calc(100vh-6rem)] rounded-3xl overflow-hidden relative glass-card p-1 flex flex-col bg-dark-900">
                    <div className="bg-dark-800 p-4 flex justify-between items-center rounded-t-3xl border-b border-white/5">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeRoom.title}</h2>
                            <p className="text-xs text-primary-400 font-medium">Instructor: {user.name} • Live Attendees: {activeRoom.attendees?.length || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFullScreen}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Maximize className="w-4 h-4" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </button>
                            <button
                                onClick={() => handleEndClass(activeRoom._id)}
                                className="btn-primary bg-red-500 hover:bg-red-600 shadow-red-500/25 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> End Session
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-black flex">
                        <div className="flex-1">
                            <JitsiMeeting
                                roomName={activeRoom.roomName}
                                configOverwrite={{ startWithAudioMuted: true, startWithVideoMuted: true }}
                                interfaceConfigOverwrite={{ DISABLE_JOIN_LEAVE_NOTIFICATIONS: true }}
                                userInfo={{ displayName: user.name, email: user.email }}
                                getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
                            />
                        </div>

                        {/* Live Materials Panel */}
                        <div className="w-80 bg-dark-900 border-l border-white/5 flex flex-col h-full">
                            <div className="p-4 border-b border-white/5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary-500" /> Live Materials
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {activeRoom.materials?.length === 0 && (
                                    <p className="text-xs text-gray-500 text-center mt-10">No materials shared yet.</p>
                                )}
                                {activeRoom.materials?.map(m => (
                                    <div key={m._id} className="bg-white/5 border border-white/5 p-3 rounded-xl relative group">
                                        <button
                                            onClick={() => handleDeleteMaterial(m._id)}
                                            className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="flex items-start gap-2">
                                            {m.type === 'link' ? <LinkIcon className="w-4 h-4 text-secondary-400 mt-0.5" /> : <FileText className="w-4 h-4 text-primary-400 mt-0.5" />}
                                            <div>
                                                <p className="text-sm font-semibold text-white">{m.title}</p>
                                                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[10px] text-primary-400 font-bold uppercase tracking-widest hover:underline break-all block mt-1">Open Link</a>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleShareMaterial} className="p-4 border-t border-white/5 bg-dark-800 space-y-3">
                                <input
                                    required placeholder="Note / Link Title" className="input-field text-xs py-2"
                                    value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="input-field text-xs py-2 flex-1"
                                        value={newMaterial.type} onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                    >
                                        <option value="note">Note</option>
                                        <option value="link">URL</option>
                                    </select>
                                    <input
                                        placeholder={newMaterial.type === 'link' ? 'https://...' : 'Optional URL'}
                                        className="input-field text-xs py-2 flex-2"
                                        value={newMaterial.link} onChange={e => setNewMaterial({ ...newMaterial, link: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2">
                                    <Send className="w-3 h-3" /> Push to Class
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <header className="flex justify-between items-center glass-card p-6">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                            <Video className="w-8 h-8 text-primary-500" />
                            Live Sessions
                        </h1>
                        <p className="text-gray-400 mt-1 font-medium text-sm">Host and track live virtual classes globally.</p>
                    </div>
                    <button onClick={() => setIsCreating(!isCreating)} className="btn-primary flex items-center gap-2">
                        {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isCreating ? 'Cancel' : 'New Session'}
                    </button>
                </header>

                {isCreating && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 space-y-4"
                        onSubmit={handleCreateClass}
                    >
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Class Title / Topic</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Dynamic Programming Masterclass"
                                className="input-field"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">Start Broadcast</button>
                    </motion.form>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls) => (
                        <motion.div key={cls._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-white">{cls.title}</h3>
                                    {cls.status === 'active' ? (
                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-black uppercase rounded-lg border border-red-500/30 animate-pulse">Live</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-black uppercase rounded-lg border border-gray-500/30">Ended</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary-400" />
                                    {cls.attendees.length} Student(s) attended
                                </p>
                            </div>
                            {cls.status === 'active' && (
                                <button onClick={() => handleJoinClass(cls)} className="btn-primary w-full mt-4 flex justify-center gap-2">
                                    <Video className="w-4 h-4" /> Join Room
                                </button>
                            )}
                        </motion.div>
                    ))}
                    {!loading && classes.length === 0 && (
                        <div className="col-span-full text-center p-12 glass-card">
                            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Live Sessions</h3>
                            <p className="text-gray-400">Create a new session to start broadcasting.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
