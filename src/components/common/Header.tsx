"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
    username: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/session/user", { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    setUser({ username: data.username });
                }
            } catch (err) {
                console.warn("Failed to fetch user:", err);
            }
        };
        loadUser();
    }, []);

    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
                <Link className="block text-teal-600" href="/">
                    <span className="sr-only">Home</span>
                    <svg
                        className="h-8"
                        viewBox="0 0 28 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0..."
                            fill="currentColor"
                        />
                    </svg>
                </Link>

                <div className="flex flex-1 items-center justify-end md:justify-between">
                    <nav aria-label="Global" className="hidden md:block">
                        <ul className="flex items-center gap-6 text-sm">
                            <li><Link className="text-gray-500 hover:text-gray-700" href="#">Services</Link></li>
                            <li><Link className="text-gray-500 hover:text-gray-700" href="#">Projects</Link></li>
                            <li><Link className="text-gray-500 hover:text-gray-700" href="#">Blog</Link></li>
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="sm:flex sm:items-center sm:gap-4">
                <span className="block rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-700">
                  {user.username}
                </span>
                                <Link
                                    href="/logout"
                                    className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
                                >
                                    Logout
                                </Link>
                            </div>
                        ) : (
                            <div className="sm:flex sm:items-center sm:gap-4">
                                <Link
                                    href="/login"
                                    className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-700 sm:block"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}