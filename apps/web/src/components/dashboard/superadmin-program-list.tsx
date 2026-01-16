"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superadminService } from "@/services/superadmin.service";
import { programsService, Program } from "@/services/programs.service";
import { ProgramCard } from "../programs/program-card";
import { EditProgramDialog } from "../programs/edit-program-dialog";
import { ManageProgramSheet } from "../programs/manage-program-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SuperadminProgramList() {
    const queryClient = useQueryClient();
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['superadmin-programs'],
        queryFn: () => superadminService.listPrograms({ limit: 100 }), // Fetch all for now
    });

    const programs = data?.data || [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => programsService.delete(id),
        onSuccess: () => {
            toast.success("Program deleted");
            queryClient.invalidateQueries({ queryKey: ['superadmin-programs'] });
        },
        onError: () => {
            toast.error("Failed to delete program");
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (program: Program) => {
        setEditingProgram(program);
        setIsEditOpen(true);
    };

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[250px] w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!programs.length ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No programs found on the platform.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {programs.map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            action={
                                <div className="flex gap-2 w-full">
                                    <ManageProgramSheet program={program}>
                                        <Button variant="outline" className="flex-1">
                                            Manage
                                        </Button>
                                    </ManageProgramSheet>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(program)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(program.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}

            {editingProgram && (
                <EditProgramDialog
                    program={editingProgram}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            )}
        </div>
    );
}
