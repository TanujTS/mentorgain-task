"use client";

import { useQuery } from "@tanstack/react-query";
import { superadminService } from "@/services/superadmin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "./users-table";
import { SuperadminProgramList } from "./superadmin-program-list";
import { SuperadminEnrollmentsList } from "./superadmin-enrollments-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperadminView() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: superadminService.getStats,
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.users.totalUsers || 0}</div>}
                        <p className="text-xs text-muted-foreground">Registered on platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.programs.totalPrograms || 0}</div>}
                        <p className="text-xs text-muted-foreground">Active mentorship programs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.enrollments.totalEnrollments || 0}</div>}
                        <p className="text-xs text-muted-foreground">Applications submitted</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                    <TabsTrigger value="programs">Manage Programs</TabsTrigger>
                    <TabsTrigger value="enrollments">View Enrollments</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UsersTable />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="programs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Programs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SuperadminProgramList />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="enrollments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SuperadminEnrollmentsList />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
