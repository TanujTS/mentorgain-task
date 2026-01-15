import { createAuthClient } from "better-auth/react"
console.log(process.env.NEXT_PUBLIC_API_URL);
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL
})