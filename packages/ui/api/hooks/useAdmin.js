import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

const pendingSchoolsKey = ['pendingSchools'];
const tenantsKey = ['adminTenants'];

export const usePendingSchools = () => {
  return useQuery({
    queryKey: pendingSchoolsKey,
    queryFn: async () => {
      const response = await apiClient.get('/admin/schools/pending');
      return response.data.data;
    },
  });
};

export const useApproveSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schoolId) => {
      const response = await apiClient.post(`/admin/approve/${schoolId}`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingSchoolsKey });
      queryClient.invalidateQueries({ queryKey: tenantsKey });
    },
  });
};

export const useRejectSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schoolId, reason }) => {
      const response = await apiClient.post(`/admin/schools/${schoolId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingSchoolsKey });
    },
  });
};

export const useTenants = () => {
  return useQuery({
    queryKey: tenantsKey,
    queryFn: async () => {
      const response = await apiClient.get('/admin/tenants');
      return response.data.data;
    },
  });
};

export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, status, reason }) => {
      const response = await apiClient.patch(`/admin/tenants/${tenantId}/status`, {
        status,
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKey });
    },
  });
};
