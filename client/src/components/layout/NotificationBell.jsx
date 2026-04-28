import { useState, useEffect } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifs = async () => {
    try {
      // Assuming a general notice fetch works for now
      const res = await api.get('/notices', { params: { isPublic: true, limit: 5 } });
      if (res.data.success) {
        // Mock unread count based on random logic or local storage for now
        // Ideally backend would support /api/notifications
        const recent = res.data.notices.slice(0, 5);
        setNotifs(recent);
        setUnread(Math.floor(Math.random() * 3)); // Placeholder for actual unread logic
      }
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllRead = () => {
    setUnread(0);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[#c8b98a] hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        {unread > 0 ? <BellRing size={20} className="animate-[wiggle_1s_ease-in-out_infinite]" /> : <Bell size={20} />}
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1a1d16] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-[#1a1d16] border border-[#4a5240] rounded-sm shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-[#4a5240] flex items-center justify-between bg-[#2c3128]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#dde3d8]">Comm Center</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-mono text-[#c8b98a] hover:text-white transition-colors">
                  <Check size={12} /> MARK READ
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="p-6 text-center text-[#7a8a6e] font-mono text-xs">
                  NO INCOMING TRANSMISSIONS
                </div>
              ) : (
                notifs.map((n, i) => (
                  <div key={n._id || i} className="p-3 border-b border-[#4a5240]/50 hover:bg-[#2c3128] transition-colors cursor-pointer">
                    <div className="flex gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i < unread ? 'bg-gold shadow-[0_0_5px_rgba(212,175,55,0.8)]' : 'bg-[#4a5240]'}`} />
                      <div>
                        <p className="text-sm font-semibold text-[#dde3d8] leading-tight mb-1">{n.title}</p>
                        <p className="text-xs text-[#7a8a6e] line-clamp-2 leading-relaxed">{n.content}</p>
                        <p className="text-[10px] font-mono text-[#c8b98a] mt-2 opacity-70">
                          {new Date(n.createdAt || Date.now()).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-[#4a5240] bg-[#2c3128] text-center">
              <button className="text-[10px] font-mono tracking-widest text-[#c8b98a] hover:text-white transition-colors w-full uppercase">
                View All Logs
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
