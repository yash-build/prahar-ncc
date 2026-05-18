const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [target, replacement] of replacements) {
    content = content.replace(target, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. HonorRoll.jsx fixes
const honorRollPath = path.join(__dirname, '../client/src/pages/dashboard/HonorRoll.jsx');
replaceInFile(honorRollPath, [
  [
    `const [cadets, setCadets] = useState([]);`,
    `const [cadets, setCadets] = useState([]);\n  const [reason, setReason] = useState('');\n  const [quote, setQuote] = useState('');`
  ],
  [
    `<input className="input" placeholder="Search by name or service number..."`,
    `<input className="input" placeholder="Search by name or service number..."`
  ],
  [
    `const add = async (cadet) => {`,
    `const add = async (cadet) => {\n    if (!reason || !quote) return toast.error('Please provide a reason and a quote.');`
  ],
  [
    `{ isHonorRoll: true }`,
    `{ isHonorRoll: true, honorRollReason: reason, honorRollQuote: quote }`
  ],
  [
    `{/* Search */}`,
    `{/* Reason & Quote Inputs */}\n        <div className="px-6 py-3 border-b border-stone-100 flex gap-2">\n          <input className="input text-xs" placeholder="Reason (e.g. Best Drill)" value={reason} onChange={e=>setReason(e.target.value)} />\n          <input className="input text-xs" placeholder="Quote" value={quote} onChange={e=>setQuote(e.target.value)} />\n        </div>\n        {/* Search */}`
  ],
  [
    `"{c.yearbookMessage}"`,
    `"{c.yearbookMessage || c.honorRollQuote}"`
  ],
  [
    `{c.wing} Wing · Yr {c.yearOfStudy}</div>`,
    `{c.wing} Wing · Yr {c.yearOfStudy}</div>\n                  {c.isHonorRoll && c.honorRollReason && <div className="font-mono text-xs text-olive-dark mb-1 font-semibold">{c.honorRollReason}</div>}`
  ]
]);

// 2. Attendance Lock Backend
const attCtrlPath = path.join(__dirname, '../server/controllers/attendanceController.js');
replaceInFile(attCtrlPath, [
  [
    `session.isSubmitted = true;`,
    `session.isSubmitted = true;\n    session.isLocked = true; // Permanently lock`
  ],
  [
    `if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });`,
    `if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });\n    if (session.isLocked) return res.status(403).json({ success: false, message: 'Session is permanently locked.' });`
  ]
]);

// 3. Attendance Lock Frontend
const attPagePath = path.join(__dirname, '../client/src/pages/dashboard/AttendancePage.jsx');
replaceInFile(attPagePath, [
  [
    `session.isSubmitted`,
    `session.isLocked || session.isSubmitted`
  ]
]);

// 4. ANO Notice Approval UI
const noticesPagePath = path.join(__dirname, '../client/src/pages/dashboard/NoticesPage.jsx');
replaceInFile(noticesPagePath, [
  [
    `</div>\n              <div className="flex flex-col items-end gap-2 shrink-0">`,
    `</div>\n              <div className="flex flex-col items-end gap-2 shrink-0">\n                {isANO && n.status === 'PENDING_APPROVAL' && (\n                  <div className="flex gap-2">\n                    <button onClick={(e) => { e.stopPropagation(); api.put('/notices/'+n._id+'/approve').then(() => fetchNotices()); }} className="badge-green cursor-pointer">Approve</button>\n                    <button onClick={(e) => { e.stopPropagation(); api.put('/notices/'+n._id+'/reject').then(() => fetchNotices()); }} className="badge-red cursor-pointer">Reject</button>\n                  </div>\n                )}`
  ]
]);

// 5. Public Honor Roll Reason UI
const landingPath = path.join(__dirname, '../client/src/pages/public/Landing.jsx');
replaceInFile(landingPath, [
  [
    `{c.rank} · {c.wing}</div>`,
    `{c.rank} · {c.wing}</div>\n                    {c.honorRollReason && <div className="font-mono text-xs text-olive-dark mt-1 truncate">{c.honorRollReason}</div>}`
  ]
]);

console.log('Patching complete');
