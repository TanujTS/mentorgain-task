"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsService, Enrollment } from "@/services/enrollments.service";
import { Program } from "@/services/programs.service";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ManageProgramSheetProps {
    program: Program;
    children: React.ReactNode;
}

export function ManageProgramSheet({ program, children }: ManageProgramSheetProps) {
    const queryClient = useQueryClient();

    const { data: enrollments, isLoading } = useQuery({
        queryKey: ['program-enrollments', program.id],
        queryFn: () => enrollmentsService.getByProgram(program.id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'accept' | 'reject' }) =>
            status === 'accept' ? enrollmentsService.accept(id) : enrollmentsService.reject(id),
        onSuccess: () => {
            toast.success("Status Updated");
            queryClient.invalidateQueries({ queryKey: ['program-enrollments', program.id] });
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const pendingEnrollments = enrollments?.filter(e => e.status === 'pending') || [];
    const processedEnrollments = enrollments?.filter(e => e.status !== 'pending') || [];

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl flex flex-col h-full" side="right">
                <SheetHeader>
                    <SheetTitle>Manage {program.name}</SheetTitle>
                    <SheetDescription>
                        Review applications and manage enrollments.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex-1 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-medium mb-2">Applications ({enrollments?.length || 0})</h3>

                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 pr-4">
                            <Accordion type="single" collapsible className="w-full">
                                {pendingEnrollments.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Pending Review</h4>
                                        {pendingEnrollments.map((enrollment) => (
                                            <EnrollmentItem
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                program={program}
                                                onAccept={() => updateStatusMutation.mutate({ id: enrollment.id, status: 'accept' })}
                                                onReject={() => updateStatusMutation.mutate({ id: enrollment.id, status: 'reject' })}
                                                isPending={updateStatusMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                )}

                                {processedEnrollments.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Processed</h4>
                                        {processedEnrollments.map((enrollment) => (
                                            <EnrollmentItem
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                program={program}
                                                readOnly
                                            />
                                        ))}
                                    </div>
                                )}

                                {enrollments?.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No applications received yet.
                                    </div>
                                )}
                            </Accordion>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function EnrollmentItem({
    enrollment,
    program,
    onAccept,
    onReject,
    readOnly,
    isPending
}: {
    enrollment: Enrollment;
    program: Program;
    onAccept?: () => void;
    onReject?: () => void;
    readOnly?: boolean;
    isPending?: boolean;
}) {
    return (
        <AccordionItem value={enrollment.id} className="border-b-0 mb-2 border rounded-md px-3 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3 w-full text-left">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{enrollment.user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{enrollment.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.user?.email}</p>
                    </div>
                    <Badge variant={
                        enrollment.status === 'accepted' ? 'default' :
                            enrollment.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                        {enrollment.status}
                    </Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pt-2 pb-4">
                    {/* Form Responses */}
                    <div className="space-y-3">
                        {program.formFields?.sort((a, b) => a.order - b.order).map((field) => {
                            const response = enrollment.responses?.find(r => r.formFieldId === field.id);
                            let displayValue = "-";

                            if (response) {
                                if (response.textResponse) displayValue = response.textResponse;
                                else if (response.numberResponse !== undefined) displayValue = String(response.numberResponse);
                                else if (response.selectResponse) displayValue = response.selectResponse;
                                else if (response.multiSelectResponse) displayValue = response.multiSelectResponse.join(", ");
                                else if (response.fileResponse) displayValue = response.fileResponse; // Should be a link
                            }

                            return (
                                <div key={field.id} className="text-sm">
                                    <p className="font-medium text-muted-foreground text-xs mb-1">{field.title}</p>
                                    <div className="p-2 bg-muted/30 rounded-md">
                                        {field.fieldType === 'file' && response?.fileResponse ? (
                                            <a href={response.fileResponse} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                <Download className="mr-2 h-3 w-3" /> Download File
                                            </a>
                                        ) : (
                                            displayValue
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {!readOnly && (
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={(e) => { e.stopPropagation(); onReject?.(); }}
                                disabled={isPending}
                            >
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
                                disabled={isPending}
                            >
                                <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
