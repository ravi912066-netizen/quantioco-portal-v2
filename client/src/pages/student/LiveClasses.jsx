import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, UserCheck, Play, Link as LinkIcon, FileText, Maximize } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { JitsiMeeting } from '@jitsi/react-sdk';
import StudentLayout from '../../components/layout/StudentLayout';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentLiveClasses() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const fetchClasses = async () => {
        try {
            const res = await API.get('/live-classes');
            setClasses(res.data);

            // Auto close room if the current class was ended by the admin
            if (activeRoom) {
                const stillActive = res.data.find(c => c._id === activeRoom._id && c.status === 'active');
                if (!stillActive) setActiveRoom(null);
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
        const interval = setInterval(fetchClasses, 10000); // Poll for live updates

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [activeRoom]);

    const handleJoinClass = async (liveClass) => {
        try {
            // Track attendance on backend
            await API.post(`/live-classes/${liveClass._id}/join`);
            setActiveRoom(liveClass);
        } catch (err) {
            toast.error('Failed to join class. It may have ended.');
        }
    };

    if (activeRoom) {
        return (
            <StudentLayout>
                <div ref={containerRef} className="h-[calc(100vh-6rem)] rounded-3xl overflow-hidden relative glass-card p-1 flex flex-col border border-primary-500/20 shadow-glow bg-dark-900">
                    <div className="bg-dark-800 p-4 flex justify-between items-center rounded-t-3xl border-b border-white/5">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {activeRoom.title}
                            </h2>
                            <p className="text-xs text-primary-400 font-medium">Host: {activeRoom.instructor?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFullScreen}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Maximize className="w-4 h-4" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </button>
                            <button
                                onClick={() => setActiveRoom(null)}
                                className="btn-primary bg-red-500 hover:bg-red-600 shadow-red-500/25 flex items-center gap-2"
                            >
                                Disconnect
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
                                    <p className="text-xs text-gray-500 text-center mt-10">Waiting for instructor to share notes...</p>
                                )}
                                {activeRoom.materials?.map(m => (
                                    <div key={m._id} className="bg-white/5 border border-white/5 p-3 rounded-xl relative group">
                                        <div className="flex items-start gap-2">
                                            {m.type === 'link' ? <LinkIcon className="w-4 h-4 text-secondary-400 mt-0.5" /> : <FileText className="w-4 h-4 text-primary-400 mt-0.5" />}
                                            <div>
                                                <p className="text-sm font-semibold text-white">{m.title}</p>
                                                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[10px] text-primary-400 font-bold uppercase tracking-widest hover:underline break-all block mt-1">Open Link / View Note</a>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <header className="glass-card p-6">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        <Video className="w-8 h-8 text-primary-500" />
                        Live Arena
                    </h1>
                    <p className="text-gray-400 mt-1 font-medium text-sm">Join ongoing live masterclasses hosted by instructors.</p>
                </header>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls) => (
                        <motion.div key={cls._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex flex-col justify-between border border-primary-500/10 hover:border-primary-500/30 transition-all group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{cls.title}</h3>
                                        <p className="text-xs text-primary-500 font-black uppercase mt-1">By {cls.instructor?.name}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-black uppercase rounded-lg border border-red-500/30 animate-pulse">Live Now</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary-400" />
                                    {cls.attendees.length} Student(s) Inside
                                </p>
                            </div>
                            <button onClick={() => handleJoinClass(cls)} className="btn-primary w-full mt-4 flex justify-center gap-2 relative overflow-hidden group/join animate-pulse-slow border border-primary-400/50">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/join:animate-[shimmer_1.5s_infinite]"></span>
                                <Play className="w-4 h-4" /> Enter Room
                            </button>
                        </motion.div>
                    ))}
                    {!loading && classes.length === 0 && (
                        <div className="col-span-full text-center p-12 glass-card">
                            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Active Streams</h3>
                            <p className="text-gray-400">There are no live masterclasses going on right now. Check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
