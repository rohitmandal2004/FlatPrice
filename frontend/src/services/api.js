import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const predictPrice = async (predictionData) => {
  const response = await apiClient.post('/predict', predictionData);
  return response.data;
};

export const getModelInfo = async () => {
  const response = await apiClient.get('/model-info');
  return response.data;
};

export const getDatasetStats = async () => {
  const response = await apiClient.get('/dataset-stats');
  return response.data;
};

export const getDatasetDownloadUrl = () => {
  return `${API_URL}/dataset-download`;
};
