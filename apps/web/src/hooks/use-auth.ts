import { authClient } from "@/lib/auth-client";

export const useSession = authClient.useSession;

export const signIn = async () => {
    return await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
    });
};

export const signOut = async () => {
    return await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = "/login";
            }
        }
    })
}
