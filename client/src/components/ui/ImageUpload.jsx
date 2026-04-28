/**
 * ImageUpload
 * Reusable drag-and-drop image upload component.
 * Sends file to backend which uploads via Cloudinary.
 *
 * Props:
 *   uploadUrl   — string  — API endpoint to POST the file to
 *   fieldName   — string  — multipart field name (default: "image")
 *   onSuccess   — fn(url) — called with the resulting image URL
 *   accept      — string  — mime types (default: "image/*")
 *   maxSizeMB   — number  — max file size in MB (default: 10)
 *   label       — string  — label text
 *   currentUrl  — string  — existing image URL to preview
 *   multiple    — bool    — allow multiple files
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Image } from 'lucide-react';
import api from '../../services/api';

const ImageUpload = ({
  uploadUrl,
  fieldName   = 'image',
  onSuccess,
  accept      = 'image/*',
  maxSizeMB   = 10,
  label       = 'Upload Image',
  currentUrl  = null,
  multiple    = false,
}) => {
  const [preview,  setPreview]  = useState(currentUrl || null);
  const [progress, setProgress] = useState(0);  // 0–100
  const [status,   setStatus]   = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const validate = (file) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max ${maxSizeMB}MB.`;
    }
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      return `Invalid file type.`;
    }
    return null;
  };

  const handleFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;

    const err = validate(file);
    if (err) { setErrorMsg(err); setStatus('error'); return; }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      const form = new FormData();
      form.append(fieldName, file);

      const { data } = await api.post(uploadUrl, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      setStatus('success');
      setProgress(100);
      onSuccess?.(data);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.response?.data?.message || 'Upload failed. Try again.');
      setPreview(currentUrl || null);
    }
  }, [uploadUrl, fieldName, onSuccess, maxSizeMB, accept, currentUrl]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const clear = () => {
    setPreview(currentUrl || null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {label && (
        <div style={{
          fontFamily: 'monospace', fontSize: '0.625rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6b7a69', marginBottom: 8,
        }}>
          {label}
        </div>
      )}

      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
        animate={{ borderColor: dragging ? '#c2b280' : 'rgba(46,59,44,0.2)' }}
        style={{
          border: '2px dashed rgba(46,59,44,0.2)',
          borderRadius: 2,
          padding: 24,
          cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
          background: dragging ? 'rgba(194,178,128,0.05)' : 'white',
          transition: 'background 0.2s',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              maxHeight: 120, maxWidth: '100%', borderRadius: 2,
              objectFit: 'contain', marginBottom: 4,
            }}
          />
        )}

        {/* Status icon */}
        {status === 'idle' && !preview && (
          <>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'rgba(194,178,128,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {dragging ? <Upload size={20} style={{ color: '#c2b280' }} /> : <Image size={20} style={{ color: '#9ca3af' }} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 13, color: '#1f2a1d' }}>
                {dragging ? 'Drop to upload' : 'Click or drag & drop'}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7a69', marginTop: 2 }}>
                JPEG, PNG, WebP · max {maxSizeMB}MB
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a' }}>
            <CheckCircle size={14} />
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>Uploaded successfully</span>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626' }}>
            <AlertCircle size={14} />
            <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{errorMsg}</span>
          </div>
        )}

        {/* Progress bar */}
        <AnimatePresence>
          {status === 'uploading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', position: 'absolute', bottom: 0, left: 0 }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7a69', textAlign: 'center', marginBottom: 4 }}>
                Uploading... {progress}%
              </div>
              <div style={{ height: 3, background: '#f3f4f6', width: '100%' }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #d4af37, #c2b280)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Clear button */}
      {(preview || status !== 'idle') && status !== 'uploading' && (
        <button
          onClick={clear}
          style={{
            marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'monospace', fontSize: 10, color: '#6b7a69',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <X size={11} /> Reset
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default ImageUpload;
