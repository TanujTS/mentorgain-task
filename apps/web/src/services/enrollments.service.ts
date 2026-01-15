import { apiClient } from "@/lib/api-client";
import { Program } from "./programs.service";

export interface Enrollment {
    id: string;
    userId: string;
    mentorshipProgramId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
    mentorshipProgram?: Program;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    responses?: FormResponse[];
}

export interface FormResponse {
    id: string;
    enrollmentId: string;
    formFieldId: string;
    textResponse?: string;
    numberResponse?: number;
    selectResponse?: string;
    multiSelectResponse?: string[];
    fileResponse?: string;
    formField: {
        id: string;
        title: string;
        description: string | null;
        fieldType: string;
        options: string[] | null;
    };
}

export interface CreateEnrollmentDto {
    mentorshipProgramId: string;
    responses?: {
        formFieldId: string;
        textResponse?: string;
        numberResponse?: number;
        selectResponse?: string;
        multiSelectResponse?: string[];
        fileResponse?: string;
    }[];
}

export const enrollmentsService = {
    // List enrollments (filtered by role automatically by backend, or by optional programId)
    getAll: async (programId?: string) => {
        const params = programId ? { programId } : {};
        const response = await apiClient.get<Enrollment[]>('/enrollments', { params });
        return response.data;
    },

    // Admin/Superadmin: List enrollments for a specific program
    getByProgram: async (programId: string) => {
        const response = await apiClient.get<Enrollment[]>(`/enrollments/program/${programId}`);
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get<Enrollment>(`/enrollments/${id}`);
        return response.data;
    },

    apply: async (data: CreateEnrollmentDto) => {
        const response = await apiClient.post<Enrollment>('/enrollments', data);
        return response.data;
    },

    withdraw: async (id: string) => {
        const response = await apiClient.delete(`/enrollments/${id}`);
        return response.data;
    },

    accept: async (id: string) => {
        const response = await apiClient.put<Enrollment>(`/enrollments/${id}/accept`);
        return response.data;
    },

    reject: async (id: string) => {
        const response = await apiClient.put<Enrollment>(`/enrollments/${id}/reject`);
        return response.data;
    }
};
