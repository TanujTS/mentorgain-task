import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/10">
            <Navbar />
            <div className="container mx-auto py-8 px-4 space-y-8">
                {children}
            </div>
        </div>
    );
}
