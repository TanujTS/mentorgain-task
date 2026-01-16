"use client";

import { useQuery } from "@tanstack/react-query";
import { programsService } from "@/services/programs.service";
import { UserProgramList } from "../../components/dashboard/user-program-list";
import { Navbar } from "@/components/navbar";

export default function ProgramsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="container mx-auto py-8 px-4 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Mentorship Programs</h1>
                    <p className="text-muted-foreground">
                        Browse and apply to our available mentorship programs.
                    </p>
                </div>

                <UserProgramList />
            </main>
        </div>
    );
}
