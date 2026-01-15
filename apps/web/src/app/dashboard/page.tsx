"use client";

import { useSession } from "@/hooks/use-auth";

import { UserProgramList } from "./components/user-program-list";
import { AdminProgramList } from "./components/admin-program-list";
import { SuperadminView } from "./components/superadmin-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>;
    }

    // If no session, middleware should handle, but fallback:
    if (!session) {
        return <div className="flex h-screen items-center justify-center">Please log in.</div>;
    }

    const role = (session.user as any).role;
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
                <div className="grid gap-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">Active mentorship programs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">Awaiting review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">Registered on platform</p>
                            </CardContent>
                        </Card>
                    </div>

                    <AdminProgramList />
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight mb-4">Available Programs</h2>
                        <UserProgramList />
                    </div>
                </div>
            )}
        </main>
    );
}
