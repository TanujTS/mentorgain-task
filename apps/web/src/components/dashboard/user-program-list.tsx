"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programsService } from "@/services/programs.service";
import { enrollmentsService } from "@/services/enrollments.service";
import { ProgramCard } from "../programs/program-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DynamicForm } from "@/components/dynamic-form";

export function UserProgramList() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    // Fetch all programs
    const { data: programs, isLoading: isLoadingPrograms } = useQuery({
        queryKey: ['programs'],
        queryFn: programsService.getAll,
    });

    // Fetch user's enrollments to check status
    const { data: myEnrollments, isLoading: isLoadingEnrollments } = useQuery({
        queryKey: ['my-enrollments'],
        queryFn: () => enrollmentsService.getAll(),
        enabled: !!session,
    });

    const applyMutation = useMutation({
        mutationFn: enrollmentsService.apply,
        onSuccess: () => {
            toast.success("Application Submitted", {
                description: "You have successfully applied to the program.",
            });
            queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
        },
        onError: (error) => {
            toast.error("Application Failed", {
                description: "Something went wrong. Please try again.",
            });
        }
    });

    if (isLoadingPrograms || isLoadingEnrollments) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[250px] w-full" />
                ))}
            </div>
        );
    }

    if (!programs?.length) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No programs available at the moment.
            </div>
        );
    }

    const getEnrollmentStatus = (programId: string) => {
        const enrollment = myEnrollments?.find(e => e.mentorshipProgramId === programId);
        return enrollment?.status;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
                const status = getEnrollmentStatus(program.id);
                const isApplied = !!status;

                const role = (session?.user as any)?.role;
                const isAdmin = role === 'admin' || role === 'superadmin';

                return (
                    <ProgramCard
                        key={program.id}
                        program={program}
                        action={
                            isAdmin ? (
                                <Button className="w-full" disabled variant="secondary">
                                    Admins cannot apply
                                </Button>
                            ) : isApplied ? (
                                <Button className="w-full" disabled variant="outline">
                                    {status === 'accepted' ? 'Enrolled' : status === 'rejected' ? 'Application Rejected' : 'Application Pending'}
                                </Button>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" disabled={program.status === 'closed'}>
                                            {program.status === 'closed' ? 'Closed' : 'Apply Now'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Apply to {program.name}</DialogTitle>
                                            <DialogDescription>
                                                Please fill out the form below to apply for this program.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            {program.formFields && program.formFields.length > 0 ? (
                                                <DynamicForm
                                                    fields={program.formFields}
                                                    isLoading={applyMutation.isPending}
                                                    onSubmit={(responses) => {
                                                        applyMutation.mutate({
                                                            mentorshipProgramId: program.id,
                                                            responses
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    <p>Are you sure you want to apply?</p>
                                                    <Button
                                                        onClick={() => applyMutation.mutate({ mentorshipProgramId: program.id })}
                                                        disabled={applyMutation.isPending}
                                                    >
                                                        {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Confirm Application
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )
                        }
                    />
                );
            })}
        </div >
    );
}
