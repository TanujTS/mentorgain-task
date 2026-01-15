import { apiClient } from "@/lib/api-client";
import { Enrollment } from "./enrollments.service";

export const usersService = {
    getMyEnrollments: async () => {
        const response = await apiClient.get<Enrollment[]>('/users/me/enrollments');
        return response.data;
    },

    // Placeholder for profile
    getMe: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    }
};
