"use client";

import { useSession } from "@/hooks/use-auth";

import { useQuery } from "@tanstack/react-query";
import { programsService } from "@/services/programs.service";
import { UserEnrollmentsList } from "../../components/dashboard/user-enrollments-list";
import { AdminProgramList } from "../../components/dashboard/admin-program-list";
import { SuperadminView } from "../../components/dashboard/superadmin-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>;
    }

    if (!session) {
        return null;
    }


    const role = (session?.user as any)?.role;
    const isSuperAdmin = role === 'superadmin' || role === 'super_admin';
    const isAdmin = role === 'admin';

    return (
        <main className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {session.user.name}. Here is what is happening today.
                </p>
            </div>

            {isSuperAdmin ? (
                <SuperadminView />
            ) : isAdmin ? (
                <div className="space-y-8">
                    <AdminStatsView />
                    <AdminProgramList />
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight mb-4">Your Applications</h2>
                        <UserEnrollmentsList />
                    </div>
                </div>
            )}
        </main>
    );
}

function AdminStatsView() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: programsService.getStats,
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-10 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Programs</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalPrograms || 0}</div>
                    <p className="text-xs text-muted-foreground">Created by you</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingEnrollments || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting your review</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeEnrollments || 0}</div>
                    <p className="text-xs text-muted-foreground">Enrolled in your programs</p>
                </CardContent>
            </Card>
        </div>
    );
}
