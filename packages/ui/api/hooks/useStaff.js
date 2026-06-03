import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffData) => {
      const response = await apiClient.post('/staff', staffData); // Adjust path to match your Express router
      return response.data;
    },
    onSuccess: () => {
      // Automatically refresh the staff list table after a successful add
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    }
  });
};


export const useUpdateStaffStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch(`/staff/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    }
  });
}



export const useStaffList = (filters = {}) => {
  return useQuery({
    // Adding filters to the queryKey means React Query will automatically 
    // re-fetch the data from the backend anytime a user types in the search box!
    queryKey: ['staff', filters],
    queryFn: async () => {
      // Convert { role: 'admin', search: 'john' } into "?role=admin&search=john"
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
const queryString = params.toString();
const url = queryString ? `/staff?${queryString}` : '/staff';
      const response = await apiClient.get(url);
      return response.data.data;
    }
  });
};

// 2. Fetch the top card metrics
export const useStaffStats = () => {
  return useQuery({
    queryKey: ['staffStats'],
    queryFn: async () => {
      const response = await apiClient.get('/staff/stats');
      return response.data.data;
    }
  });
};