"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending, error } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [isPending, session, router]);

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <button
                        onClick={async () => {
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/login");
                                    },
                                },
                            });
                        }}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                        <p className="mt-2 text-gray-600">
                            Welcome back, <span className="font-medium text-gray-900">{session.user.name}</span>!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="rounded-md bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-lg text-gray-900">{session.user.email}</p>
                        </div>
                        <div className="rounded-md bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-500">User ID</p>
                            <p className="mt-1 break-all text-lg text-gray-900">{session.user.id}</p>
                        </div>
                        <div className="rounded-md bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-500">Email Verified</p>
                            <p className="mt-1 text-lg text-gray-900">
                                {session.user.emailVerified ? (
                                    <span className="text-green-600">Yes</span>
                                ) : (
                                    <span className="text-yellow-600">No</span>
                                )}
                            </p>
                        </div>
                        <div className="rounded-md bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="mt-1 text-lg text-gray-900">
                                {new Date(session.user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
