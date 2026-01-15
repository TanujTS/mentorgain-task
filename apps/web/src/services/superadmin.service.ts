import { apiClient } from "@/lib/api-client";
import { Program } from "./programs.service";
import { Enrollment } from "./enrollments.service";

export interface PlatformStats {
    users: {
        totalUsers: number;
        admins: number;
        superadmins: number;
    };
    programs: {
        totalPrograms: number;
        openPrograms: number;
        closedPrograms: number;
    };
    enrollments: {
        totalEnrollments: number;
        pending: number;
        accepted: number;
        rejected: number;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
    image?: string;
    createdAt: string;
}

export const superadminService = {
    getStats: async () => {
        const response = await apiClient.get<PlatformStats>('/superadmin/stats');
        return response.data;
    },

    listUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
        const response = await apiClient.get<{ data: User[], meta: any }>('/superadmin/users', { params });
        return response.data;
    },

    getUser: async (id: string) => {
        const response = await apiClient.get<User>(`/superadmin/users/${id}`);
        return response.data;
    },

    updateUserRole: async (id: string, role: 'user' | 'admin' | 'superadmin') => {
        const response = await apiClient.patch<User>(`/superadmin/users/${id}/role`, { role });
        return response.data;
    },

    listPrograms: async (params?: { page?: number; limit?: number; status?: string }) => {
        const response = await apiClient.get<{ data: Program[], meta: any }>('/superadmin/programs', { params });
        return response.data;
    },

    listEnrollments: async (params?: { page?: number; limit?: number; status?: string; programId?: string }) => {
        const response = await apiClient.get<{ data: Enrollment[], meta: any }>('/superadmin/enrollments', { params });
        return response.data;
    }
};
