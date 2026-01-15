"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programsService } from "@/services/programs.service";
import { ProgramCard } from "./program-card";
import { CreateProgramDialog } from "./create-program-dialog";
import { EditProgramDialog } from "./edit-program-dialog";
import { ManageProgramSheet } from "./manage-program-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Program } from "@/services/programs.service";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminProgramList() {
    const queryClient = useQueryClient();
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: programs, isLoading } = useQuery({
        queryKey: ['programs', 'mine'],
        queryFn: programsService.getMyPrograms,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => programsService.delete(id),
        onSuccess: () => {
            toast.success("Program deleted");
            queryClient.invalidateQueries({ queryKey: ['programs'] });
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
            <div className="space-y-4">
                <Skeleton className="h-10 w-[200px]" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[250px] w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Your Programs</h2>
                <CreateProgramDialog>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Program
                    </Button>
                </CreateProgramDialog>
            </div>

            {!programs?.length ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground mb-4">You haven't created any programs yet.</p>
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
