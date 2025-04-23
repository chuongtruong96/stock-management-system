import api from './api';
export const fetchSummaries = (deptId, from, to) =>
  api.get('/summaries', { params: { deptId, from, to } });