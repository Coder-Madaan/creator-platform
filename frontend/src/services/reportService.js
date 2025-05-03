import api from './api';

const reportPost = async (postId, reason, postData) => {
  const response = await api.post('/api/reports', {
    postId,
    reason,
    postData
  });
  return response.data;
};

const getReportedPosts = async () => {
  const response = await api.get('/api/reports');
  return response.data;
};

const updateReportStatus = async (reportId, status) => {
  const response = await api.put(`/api/reports/${reportId}`, { status });
  return response.data;
};

export const reportService = {
  reportPost,
  getReportedPosts,
  updateReportStatus
};