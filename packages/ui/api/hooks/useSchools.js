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
    mutationFn: registerSchoolApi,
    onSuccess: (data) => {
      // You can trigger toast notifications here!
      console.log('Registration Successful:', data.message);
    },
    onError: (error) => {
      console.error('Registration Failed:', error.response?.data?.message || error.message);
    }
  });
};