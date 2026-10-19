import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

export const useSetupPassword = () => {
  return useMutation({
    mutationFn: async (data) => {
      // data should be { token, newPassword }
      const response = await apiClient.post('/auth/setup-password', data);
      return response.data;
    }
  });
};



export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      // credentials = { email, password }
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async ({ email }) => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
  });
};