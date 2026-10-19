import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users');
      return response.data.data;
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      const response = await apiClient.post('/users', input);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, permissions }) => {
      const response = await apiClient.put(`/users/${userId}/permissions`, { permissions });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status, reason }) => {
      const response = await apiClient.patch(`/users/${userId}/status`, { status, reason });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useLinkUserStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, staffId }) => {
      const response = await apiClient.patch(`/users/${userId}/staff-link`, {
        staffId: staffId || null,
      });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useRevokeUserSessions() {
  return useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.post(`/users/${userId}/revoke-sessions`);
      return response.data.data;
    },
  });
}
