export type Role = 'user' | 'admin' | 'superadmin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MentorshipProgramStatus = 'open' | 'closed';

export interface MentorshipProgram {
    id: string;
    name: string;
    description: string;
    startDate: Date | string; // Dates often come as strings from JSON API
    endDate: Date | string;
    maxParticipants: number;
    status: MentorshipProgramStatus;
    createdBy: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type FieldType = 'text' | 'number' | 'select' | 'multi_select' | 'file';

export interface FormField {
    id: string;
    mentorshipProgramId: string;
    title: string;
    description?: string | null;
    fieldType: FieldType;
    options?: string[] | null;
    isRequired: boolean;
    order: number;
}

export type EnrollmentStatus = 'pending' | 'accepted' | 'rejected';

export interface Enrollment {
    id: string;
    userId: string;
    mentorshipProgramId: string;
    status: EnrollmentStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
}
