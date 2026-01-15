"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export function UserEnrollmentsList() {
    const { data: enrollments, isLoading } = useQuery({
        queryKey: ['my-enrollments'],
        queryFn: usersService.getMyEnrollments,
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!enrollments?.length) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">You haven't applied to any programs yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{enrollment.mentorshipProgram?.name}</CardTitle>
                            <StatusBadge status={enrollment.status} />
                        </div>
                        <CardDescription>
                            Applied on {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>
                                    {format(new Date(enrollment.mentorshipProgram.startDate), 'MMM d')} - {format(new Date(enrollment.mentorshipProgram.endDate), 'MMM d, yyyy')}
                                </span>
                            </div>

                            {enrollment.responses && enrollment.responses.length > 0 && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs font-medium mb-2 flex items-center">
                                        <FileText className="mr-1 h-3 w-3" />
                                        Your Responses ({enrollment.responses.length})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                                        {enrollment.responses.map(response => (
                                            <div key={response.id} className="bg-muted/50 p-2 rounded">
                                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                                    {response.formField.title}
                                                </p>
                                                <p className="text-xs break-words">
                                                    {response.textResponse ||
                                                        response.numberResponse ||
                                                        response.selectResponse ||
                                                        response.multiSelectResponse?.join(', ') ||
                                                        (response.fileResponse ? 'File uploaded' : '-')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
    };

    return (
        <Badge variant="secondary" className={styles[status as keyof typeof styles] || ""}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
