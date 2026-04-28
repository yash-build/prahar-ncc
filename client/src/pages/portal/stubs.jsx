// Reusable stub component generator for portal pages
const stub = (title, icon, sub) => {
  const Page = () => (
    <div className="page-shell">
      <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div><h1 className="section-title">{title}</h1></div>
      <div className="card p-16 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <div className="font-heading font-bold text-olive-dark text-xl mb-2">{title}</div>
        <div className="font-mono text-sm text-olive-muted">{sub}</div>
      </div>
    </div>
  );
  return Page;
};

export const MyAttendance   = stub('My Attendance Record',   '📋', 'Your full attendance history will appear here once the ANO begins marking sessions.');
export const MyNotices      = stub('Notices',                '📢', 'All notices from the ANO are published here. Check regularly for important updates.');
export const MyEvents       = stub('Events & Camps',         '🏕️', 'Upcoming training camps, competitions, and events you are eligible for.');
export const MyAchievements = stub('My Achievements',        '🏆', 'Awards, certificates, and recognitions logged to your profile.');
export const MyCertificates = stub('My Certificates',        '📜', 'Download your A/B/C certificate upon approval by your ANO.');
export const MyProfile      = stub('My Profile',             '👤', 'View and update your personal information, contact details, and yearbook message.');
