import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { MentorshipProgram } from "@repo/shared";

const QUERY_KEYS = {
    all: ["programs"],
    detail: (id: string) => ["programs", id],
};

// --- Queries ---

export const usePrograms = () => {
    return useQuery({
        queryKey: QUERY_KEYS.all,
        queryFn: async () => {
            const { data } = await apiClient.get<MentorshipProgram[]>("/programs");
            return data;
        },
    });
};

export const useProgram = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.detail(id),
        queryFn: async () => {
            const { data } = await apiClient.get<MentorshipProgram>(`/programs/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// --- Mutations ---

export const useCreateProgram = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newProgram: Partial<MentorshipProgram>) => {
            const { data } = await apiClient.post<MentorshipProgram>("/programs", newProgram);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
        },
    });
};

export const useUpdateProgram = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...program }: Partial<MentorshipProgram> & { id: string }) => {
            const { data } = await apiClient.put<MentorshipProgram>(`/programs/${id}`, program);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
        },
    });
};

export const useDeleteProgram = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/programs/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
        },
    });
};
