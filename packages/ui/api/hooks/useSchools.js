import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

// API Call Function
const registerSchoolApi = async (schoolData) => {
  const response = await apiClient.post('/auth/register', schoolData);
  return response.data;
};

// React Query Hook
export const useRegisterSchool = () => {
  return useMutation({
    mutationFn: registerSchoolApi
  });
};