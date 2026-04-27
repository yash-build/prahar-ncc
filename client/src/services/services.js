/**
 * cadetService.js
 */
import api from './api';

export const cadetService = {
  getAll:       (params = {}) => api.get('/cadets', { params }),
  getOne:       (id)          => api.get(`/cadets/${id}`),
  create:       (formData)    => api.post('/cadets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, formData)=> api.put(`/cadets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:       (id)          => api.delete(`/cadets/${id}`),
  toggleHonor:  (id, note)    => api.patch(`/cadets/${id}/honor`, { honorNote: note }),
  updateMessage:(id, message) => api.patch(`/cadets/${id}/message`, { message }),
  getDefaulters:()            => api.get('/cadets/defaulters'),
};

/**
 * attendanceService.js
 */
export const attendanceService = {
  getSessions:    (params = {})           => api.get('/attendance/sessions', { params }),
  getSession:     (id)                    => api.get(`/attendance/sessions/${id}`),
  createSession:  (data)                  => api.post('/attendance/sessions', data),
  markAttendance: (sessionId, updates)    => api.patch(`/attendance/sessions/${sessionId}/mark`, { updates }),
  bulkMark:       (sessionId, status)     => api.patch(`/attendance/sessions/${sessionId}/bulk`, { status }),
  toggleLock:     (sessionId)             => api.patch(`/attendance/sessions/${sessionId}/lock`),
  getCadetHistory:(cadetId)               => api.get(`/attendance/cadet/${cadetId}`),
};

/**
 * noticeService.js
 */
export const noticeService = {
  getAll:   (params = {}) => api.get('/notices', { params }),
  create:   (data)        => api.post('/notices', data),
  update:   (id, data)    => api.put(`/notices/${id}`, data),
  remove:   (id)          => api.delete(`/notices/${id}`),
};

/**
 * achievementService.js
 */
export const achievementService = {
  getForCadet:  (cadetId)  => api.get(`/achievements/cadet/${cadetId}`),
  getRecent:    ()          => api.get('/achievements/recent'),
  add:          (data)      => api.post('/achievements', data),
  update:       (id, data)  => api.put(`/achievements/${id}`, data),
  remove:       (id)        => api.delete(`/achievements/${id}`),
};
