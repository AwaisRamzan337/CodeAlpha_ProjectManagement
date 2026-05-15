import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const useApi = () => {
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const get = async (endpoint) => {
    const res = await axios.get(`${API_URL}${endpoint}`, { headers });
    return res.data;
  };

  const post = async (endpoint, data) => {
    const res = await axios.post(`${API_URL}${endpoint}`, data, { headers });
    return res.data;
  };

  const put = async (endpoint, data) => {
    const res = await axios.put(`${API_URL}${endpoint}`, data, { headers });
    return res.data;
  };

  const del = async (endpoint) => {
    const res = await axios.delete(`${API_URL}${endpoint}`, { headers });
    return res.data;
  };

  return { get, post, put, del };
};

export default useApi; 
