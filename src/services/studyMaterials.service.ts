import { USE_MOCK } from '../config/appConfig';
import api, { BASE_URL } from './api';

const API_PREFIX = '/api/v1';

const realStudyMaterialsService = {
  getMaterials: async () => {
    const { data: publicData } = await api.get('/tenants/public/study-materials');
    const publicList = Array.isArray(publicData) ? publicData : [];
    if (publicList.length > 0) {
      return { data: publicList };
    }
    return api.get('/study-materials');
  },
  getAccessStatus: () => api.get('/study-materials/access-status'),
  getPreviewUrl: (materialId: string) =>
    `${BASE_URL}${API_PREFIX}/tenants/public/study-materials/${materialId}/preview`,
  getDownloadMeta: (materialId: string) =>
    api.get(`/study-materials/${materialId}/download`),
};

const mockStudyMaterialsService = {
  getMaterials: async () => ({ data: [] }),
  getAccessStatus: async () => ({ data: { enrolled: true } }),
  getPreviewUrl: (materialId: string) =>
    `${BASE_URL}${API_PREFIX}/tenants/public/study-materials/${materialId}/preview`,
  getDownloadMeta: async (materialId: string) => ({
    data: { downloadUrl: `https://example.com/materials/${materialId}.pdf` },
  }),
};

export const studyMaterialsService = USE_MOCK
  ? mockStudyMaterialsService
  : realStudyMaterialsService;
