import { motion } from 'framer-motion';
import AnimatedPage from '../../components/layout/AnimatedPage';

const stubs = [
  { title: 'Gallery Management', icon: '🖼️', desc: 'Upload and manage camp photos, events and NCC gallery items. Photos can be published to the public gallery page.' },
];

const GalleryManage = () => (
  <AnimatedPage className="page-shell">
    <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">MEDIA</div><h1 className="section-title">Gallery Management</h1></div>
    <div className="card p-12 text-center">
      <div className="text-6xl mb-6">🖼️</div>
      <h2 className="font-heading font-bold text-olive-dark text-2xl mb-3">Gallery Module</h2>
      <p className="text-olive-muted text-sm max-w-md mx-auto mb-8">Upload photos from camps, parades, and events. Photos published here will appear on the public gallery page.</p>
      <div className="border-2 border-dashed border-olive/20 rounded-sm p-10 text-olive-muted font-mono text-xs">
        Cloudinary upload integration — add your Cloudinary credentials to server/.env to enable photo uploads.
      </div>
    </div>
  </AnimatedPage>
);
export default GalleryManage;
