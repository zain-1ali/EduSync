import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axiosClient';

// Fetch all pending applications
export const usePendingSchools = () => {
  return useQuery({
    queryKey: ['pendingSchools'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/schools/pending'); // Adjust path to match your Express router
      return response.data.data; 
    }
  });
};

// Approve a school
export const useApproveSchool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schoolId) => {
      const response = await apiClient.post(`/admin/approve/${schoolId}`);
      return response.data;
    },
    onSuccess: () => {
      // This tells React Query to automatically re-fetch the list so the approved school disappears!
      queryClient.invalidateQueries({ queryKey: ['pendingSchools'] });
    }
  });
};