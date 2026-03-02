import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'NATIONAL' | 'REGIONAL' | 'COMPANY';
  isOptional: boolean;
  year: number;
  description: string | null;
}

export function useHolidays(year?: number) {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      const params = year ? `?year=${year}` : '';
      const response = await api.get<{ data: Holiday[] }>(`/api/holidays${params}`);
      return response.data;
    },
  });
}

export function useUpcomingHolidays() {
  return useQuery({
    queryKey: ['holidays', 'upcoming'],
    queryFn: async () => {
      const response = await api.get<{ data: Holiday[] }>('/api/holidays/upcoming');
      return response.data;
    },
  });
}
