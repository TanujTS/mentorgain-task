"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-auth";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-black flex flex-col items-center justify-center">
      {/* Background Grid - Light Mode */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: "#ffffff",
          backgroundImage: `
            radial-gradient(circle, rgba(0, 0, 0, 0.2) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />
      {/* Background Grid - Dark Mode */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: "#000000",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />

      <div className="z-10 text-center px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
          Empowering Growth Through <span className="text-primary">Mentorship</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with industry experts, accelerate your career, and unlock your full potential with Mentorgain's structured mentorship programs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session ? (
            <>
              <Link href="/programs">
                <Button size="lg" className="rounded-full px-8 text-base">
                  Browse Programs
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base bg-background/50 backdrop-blur-sm">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8 text-base">
                Sign In to Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
