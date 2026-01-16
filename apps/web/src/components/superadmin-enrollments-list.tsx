"use client";

import { useQuery } from "@tanstack/react-query";
import { superadminService } from "@/services/superadmin.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function SuperadminEnrollmentsList() {
    const { data, isLoading } = useQuery({
        queryKey: ['superadmin-enrollments'],
        queryFn: () => superadminService.listEnrollments({ limit: 100 }),
    });

    const enrollments = data?.data || [];

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            </TableRow>
                        ))
                    ) : enrollments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No enrollments found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{enrollment.user?.name || 'Unknown User'}</span>
                                        <span className="text-xs text-muted-foreground">{enrollment.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {enrollment.mentorshipProgram?.name || 'Unknown Program'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        enrollment.status === 'accepted' ? 'default' :
                                            enrollment.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {enrollment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(enrollment.createdAt), 'PPP')}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
