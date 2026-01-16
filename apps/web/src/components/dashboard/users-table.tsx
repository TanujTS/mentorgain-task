"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superadminService, User } from "@/services/superadmin.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-auth";

export function UsersTable() {
    const [search, setSearch] = useState("");
    const { data: currentUser } = useSession();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['users', search],
        queryFn: () => superadminService.listUsers({ search, limit: 100 }), // Simple client-side search/limit for now
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string, role: 'user' | 'admin' | 'superadmin' }) => superadminService.updateUserRole(id, role),
        onSuccess: () => {
            toast.success("User role updated");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            toast.error("Failed to update role");
        }
    });

    const users = data?.data || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'superadmin' ? 'destructive' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copy User ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                {currentUser?.user?.id === user.id ? (
                                                    <div className="px-2 py-1.5 text-sm text-muted-foreground text-xs italic">
                                                        You cannot change your own role
                                                    </div>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'user' })}>
                                                            Set as User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })}>
                                                            Set as Admin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'superadmin' })}>
                                                            Set as Superadmin
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-xs text-muted-foreground">Showing {users.length} users</span>
            </div>
        </div>
    );
}
