import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Enrollment } from "@repo/shared";

const QUERY_KEYS = {
    all: ["enrollments"],
    byProgram: (programId: string) => ["enrollments", "program", programId],
    detail: (id: string) => ["enrollments", id],
};

// --- Queries ---

export const useEnrollments = (programId?: string) => {
    return useQuery({
        queryKey: programId ? QUERY_KEYS.byProgram(programId) : QUERY_KEYS.all,
        queryFn: async () => {
            const params = programId ? { programId } : {};
            const { data } = await apiClient.get<Enrollment[]>("/enrollments", { params });
            return data;
        },
    });
};

export const useEnrollment = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.detail(id),
        queryFn: async () => {
            const { data } = await apiClient.get<Enrollment>(`/enrollments/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// --- Mutations ---

export const useCreateEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (enrollmentData: Partial<Enrollment>) => {
            const { data } = await apiClient.post<Enrollment>("/enrollments", enrollmentData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
        },
    });
};

export const useWithdrawEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/enrollments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
        },
    });
};

export const useAcceptEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.put<Enrollment>(`/enrollments/${id}/accept`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
        }
    })
}

export const useRejectEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.put<Enrollment>(`/enrollments/${id}/reject`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
        }
    })
}
