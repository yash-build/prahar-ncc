const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'client', 'src');

const files = [
  'components/ui/RankBadge.jsx',
  'components/ui/WingBadge.jsx',
  'components/ui/StatusDot.jsx',
  'components/ui/AttendanceBar.jsx',
  'components/ui/PriorityBadge.jsx',
  'components/ui/LevelBadge.jsx',
  'components/ui/ConfirmDialog.jsx',
  'components/ui/SkeletonCard.jsx',
  'components/ui/EmptyState.jsx',
  'components/cadet/CadetCard.jsx',
  'components/cadet/CadetDetailPanel.jsx',
  'components/cadet/AddCadetModal.jsx',
  'components/cadet/EditCadetForm.jsx',
  'components/attendance/SessionSetupModal.jsx',
  'components/attendance/AttendanceMarkingList.jsx',
  'components/attendance/AttendanceRow.jsx',
  'components/attendance/MonthlyAttendanceTable.jsx',
  'components/notice/NoticeCard.jsx',
  'components/notice/NoticeForm.jsx',
  'components/notice/NoticeFeed.jsx',
  'components/gallery/GalleryGrid.jsx',
  'components/gallery/GalleryUpload.jsx',
  'components/gallery/PhotoLightbox.jsx',
  'components/public/HeroSection.jsx',
  'components/public/ANOSection.jsx',
  'components/public/HierarchySection.jsx',
  'components/public/YearbookPreview.jsx',
  'components/public/GalleryPreview.jsx',
  'components/public/AchievementsWall.jsx',
  'components/public/NoticeBoard.jsx',
  'components/yt/YTCommandCenter.jsx',
  'components/yt/YTPageEditor.jsx',
  'components/yt/YTSectionEditor.jsx',
  'components/yt/YTColorPicker.jsx',
  'components/yt/YTFontEditor.jsx',
  'components/yt/YTImageReplacer.jsx',
  'components/yt/YTTextEditor.jsx',
  'components/yt/YTLayoutEditor.jsx',
  'components/yt/YTSaveBar.jsx',
  'hooks/useAuth.js',
  'hooks/useDebounce.js',
  'hooks/useOffline.js',
  'hooks/useYT.js',
  'utils/constants.js',
  'utils/formatters.js',
  'utils/validators.js',
  'utils/pdfExport.js',
  'services/authService.js',
  'services/cadetService.js',
  'services/attendanceService.js',
  'services/noticeService.js',
  'services/achievementService.js',
  'services/galleryService.js',
  'services/reportService.js',
];

files.forEach(file => {
  const fullPath = path.join(baseDir, file);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const ext = path.extname(file);
  let content = '';
  
  if (ext === '.jsx') {
    const name = path.basename(file, '.jsx');
    content = `const ${name} = () => { return <div>${name}</div>; };\nexport default ${name};`;
  } else if (ext === '.js') {
    const name = path.basename(file, '.js');
    if (file.startsWith('hooks/')) {
      content = `export const ${name} = () => {};`;
    } else if (file.startsWith('services/')) {
      content = `export const ${name} = {};\nexport default ${name};`;
    } else {
      content = `export const dummy = '${name}';`;
    }
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`Created ${file}`);
  }
});
