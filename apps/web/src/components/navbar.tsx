"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
    Navbar as HeroNavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
} from "@heroui/navbar";

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = [
        { name: "Programs", href: "/programs" },
        ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    ];

    return (
        <HeroNavbar onMenuOpenChange={setIsMenuOpen} maxWidth="xl" position="sticky">
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                <NavbarBrand>
                    <Link href="/" className="font-bold text-inherit text-xl">
                        MentorGain
                    </Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {navItems.map((item) => (
                    <NavbarItem key={item.href} isActive={pathname === item.href}>
                        <Link
                            href={item.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary font-bold" : "text-foreground"
                                }`}
                        >
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <ModeToggle />
                </NavbarItem>
                {session ? (
                    <NavbarItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                                        <AvatarFallback>{session.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                        <p className="text-xs capitalize text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded w-fit">
                                            {(session.user as any).role}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </NavbarItem>
                ) : (
                    <NavbarItem>
                        <Link href="/login">
                            <Button variant="default">Sign In</Button>
                        </Link>
                    </NavbarItem>
                )}
            </NavbarContent>

            <NavbarMenu>
                {navItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <Link
                            className={`w-full ${pathname === item.href ? "text-primary font-bold" : "text-foreground"
                                }`}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </HeroNavbar>
    );
}
