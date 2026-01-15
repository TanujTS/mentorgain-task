"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `${process.env.NEXT_PUBLIC_WEB_URL}/dashboard`
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please sign in to continue.
                    </p>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleGoogleSignIn}
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.45c4.6667 0 7.9167-3.25 7.9167-7.95 0-.4167-.0334-.8167-.0834-1.2h-7.8333v2.85h4.4834c-.1834 1.15-.9334 2.85-3.35 4.5l-.0166.1166 2.4333 1.8834.1667.0166c2.6-2.4 4.1166-5.9333 4.1166-10.0333 0-1.15-.1-2.25-.2833-3.3h-10.7333v4.5h6.4166c-.6 3.0167-3.2333 5.3-6.4166 5.3-3.7167 0-6.7333-3.0167-6.7333-6.7333s3.0167-6.7333 6.7333-6.7333c1.7 0 3.25.6167 4.45 1.6333l3.3667-3.3667c-2.1167-1.9667-4.8834-3.1667-7.8167-3.1667-6.55 0-11.85 5.3-11.85 11.85s5.3 11.85 11.85 11.85z"
                                fill="#F2F2F2"
                            />
                            <path
                                d="M12.5167 14.2833c.4 2.2167-.3 4.5667-1.85 6.2667l-2.6-2c.9667-1.0833 1.4834-2.5833 1.45-4.2667h3z"
                                fill="#0E0E0E"
                            />
                            <path
                                d="M21.9167 11.3c.05.4.0833.8.0833 1.2 0 4.1-1.5167 7.6333-4.1167 10.0333l-2.6-1.9166c1.6167-1.2 2.7667-2.9834 3.1334-5.0167h3.5z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.2667 14.3333l-2.6 2.0167c1.4833 2.8833 4.35 4.95 7.7333 5.4833l1.85-6.2667c-1.9333-.3-3.6166-1.55-4.5166-3.1666l-2.4667 1.9333z"
                                fill="#28B446"
                            />
                            <path
                                d="M10.4 5.33333c1.7 0 3.25.61667 4.45 1.63337l3.3667-3.3667c-2.1167-1.96667-4.8834-3.16667-7.8167-3.16667-3.3833 0-6.25 2.06667-7.73333 4.95l2.48333 1.91667c.9-1.63334 2.5667-2.96667 4.5167-2.96667v1z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
