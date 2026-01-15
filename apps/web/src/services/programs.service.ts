import { apiClient } from "@/lib/api-client";

export interface Program {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    status: 'open' | 'closed';
    createdAt: string;
    updatedAt: string;
    // creator populated
    creator?: {
        name: string;
        email: string;
    };
    // formFields populated
    formFields?: FormField[];
}

export interface FormField {
    id: string;
    title: string;
    description?: string;
    fieldType: 'text' | 'number' | 'select' | 'multi_select' | 'file';
    options?: string[];
    isRequired: boolean;
    order: number;
}

export interface CreateProgramDto {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    formFields?: Partial<FormField>[];
}

export type UpdateProgramDto = Partial<CreateProgramDto>;

export const programsService = {
    getAll: async () => {
        const response = await apiClient.get<Program[]>('/programs');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get<Program>(`/programs/${id}`);
        return response.data;
    },

    create: async (data: CreateProgramDto) => {
        const response = await apiClient.post<Program>('/programs', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProgramDto) => {
        const response = await apiClient.put<Program>(`/programs/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/programs/${id}`);
        return response.data;
    }
};
